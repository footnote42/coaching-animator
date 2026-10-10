import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  requireNotBanned: vi.fn(),
  requireAdmin: vi.fn(),
  from: vi.fn(),
}));

function builder(result: () => unknown) {
  const b: Record<string, unknown> = {};
  for (const m of ['select', 'insert', 'update', 'delete', 'eq']) b[m] = vi.fn(() => b);
  b.single = vi.fn(async () => result());
  b.maybeSingle = vi.fn(async () => result());
  b.then = (resolve: (v: unknown) => unknown) => resolve(result());
  return b;
}

vi.mock('@/lib/supabase/admin', () => ({ createSupabaseAdminClient: () => ({ from: mocks.from }) }));
vi.mock('@/lib/supabase/server', () => ({ createSupabaseServerClient: async () => ({ from: mocks.from }) }));
vi.mock('@/lib/server/rate-limit', () => ({
  checkRateLimit: vi.fn(async () => ({ allowed: true, remaining: 1, resetAt: new Date() })),
  getRateLimitHeaders: () => ({}),
}));

describe('checkBanned / requireNotBanned fail closed', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doUnmock('@/lib/server/auth');
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('treats a lookup error as banned and answers 503', async () => {
    mocks.from.mockReturnValue(builder(() => ({ data: null, error: { message: 'boom' } })));
    const { checkBanned, requireNotBanned } = await import('@/lib/server/auth');
    expect((await checkBanned('u1')).banned).toBe(true);
    const res = await requireNotBanned('u1');
    expect(res?.status).toBe(503);
  });

  it('treats a missing profile row as banned', async () => {
    mocks.from.mockReturnValue(builder(() => ({ data: null, error: null })));
    const { checkBanned } = await import('@/lib/server/auth');
    expect((await checkBanned('u1')).banned).toBe(true);
  });

  it('refuses a banned account with 403 and allows a clean one', async () => {
    const { requireNotBanned } = await import('@/lib/server/auth');
    mocks.from.mockReturnValue(builder(() => ({ data: { banned_at: '2026-10-10', ban_reason: 'abuse' }, error: null })));
    expect((await requireNotBanned('u1'))?.status).toBe(403);
    mocks.from.mockReturnValue(builder(() => ({ data: { banned_at: null, ban_reason: null }, error: null })));
    expect(await requireNotBanned('u1')).toBeNull();
  });
});

describe('route guards', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ id: 'u1', email: 'a@b.c' });
    mocks.requireNotBanned.mockResolvedValue(null);
    mocks.requireAdmin.mockResolvedValue({ id: 'admin-1' });
    vi.doMock('@/lib/server/auth', () => ({
      requireAuth: mocks.requireAuth,
      requireNotBanned: mocks.requireNotBanned,
      requireAdmin: mocks.requireAdmin,
      isAuthError: (r: unknown) => r instanceof NextResponse,
    }));
  });

  const banReq = () =>
    new NextRequest('http://localhost/x', { method: 'POST', body: JSON.stringify({ action: 'ban_user', reason: 'abuse' }) });

  function banTables(practicesError: unknown) {
    const tables: Record<string, ReturnType<typeof builder>> = {
      practice_reports: builder(() => ({ data: { id: 'r1', status: 'open', practice_id: 'p1' }, error: null })),
      practices: builder(() => ({ data: { id: 'p1', owner_id: 'owner-1' }, error: practicesError })),
      user_profiles: builder(() => ({ error: null })),
    };
    mocks.from.mockImplementation((t: string) => tables[t]);
    return tables;
  }

  it('PUT /api/user/profile refuses a banned user without writing', async () => {
    mocks.requireNotBanned.mockResolvedValue(NextResponse.json({ error: { code: 'ACCOUNT_BANNED' } }, { status: 403 }));
    const { PUT } = await import('@/app/api/user/profile/route');
    const res = await PUT(
      new NextRequest('http://localhost/api/user/profile', { method: 'PUT', body: JSON.stringify({ display_name: 'x' }) })
    );
    expect(res.status).toBe(403);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it('DELETE /api/practices/[id] still lets a banned owner delete their own Practice', async () => {
    mocks.requireNotBanned.mockResolvedValue(NextResponse.json({ error: { code: 'ACCOUNT_BANNED' } }, { status: 403 }));
    mocks.from.mockReturnValue(builder(() => ({ data: [{ id: 'p1' }], error: null })));
    const { DELETE } = await import('@/app/api/practices/[id]/route');
    const res = await DELETE(new NextRequest('http://localhost/api/practices/p1', { method: 'DELETE' }), {
      params: Promise.resolve({ id: 'p1' }),
    });
    expect(res.status).toBe(200);
    expect(mocks.requireNotBanned).not.toHaveBeenCalled();
  });

  it('ban_user hides every Practice the owner has', async () => {
    const tables = banTables(null);
    const { POST } = await import('@/app/api/admin/practice-reports/[id]/action/route');
    const res = await POST(banReq(), { params: Promise.resolve({ id: 'r1' }) });
    expect(res.status).toBe(200);
    expect(tables.practices.update).toHaveBeenCalledWith({ hidden: true });
    expect(tables.practices.eq).toHaveBeenCalledWith('owner_id', 'owner-1');
  });

  it('ban_user reports failure if hiding fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    banTables({ message: 'x' });
    const { POST } = await import('@/app/api/admin/practice-reports/[id]/action/route');
    const res = await POST(banReq(), { params: Promise.resolve({ id: 'r1' }) });
    expect(res.status).toBe(500);
  });
});
