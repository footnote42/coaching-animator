import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { NextRequest } from 'next/server';
import { emptyScript } from '@/features/practice/editing';
import { PRACTICE_TAGS } from '@/lib/practice-tags';

// The last row sent to insert() or update().
let written: Record<string, unknown> | null = null;

function query(result: unknown) {
  const q: Record<string, unknown> = {};
  for (const m of ['insert', 'update', 'eq', 'select']) {
    q[m] = vi.fn((arg?: unknown) => {
      if (m === 'insert' || m === 'update') written = arg as Record<string, unknown>;
      return q;
    });
  }
  q.single = vi.fn(async () => ({ data: result, error: null }));
  q.then = (resolve: (v: unknown) => unknown) => resolve({ data: [result], error: null });
  return q;
}

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(async () => ({ from: () => query({ id: 'p1' }) })),
}));
vi.mock('@/lib/server/auth', () => ({
  requireAuth: vi.fn(async () => ({ id: 'u1' })),
  isAuthError: () => false,
  requireNotBanned: vi.fn(async () => null),
}));
vi.mock('@/lib/server/rate-limit', () => ({
  checkRateLimit: vi.fn(async () => ({ allowed: true })),
  getRateLimitHeaders: () => ({}),
}));

import { POST } from '../route';
import { PATCH } from '../[id]/route';

const script = {
  ...emptyScript(),
  markers: [{ id: 'a1', kind: 'attacker' }],
  base: { placements: [{ marker: 'a1', cell: { x: 0, y: 0 } }], moves: [], passes: [], commentary: { points: [] } },
};
const req = (body: unknown) =>
  new NextRequest('http://localhost/api/practices', { method: 'POST', body: JSON.stringify(body) });
const post = (extra: object) => POST(req({ title: 'T', script, ...extra }));
const patch = (extra: object) => PATCH(req(extra), { params: { id: 'p1' } });

describe('Tags on save and update', () => {
  beforeEach(() => {
    written = null;
  });

  it('POST saves known Tags', async () => {
    const res = await post({ tags: ['Attack', 'Pass / catch'] });
    expect(res.status).toBe(201);
    expect(written?.tags).toEqual(['Attack', 'Pass / catch']);
  });

  it('POST defaults to no Tags', async () => {
    const res = await post({});
    expect(res.status).toBe(201);
    expect(written?.tags).toEqual([]);
  });

  it('POST rejects an unknown Tag', async () => {
    const res = await post({ tags: ['Attack', 'Banter'] });
    expect(res.status).toBe(400);
    expect(written).toBeNull();
  });

  it('POST rejects more than 5 Tags', async () => {
    const res = await post({ tags: PRACTICE_TAGS.slice(0, 6) });
    expect(res.status).toBe(400);
    expect(written).toBeNull();
  });

  it('PATCH updates Tags', async () => {
    const res = await patch({ tags: ['Scrum'] });
    expect(res.status).toBe(200);
    expect(written).toEqual({ tags: ['Scrum'] });
  });

  it('PATCH rejects an unknown Tag', async () => {
    expect((await patch({ tags: ['nope'] })).status).toBe(400);
  });

  it('PATCH rejects more than 5 Tags', async () => {
    expect((await patch({ tags: PRACTICE_TAGS.slice(0, 6) })).status).toBe(400);
  });
});

describe('Tag list', () => {
  it('has 28 Tags and the database check lists the same ones', () => {
    expect(PRACTICE_TAGS).toHaveLength(28);
    const sql = readFileSync('supabase/migrations/20260604000000_practice_tags.sql', 'utf8');
    const inSql = [...sql.matchAll(/^\s+'([^']+)',?\r?$/gm)].map((m) => m[1]);
    expect(inSql).toEqual([...PRACTICE_TAGS]);
  });
});
