import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  checkRateLimit: vi.fn(),
  deleteUser: vi.fn(),
  signOut: vi.fn(),
  from: vi.fn(),
}));

vi.mock('@/lib/server/auth', () => ({
  requireAuth: mocks.requireAuth,
  isAuthError: (r: unknown) => r instanceof NextResponse,
}));
vi.mock('@/lib/server/rate-limit', () => ({
  checkRateLimit: mocks.checkRateLimit,
  getRateLimitHeaders: () => ({}),
}));
vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: async () => ({ from: mocks.from, auth: { signOut: mocks.signOut } }),
}));
vi.mock('@/lib/supabase/admin', () => ({
  createSupabaseAdminClient: () => ({ auth: { admin: { deleteUser: mocks.deleteUser } } }),
}));

import { DELETE } from '@/app/api/user/account/route';

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireAuth.mockResolvedValue({ id: 'user-1' });
  mocks.checkRateLimit.mockResolvedValue({ allowed: true, remaining: 2, resetAt: new Date() });
  mocks.deleteUser.mockResolvedValue({ error: null });
  mocks.signOut.mockResolvedValue({ error: null });
});

describe('DELETE /api/user/account', () => {
  it('returns 401 when signed out and deletes nothing', async () => {
    mocks.requireAuth.mockResolvedValue(NextResponse.json({}, { status: 401 }));
    const res = await DELETE();
    expect(res.status).toBe(401);
    expect(mocks.deleteUser).not.toHaveBeenCalled();
  });

  it('returns 429 when rate limited and deletes nothing', async () => {
    mocks.checkRateLimit.mockResolvedValue({ allowed: false, remaining: 0, resetAt: new Date() });
    const res = await DELETE();
    expect(res.status).toBe(429);
    expect(mocks.deleteUser).not.toHaveBeenCalled();
  });

  it('deletes the auth user for the caller only, then signs out', async () => {
    const res = await DELETE();
    expect(res.status).toBe(204);
    expect(mocks.deleteUser).toHaveBeenCalledTimes(1);
    expect(mocks.deleteUser).toHaveBeenCalledWith('user-1');
    expect(mocks.signOut).toHaveBeenCalled();
  });

  it('returns 500 with a generic message and does not sign out when deletion fails', async () => {
    mocks.deleteUser.mockResolvedValue({ error: { message: 'secret detail' } });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = await DELETE();
    expect(res.status).toBe(500);
    expect(JSON.stringify(await res.json())).not.toContain('secret detail');
    expect(mocks.signOut).not.toHaveBeenCalled();
  });

  it('returns 500 when the admin client is not configured', async () => {
    mocks.deleteUser.mockRejectedValue(new Error('Admin database configuration missing'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = await DELETE();
    expect(res.status).toBe(500);
  });
});
