import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import passingSquare from '@/features/practice/examples/passing-square.json';

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  requireNotBanned: vi.fn(),
  checkRateLimit: vi.fn(),
  from: vi.fn(),
}));

vi.mock('@/lib/server/auth', () => ({
  requireAuth: mocks.requireAuth,
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

import { GET, POST } from '@/app/api/practices/route';
import { GET as GET_ONE, DELETE } from '@/app/api/practices/[id]/route';

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
  for (const m of ['select', 'insert', 'delete', 'eq', 'order']) b[m] = vi.fn(() => b);
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
  const ctx = { params: { id: 'p1' } };
  const req = new NextRequest('http://localhost/api/practices/p1');

  it('GET returns the practice', async () => {
    mocks.from.mockReturnValue(builder({ data: { id: 'p1' }, error: null }));
    const res = await GET_ONE(req, ctx);
    expect(res.status).toBe(200);
  });

  it('GET returns 404 when RLS hides the row', async () => {
    mocks.from.mockReturnValue(builder({ data: null, error: null }));
    expect((await GET_ONE(req, ctx)).status).toBe(404);
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
