import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';

const calls: { table: string; select: string; filters: Record<string, unknown> }[] = [];
const rows: Record<string, unknown[]> = {};

function query(table: string) {
  const entry = { table, select: '', filters: {} as Record<string, unknown> };
  calls.push(entry);
  const q: Record<string, unknown> = {};
  q.select = (s: string) => { entry.select = s; return q; };
  q.eq = (col: string, val: unknown) => { entry.filters[col] = val; return q; };
  q.order = () => q;
  q.maybeSingle = async () => ({ data: rows[table]?.[0] ?? null, error: null });
  q.then = (resolve: (v: unknown) => unknown) => resolve({ data: rows[table] ?? [], error: null });
  return q;
}

const requireAuth = vi.fn();
vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(async () => ({ from: (t: string) => query(t) })),
}));
vi.mock('@/lib/server/auth', () => ({
  requireAuth: () => requireAuth(),
  isAuthError: (r: unknown) => r instanceof NextResponse,
}));
const checkRateLimit = vi.fn();
vi.mock('@/lib/server/rate-limit', () => ({
  checkRateLimit: (...a: unknown[]) => checkRateLimit(...a),
  getRateLimitHeaders: () => ({}),
}));

import { GET } from '../route';

const call = () => GET(new Request('http://localhost/api/user/export'));

beforeEach(() => {
  calls.length = 0;
  for (const k of Object.keys(rows)) delete rows[k];
  requireAuth.mockResolvedValue({ id: 'u1', email: 'a@b.com' });
  checkRateLimit.mockResolvedValue({ allowed: true, remaining: 4, resetAt: new Date() });
  rows.user_profiles = [{ display_name: 'Ann', created_at: 'c', age_confirmed_at: 'a' }];
  rows.practices = [{ id: 'p1', title: 'T', script: { a: 1 }, tags: [], visibility: 'private' }];
  rows.personal_tokens = [{ name: 'laptop', created_at: 'c', last_used_at: null, revoked_at: null }];
  rows.practice_reports = [];
});

describe('GET /api/user/export', () => {
  it('refuses guests', async () => {
    requireAuth.mockResolvedValue(NextResponse.json({ error: 'x' }, { status: 401 }));
    const res = await call();
    expect(res.status).toBe(401);
    expect(calls).toHaveLength(0);
  });

  it('is rate limited', async () => {
    checkRateLimit.mockResolvedValue({ allowed: false, remaining: 0, resetAt: new Date() });
    const res = await call();
    expect(res.status).toBe(429);
    expect(checkRateLimit).toHaveBeenCalledWith('u1', 'data_export');
    expect(calls).toHaveLength(0);
  });

  it('returns a dated JSON download of the caller data only', async () => {
    const res = await call();
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Disposition')).toMatch(
      /^attachment; filename="coaching-animator-export-\d{4}-\d{2}-\d{2}\.json"$/
    );
    const body = JSON.parse(await res.text());
    expect(body.account.email).toBe('a@b.com');
    expect(body.profile.display_name).toBe('Ann');
    expect(body.practices[0].script).toEqual({ a: 1 });
    expect(body.personal_tokens[0].name).toBe('laptop');
    const scope = Object.fromEntries(calls.map((c) => [c.table, c.filters]));
    expect(scope.user_profiles).toEqual({ id: 'u1' });
    expect(scope.practices).toEqual({ owner_id: 'u1' });
    expect(scope.personal_tokens).toEqual({ owner_id: 'u1' });
    expect(scope.practice_reports).toEqual({ reporter_id: 'u1' });
  });

  it('never selects secrets, hashes, role or ban fields', async () => {
    const res = await call();
    const selected = calls.map((c) => c.select).join(',');
    for (const banned of ['token_hash', 'role', 'banned_at', 'ban_reason', 'owner_id', 'reporter_id']) {
      expect(selected).not.toContain(banned);
    }
    expect(await res.text()).not.toMatch(/hash/);
  });
});
