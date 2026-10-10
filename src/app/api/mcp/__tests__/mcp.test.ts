import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { emptyScript } from '@/features/practice/editing';

type Row = Record<string, unknown>;
let rows: Row[] = [];
let nextId = 1;
const mkId = () => `00000000-0000-4000-8000-${String(nextId++).padStart(12, '0')}`;

/** A tiny in-memory stand-in for the service-role client: honours .eq() filters, so owner scoping is really tested. */
function table() {
  let op: 'select' | 'insert' | 'update' = 'select';
  let payload: Row = {};
  const filters: [string, unknown][] = [];
  let max = Infinity;
  const matches = () => rows.filter((r) => filters.every(([k, v]) => r[k] === v));
  const run = () => {
    if (op === 'insert') {
      const row = { id: mkId(), updated_at: new Date().toISOString(), ...payload };
      rows.push(row);
      return [row];
    }
    const hit = matches();
    if (op === 'update') hit.forEach((r) => Object.assign(r, payload));
    return hit.slice(0, max);
  };
  const q: Record<string, unknown> = {
    insert: (p: Row) => ((op = 'insert'), (payload = p), q),
    update: (p: Row) => ((op = 'update'), (payload = p), q),
    select: () => q,
    eq: (k: string, v: unknown) => (filters.push([k, v]), q),
    order: () => q,
    limit: (n: number) => ((max = n), q),
    single: async () => ({ data: run()[0] ?? null, error: null }),
    maybeSingle: async () => ({ data: run()[0] ?? null, error: null }),
    then: (resolve: (v: unknown) => unknown) => resolve({ data: run(), error: null }),
  };
  return q;
}

vi.mock('@/lib/supabase/admin', () => ({ createSupabaseAdminClient: () => ({ from: () => table() }) }));
vi.mock('@/lib/server/personal-tokens', () => ({
  verifyPersonalToken: vi.fn(async (t: string) => (t === 'ca_pat_alice' ? 'alice' : t === 'ca_pat_bob' ? 'bob' : null)),
}));
vi.mock('@/lib/server/auth', () => ({
  requireNotBanned: vi.fn(async () => null),
  requireAgeConfirmed: vi.fn(async () => null),
}));
vi.mock('@/lib/server/rate-limit', () => ({
  checkRateLimit: vi.fn(async () => ({ allowed: true, remaining: 1, resetAt: new Date() })),
  getRateLimitHeaders: () => ({}),
}));

import { GET, POST } from '../route';
import { checkRateLimit } from '@/lib/server/rate-limit';

const script = {
  ...emptyScript(),
  title: 'Script title',
  markers: [{ id: 'a1', kind: 'attacker' }],
  base: { placements: [{ marker: 'a1', cell: { x: 0, y: 0 } }], moves: [], passes: [], commentary: { points: [] } },
};

const rpc = (body: unknown, token: string | null = 'ca_pat_alice') =>
  POST(
    new NextRequest('http://localhost/api/mcp', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: token ? { authorization: `Bearer ${token}` } : {},
    })
  );
const call = async (name: string, args: unknown, token?: string) => {
  const res = await rpc({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name, arguments: args } }, token);
  const json = await res.json();
  const result = json.result;
  const text: string = result.content[0].text;
  return { result, text, isError: result.isError === true };
};

beforeEach(() => {
  rows = [];
  nextId = 1;
  vi.mocked(checkRateLimit).mockResolvedValue({ allowed: true, remaining: 1, resetAt: new Date() });
});

describe('protocol', () => {
  it('initialize echoes the protocol version and advertises tools', async () => {
    const res = await rpc({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-03-26' } });
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('application/json');
    const json = await res.json();
    expect(json.result.protocolVersion).toBe('2025-03-26');
    expect(json.result.capabilities).toEqual({ tools: {} });
    expect(json.result.serverInfo.name).toBe('coaching-animator');
  });

  it('notifications/initialized returns 202 with no body', async () => {
    const res = await rpc({ jsonrpc: '2.0', method: 'notifications/initialized' });
    expect(res.status).toBe(202);
    expect(await res.text()).toBe('');
  });

  it('ping works and unknown methods return -32601', async () => {
    expect((await (await rpc({ jsonrpc: '2.0', id: 1, method: 'ping' })).json()).result).toEqual({});
    const json = await (await rpc({ jsonrpc: '2.0', id: 2, method: 'nope' })).json();
    expect(json.error.code).toBe(-32601);
  });

  it('tools/list returns exactly the four tools, none that delete or publish', async () => {
    const json = await (await rpc({ jsonrpc: '2.0', id: 1, method: 'tools/list' })).json();
    const names = json.result.tools.map((t: { name: string }) => t.name);
    expect(names).toEqual(['create_practice', 'get_practice', 'update_practice', 'list_my_practices']);
    for (const t of json.result.tools) {
      expect(t.inputSchema.type).toBe('object');
      expect(t.inputSchema.properties.visibility).toBeUndefined();
    }
  });

  it('answers a batch', async () => {
    const res = await rpc([
      { jsonrpc: '2.0', id: 1, method: 'ping' },
      { jsonrpc: '2.0', method: 'notifications/initialized' },
      { jsonrpc: '2.0', id: 2, method: 'tools/list' },
    ]);
    const json = await res.json();
    expect(json).toHaveLength(2);
  });

  it('GET is 405', async () => {
    expect((await GET()).status).toBe(405);
  });

  it('an unknown tool is a protocol error', async () => {
    const json = await (await rpc({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'delete_practice', arguments: {} } })).json();
    expect(json.error.code).toBe(-32602);
  });
});

describe('auth and rate limit', () => {
  const ping = { jsonrpc: '2.0', id: 1, method: 'ping' };

  it('refuses a missing token', async () => {
    const res = await rpc(ping, null);
    expect(res.status).toBe(401);
    expect((await res.json()).error).toBeTruthy();
  });

  it('refuses an invalid or revoked token', async () => {
    const res = await rpc(ping, 'ca_pat_revoked');
    expect(res.status).toBe(401);
    expect((await res.json()).error.code).toBe(-32001);
  });

  it('refuses a token that is not a personal token', async () => {
    expect((await rpc(ping, 'sb_something')).status).toBe(401);
  });

  it('refuses when the rate limit is exceeded, keyed by the token owner', async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({ allowed: false, remaining: 0, resetAt: new Date() });
    const res = await rpc(ping);
    expect(res.status).toBe(429);
    expect(checkRateLimit).toHaveBeenCalledWith('mcp:alice', 'mcp');
  });
});

describe('create_practice', () => {
  it('saves a private Practice with Tags and Source, and returns the editor link', async () => {
    const { text, isError } = await call('create_practice', {
      script,
      title: 'My drill',
      tags: ['Attack'],
      source: { url: 'https://example.com/v', title: 'A video' },
    });
    expect(isError).toBe(false);
    const out = JSON.parse(text);
    expect(out.visibility).toBe('private');
    expect(out.link).toBe(`https://coaching-animator.waynetellis.com/practice?id=${out.id}`);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      owner_id: 'alice',
      visibility: 'private',
      title: 'My drill',
      tags: ['Attack'],
      source_url: 'https://example.com/v',
      source_title: 'A video',
    });
  });

  it('defaults the title to the script title', async () => {
    await call('create_practice', { script });
    expect(rows[0].title).toBe('Script title');
  });

  it('cannot create a public or link Practice', async () => {
    await call('create_practice', { script, visibility: 'public' });
    await call('create_practice', { script, visibility: 'link' });
    expect(rows.map((r) => r.visibility)).toEqual(['private', 'private']);
  });

  it('returns formatError text for an invalid script and saves nothing', async () => {
    const { text, isError } = await call('create_practice', { script: { ...script, markers: 'nope' } });
    expect(isError).toBe(true);
    expect(text).toContain('The Practice Script is not valid');
    expect(text).toContain('markers');
    expect(rows).toHaveLength(0);
  });

  it('rejects an unknown Tag', async () => {
    const { isError } = await call('create_practice', { script, tags: ['Made up'] });
    expect(isError).toBe(true);
    expect(rows).toHaveLength(0);
  });
});

describe('get_practice', () => {
  const seed = async (token = 'ca_pat_alice') => JSON.parse((await call('create_practice', { script, title: 'T', tags: ['Attack'] }, token)).text).id as string;

  it('reads by id, by /p/ link and by editor link', async () => {
    const id = await seed();
    for (const input of [id, `https://coaching-animator.waynetellis.com/p/${id}`, `/practice?id=${id}`]) {
      const { text, isError } = await call('get_practice', { id: input });
      expect(isError).toBe(false);
      const out = JSON.parse(text);
      expect(out).toMatchObject({ id, title: 'T', tags: ['Attack'], visibility: 'private' });
      expect(out.script).toEqual(script);
      expect(out.link).toContain(id);
    }
  });

  it("does not find another Coach's Practice, even by exact id", async () => {
    const id = await seed('ca_pat_bob');
    const { text, isError } = await call('get_practice', { id });
    expect(isError).toBe(true);
    expect(text).toBe('Practice not found');
  });

  it('does not find a made-up id', async () => {
    expect((await call('get_practice', { id: 'not-an-id' })).isError).toBe(true);
  });
});

describe('update_practice', () => {
  const seed = async (token = 'ca_pat_alice') => JSON.parse((await call('create_practice', { script, title: 'T' }, token)).text).id as string;

  it('updates script, title, tags and source, and never changes visibility', async () => {
    const id = await seed();
    rows[0].visibility = 'public'; // the Coach published it in the editor
    const changed = { ...script, title: 'Changed' };
    const { isError } = await call('update_practice', {
      id,
      script: changed,
      title: 'New',
      tags: ['Defence'],
      source: { url: 'https://example.com/x', title: 'X' },
      visibility: 'private',
    });
    expect(isError).toBe(false);
    expect(rows[0]).toMatchObject({ title: 'New', tags: ['Defence'], source_url: 'https://example.com/x', script: changed, visibility: 'public' });
  });

  it('returns formatError text for an invalid script and leaves the Practice alone', async () => {
    const id = await seed();
    const { text, isError } = await call('update_practice', { id, script: { ...script, markers: 'nope' } });
    expect(isError).toBe(true);
    expect(text).toContain('markers');
    expect(rows[0].script).toEqual(script);
  });

  it("does not find or change another Coach's Practice", async () => {
    const id = await seed('ca_pat_bob');
    const { text, isError } = await call('update_practice', { id, title: 'Hijacked' });
    expect(isError).toBe(true);
    expect(text).toBe('Practice not found');
    expect(rows[0].title).toBe('T');
  });
});

describe('list_my_practices', () => {
  it("lists only the caller's Practices with links, honouring limit", async () => {
    await call('create_practice', { script, title: 'A1' });
    await call('create_practice', { script, title: 'A2' });
    await call('create_practice', { script, title: 'B1' }, 'ca_pat_bob');
    const { text } = await call('list_my_practices', {});
    const out = JSON.parse(text);
    expect(out.practices.map((p: { title: string }) => p.title).sort()).toEqual(['A1', 'A2']);
    expect(out.practices[0].link).toContain('/practice?id=');
    expect(out.practices[0]).toHaveProperty('updated_at');
    expect(JSON.parse((await call('list_my_practices', { limit: 1 })).text).practices).toHaveLength(1);
  });
});
