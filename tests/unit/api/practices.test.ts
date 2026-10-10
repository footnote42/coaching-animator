import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import passingSquare from '@/features/practice/examples/passing-square.json';
import passingSquareProgressions from '@/features/practice/examples/passing-square-progressions.json';

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  requireNotBanned: vi.fn(),
  checkRateLimit: vi.fn(),
  from: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock('@/lib/server/auth', () => ({
  requireAuth: mocks.requireAuth,
  requireNotBanned: mocks.requireNotBanned,
  requireAgeConfirmed: vi.fn(async () => null),
  isAuthError: (r: unknown) => r instanceof NextResponse,
}));
vi.mock('@/lib/server/rate-limit', () => ({
  checkRateLimit: mocks.checkRateLimit,
  getRateLimitHeaders: () => ({}),
}));
vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: async () => ({ from: mocks.from, rpc: mocks.rpc }),
}));

import { GET, POST } from '@/app/api/practices/route';
import { GET as GET_ONE, PATCH, DELETE } from '@/app/api/practices/[id]/route';
import { GET as GET_PUBLIC } from '@/app/api/practices/public/route';

const user = { id: 'user-1' };
const unauthorized = () => NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 });

function post(body: unknown) {
  return new NextRequest('http://localhost/api/practices', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/** Chainable query-builder stub that resolves to `result` at any terminal call. */
function builder(result: unknown) {
  const b: Record<string, unknown> = {};
  for (const m of ['select', 'insert', 'update', 'delete', 'eq', 'order', 'range', 'ilike', 'contains', 'in']) b[m] = vi.fn(() => b);
  b.single = vi.fn(async () => result);
  b.maybeSingle = vi.fn(async () => result);
  b.then = (resolve: (v: unknown) => unknown) => resolve(result);
  return b;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireAuth.mockResolvedValue(user);
  mocks.requireNotBanned.mockResolvedValue(null);
  mocks.checkRateLimit.mockResolvedValue({ allowed: true, remaining: 1, resetAt: new Date() });
});

describe('POST /api/practices', () => {
  it('rejects guests', async () => {
    mocks.requireAuth.mockResolvedValue(unauthorized());
    expect((await POST(post({}))).status).toBe(401);
  });

  it('is rate limited', async () => {
    mocks.checkRateLimit.mockResolvedValue({ allowed: false, remaining: 0, resetAt: new Date() });
    expect((await POST(post({}))).status).toBe(429);
  });

  it('rejects an invalid script with details', async () => {
    const res = await POST(post({ title: 'x', script: { schemaVersion: 1 } }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe('INVALID_SCRIPT');
    expect(body.error.details.length).toBeGreaterThan(0);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it('rejects an oversized script', async () => {
    const res = await POST(post({ title: 'x', script: { pad: 'a'.repeat(70 * 1024) } }));
    expect(res.status).toBe(413);
  });

  it('rejects a bad title', async () => {
    const res = await POST(post({ title: '', script: passingSquare }));
    expect(res.status).toBe(400);
  });

  it('saves a valid script as-is', async () => {
    const row = { id: 'p1', title: 'T', visibility: 'link' };
    const b = builder({ data: row, error: null });
    mocks.from.mockReturnValue(b);
    const res = await POST(post({ title: 'T', visibility: 'link', script: passingSquare }));
    expect(res.status).toBe(201);
    expect((await res.json()).practice).toEqual(row);
    expect(mocks.from).toHaveBeenCalledWith('practices');
    expect(b.insert).toHaveBeenCalledWith(
      expect.objectContaining({ owner_id: 'user-1', visibility: 'link', schema_version: 1, script: passingSquare })
    );
  });
});

describe('GET /api/practices', () => {
  it('rejects guests', async () => {
    mocks.requireAuth.mockResolvedValue(unauthorized());
    expect((await GET()).status).toBe(401);
  });

  it('lists only the caller own practices', async () => {
    const b = builder({ data: [{ id: 'p1' }], error: null });
    mocks.from.mockReturnValue(b);
    const res = await GET();
    expect((await res.json()).practices).toEqual([{ id: 'p1' }]);
    expect(b.eq).toHaveBeenCalledWith('owner_id', 'user-1');
  });
});

describe('/api/practices/[id]', () => {
  const id = '11111111-2222-4333-8444-555555555555';
  const ctx = { params: { id } };
  const req = new NextRequest(`http://localhost/api/practices/${id}`);

  it('GET reads through get_shared_practice', async () => {
    mocks.rpc.mockReturnValue(builder({ data: { id, visibility: 'link' }, error: null }));
    const res = await GET_ONE(req, ctx);
    expect(res.status).toBe(200);
    expect((await res.json()).practice).toEqual({ id, visibility: 'link' });
    expect(mocks.rpc).toHaveBeenCalledWith('get_shared_practice', { p_id: id });
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it('GET returns 404 when the function hides the row', async () => {
    mocks.rpc.mockReturnValue(builder({ data: null, error: null }));
    expect((await GET_ONE(req, ctx)).status).toBe(404);
  });

  it('GET returns 404 on a database error', async () => {
    mocks.rpc.mockReturnValue(builder({ data: null, error: { message: 'boom' } }));
    expect((await GET_ONE(req, ctx)).status).toBe(404);
  });

  it('GET returns 404 for an id that is not a uuid without querying', async () => {
    const res = await GET_ONE(req, { params: { id: 'p1' } });
    expect(res.status).toBe(404);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it('DELETE rejects guests', async () => {
    mocks.requireAuth.mockResolvedValue(unauthorized());
    expect((await DELETE(req, ctx)).status).toBe(401);
  });

  it('DELETE scopes to the owner and 404s when nothing matched', async () => {
    const b = builder({ data: [], error: null });
    mocks.from.mockReturnValue(b);
    expect((await DELETE(req, ctx)).status).toBe(404);
    expect(b.eq).toHaveBeenCalledWith('owner_id', 'user-1');
  });

  it('DELETE removes the own practice', async () => {
    mocks.from.mockReturnValue(builder({ data: [{ id: 'p1' }], error: null }));
    expect((await DELETE(req, ctx)).status).toBe(200);
  });
});

describe('PATCH /api/practices/[id]', () => {
  const ctx = { params: { id: 'p1' } };
  const patch = (body: unknown) =>
    new NextRequest('http://localhost/api/practices/p1', { method: 'PATCH', body: JSON.stringify(body) });

  it('rejects guests', async () => {
    mocks.requireAuth.mockResolvedValue(unauthorized());
    expect((await PATCH(patch({ visibility: 'public' }), ctx)).status).toBe(401);
  });

  it('is rate limited', async () => {
    mocks.checkRateLimit.mockResolvedValue({ allowed: false, remaining: 0, resetAt: new Date() });
    expect((await PATCH(patch({ visibility: 'public' }), ctx)).status).toBe(429);
  });

  it('rejects an empty or bad body', async () => {
    expect((await PATCH(patch({}), ctx)).status).toBe(400);
    expect((await PATCH(patch({ visibility: 'everyone' }), ctx)).status).toBe(400);
  });

  it('rejects an invalid script', async () => {
    const res = await PATCH(patch({ script: { schemaVersion: 1 } }), ctx);
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe('INVALID_SCRIPT');
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it('rejects an oversized script', async () => {
    const res = await PATCH(patch({ script: { pad: 'a'.repeat(70 * 1024) } }), ctx);
    expect(res.status).toBe(413);
  });

  it('updates visibility scoped to the owner', async () => {
    const b = builder({ data: [{ id: 'p1', visibility: 'public' }], error: null });
    mocks.from.mockReturnValue(b);
    const res = await PATCH(patch({ visibility: 'public' }), ctx);
    expect(res.status).toBe(200);
    expect(b.update).toHaveBeenCalledWith({ visibility: 'public' });
    expect(b.eq).toHaveBeenCalledWith('owner_id', 'user-1');
  });

  it('updates a valid script and its schema version', async () => {
    const b = builder({ data: [{ id: 'p1' }], error: null });
    mocks.from.mockReturnValue(b);
    const res = await PATCH(patch({ script: passingSquare }), ctx);
    expect(res.status).toBe(200);
    expect(b.update).toHaveBeenCalledWith({ script: passingSquare, schema_version: 1 });
  });

  it('404s when nothing matched', async () => {
    mocks.from.mockReturnValue(builder({ data: [], error: null }));
    expect((await PATCH(patch({ title: 'New' }), ctx)).status).toBe(404);
  });
});

describe('GET /api/practices/public', () => {
  const get = (qs = '') => new NextRequest(`http://localhost/api/practices/public${qs}`);
  const row = (id: string) => ({
    id,
    title: 'T',
    description: null,
    created_at: '2026-01-01',
    script: passingSquareProgressions,
  });

  it('needs no auth and lists public rows newest first with the base Step as thumbnail', async () => {
    mocks.requireAuth.mockResolvedValue(unauthorized());
    const b = builder({ data: [row('a')], error: null });
    mocks.from.mockReturnValue(b);
    const res = await GET_PUBLIC(get());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(mocks.requireAuth).not.toHaveBeenCalled();
    expect(b.eq).toHaveBeenCalledWith('visibility', 'public');
    expect(b.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(body.practices[0]).toMatchObject({ id: 'a', progressionCount: 2 });
    expect(body.practices[0].thumbnail.index).toBe(0);
    expect(body.practices[0].thumbnail.area).toEqual(passingSquareProgressions.area);
    expect(body.practices[0].thumbnail.markers.length).toBe(passingSquareProgressions.base.placements.length);
    expect(body.practices[0].script).toBeUndefined();
    expect(body.hasMore).toBe(false);
  });

  it('gives a null thumbnail for a stored script that no longer validates', async () => {
    const b = builder({ data: [{ ...row('a'), script: { schemaVersion: 99 } }], error: null });
    mocks.from.mockReturnValue(b);
    const res = await GET_PUBLIC(get());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.practices[0].thumbnail).toBeNull();
    expect(body.practices[0].progressionCount).toBe(0);
  });

  it('searches titles and paginates', async () => {
    const rows = Array.from({ length: 13 }, (_, i) => row(`p${i}`));
    const b = builder({ data: rows, error: null });
    mocks.from.mockReturnValue(b);
    const body = await (await GET_PUBLIC(get('?q=50%25&page=2'))).json();
    expect(b.ilike).toHaveBeenCalledWith('title', '%50\\%%');
    expect(b.range).toHaveBeenCalledWith(12, 24);
    expect(body.practices).toHaveLength(12);
    expect(body.hasMore).toBe(true);
  });

  it('returns the card summary fields', async () => {
    const b = builder({
      data: [{ ...row('a'), owner_id: 'u1', tags: ['Attack', 'Support'], source_url: 'https://example.com/v' }],
      error: null,
    });
    mocks.from.mockReturnValue(b);
    const body = await (await GET_PUBLIC(get())).json();
    const card = body.practices[0];
    expect(card.tags).toEqual(['Attack', 'Support']);
    expect(card.hasSource).toBe(true);
    expect(card.progressionCount).toBe(2);
    expect(card.area).toEqual({
      width: passingSquareProgressions.area.width,
      length: passingSquareProgressions.area.length,
    });
    expect(card.playerCount).toBe(
      card.thumbnail.markers.filter((m: { kind: string }) => m.kind === 'attacker' || m.kind === 'defender').length
    );
    expect(card.playerCount).toBeGreaterThan(0);
    expect(card).toHaveProperty('coachName');
    expect(card.source_url).toBeUndefined();
  });

  it('filters by a known Tag', async () => {
    const b = builder({ data: [row('a')], error: null });
    mocks.from.mockReturnValue(b);
    const res = await GET_PUBLIC(get('?tag=Lineout'));
    expect(res.status).toBe(200);
    expect(b.contains).toHaveBeenCalledWith('tags', ['Lineout']);
  });

  it('does not filter by Tag when none is given', async () => {
    const b = builder({ data: [row('a')], error: null });
    mocks.from.mockReturnValue(b);
    await GET_PUBLIC(get());
    expect(b.contains).not.toHaveBeenCalled();
  });

  it('rejects an unknown Tag', async () => {
    const res = await GET_PUBLIC(get('?tag=Nonsense'));
    expect(res.status).toBe(400);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it('rejects a bad page', async () => {
    expect((await GET_PUBLIC(get('?page=0'))).status).toBe(400);
  });
});
