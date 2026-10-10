import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  requireAdmin: vi.fn(),
  requireNotBanned: vi.fn(),
  checkRateLimit: vi.fn(),
  from: vi.fn(),
}));

vi.mock('@/lib/server/auth', () => ({
  getUser: mocks.getUser,
  requireAdmin: mocks.requireAdmin,
  requireNotBanned: mocks.requireNotBanned,
  isAuthError: (r: unknown) => r instanceof NextResponse,
}));
vi.mock('@/lib/server/rate-limit', () => ({
  checkRateLimit: mocks.checkRateLimit,
  getRateLimitHeaders: () => ({}),
}));
vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: async () => ({ from: mocks.from }),
}));

import { POST as SUBMIT } from '@/app/api/feedback/route';
import { GET as LIST } from '@/app/api/admin/feedback/route';
import { POST as MARK_READ } from '@/app/api/admin/feedback/[id]/read/route';

const valid = { name: 'Sam', email: '', area: 'editor', what: 'Drag is jumpy', rating: 'needs-improvement' };
const notAdmin = () => NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 });

function post(body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest('http://localhost/api/feedback', { method: 'POST', body: JSON.stringify(body), headers });
}

/** Chainable query-builder stub that resolves to `result` at any terminal call. */
function builder(result: unknown) {
  const b: Record<string, unknown> = {};
  for (const m of ['select', 'insert', 'update', 'eq', 'is', 'order', 'range']) b[m] = vi.fn(() => b);
  b.maybeSingle = vi.fn(async () => result);
  b.then = (resolve: (v: unknown) => unknown) => resolve(result);
  return b;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getUser.mockResolvedValue(null);
  mocks.requireAdmin.mockResolvedValue({ id: 'admin-1' });
  mocks.requireNotBanned.mockResolvedValue(null);
  mocks.checkRateLimit.mockResolvedValue({ allowed: true, remaining: 1, resetAt: new Date() });
});

describe('POST /api/feedback', () => {
  it('stores a submission from a signed-out visitor, rate limited by IP', async () => {
    const b = builder({ error: null });
    mocks.from.mockReturnValue(b);
    const res = await SUBMIT(post(valid, { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' }));
    expect(res.status).toBe(201);
    expect(mocks.checkRateLimit).toHaveBeenCalledWith('ip:1.2.3.4', 'feedback');
    expect(mocks.from).toHaveBeenCalledWith('feedback');
    expect(b.insert).toHaveBeenCalledWith({ ...valid, email: null, user_id: null });
    expect(mocks.requireNotBanned).not.toHaveBeenCalled();
  });

  it('rate limits signed-in users by user id and refuses banned accounts', async () => {
    mocks.getUser.mockResolvedValue({ id: 'user-1' });
    const b = builder({ error: null });
    mocks.from.mockReturnValue(b);
    expect((await SUBMIT(post(valid))).status).toBe(201);
    expect(mocks.checkRateLimit).toHaveBeenCalledWith('user:user-1', 'feedback');
    expect(b.insert).toHaveBeenCalledWith(expect.objectContaining({ user_id: 'user-1' }));

    mocks.requireNotBanned.mockResolvedValue(NextResponse.json({ error: {} }, { status: 403 }));
    mocks.from.mockClear();
    expect((await SUBMIT(post(valid))).status).toBe(403);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it('returns 429 when rate limited', async () => {
    mocks.checkRateLimit.mockResolvedValue({ allowed: false, remaining: 0, resetAt: new Date() });
    expect((await SUBMIT(post(valid))).status).toBe(429);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it('rejects invalid input', async () => {
    for (const bad of [
      { ...valid, name: '' },
      { ...valid, email: 'nope' },
      { ...valid, area: 'x' },
      { ...valid, rating: 'x' },
      { ...valid, what: 'a'.repeat(2001) },
    ]) {
      const res = await SUBMIT(post(bad));
      expect(res.status).toBe(400);
      expect((await res.json()).error.code).toBe('VALIDATION_ERROR');
    }
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it('rejects a body that is not JSON', async () => {
    const res = await SUBMIT(new NextRequest('http://localhost/api/feedback', { method: 'POST', body: 'x' }));
    expect(res.status).toBe(400);
  });

  it('returns 500 when the insert fails', async () => {
    mocks.from.mockReturnValue(builder({ error: { message: 'boom' } }));
    expect((await SUBMIT(post(valid))).status).toBe(500);
  });
});

describe('GET /api/admin/feedback', () => {
  const req = () => new NextRequest('http://localhost/api/admin/feedback');

  it('is admin only', async () => {
    mocks.requireAdmin.mockResolvedValue(notAdmin());
    expect((await LIST(req())).status).toBe(403);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it('lists newest first', async () => {
    const rows = [{ id: 'f1' }, { id: 'f2' }];
    const b = builder({ data: rows, error: null, count: 2 });
    mocks.from.mockReturnValue(b);
    const res = await LIST(req());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ feedback: rows, total: 2 });
    expect(b.order).toHaveBeenCalledWith('created_at', { ascending: false });
  });
});

describe('POST /api/admin/feedback/[id]/read', () => {
  const ctx = { params: Promise.resolve({ id: 'f1' }) };
  const req = () => new NextRequest('http://localhost/api/admin/feedback/f1/read', { method: 'POST' });

  it('is admin only', async () => {
    mocks.requireAdmin.mockResolvedValue(notAdmin());
    expect((await MARK_READ(req(), ctx)).status).toBe(403);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it('marks an unread row as read', async () => {
    const b = builder({ data: { id: 'f1', read_at: '2026-10-03T00:00:00Z' }, error: null });
    mocks.from.mockReturnValue(b);
    const res = await MARK_READ(req(), ctx);
    expect(res.status).toBe(200);
    expect(b.eq).toHaveBeenCalledWith('id', 'f1');
    expect(b.update).toHaveBeenCalledWith({ read_at: expect.any(String) });
  });

  it('returns 404 when nothing matches', async () => {
    mocks.from.mockReturnValue(builder({ data: null, error: null }));
    expect((await MARK_READ(req(), ctx)).status).toBe(404);
  });
});
