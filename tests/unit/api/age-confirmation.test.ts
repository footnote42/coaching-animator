import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  checkRateLimit: vi.fn(),
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
  createSupabaseServerClient: async () => ({ from: mocks.from }),
}));

import { POST } from '@/app/api/user/age-confirmation/route';

const user = { id: 'user-1' };

function post(body: unknown) {
  return new NextRequest('http://localhost/api/user/age-confirmation', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

function updateChain(result: { error: unknown }) {
  const is = vi.fn(async () => result);
  const eq = vi.fn(() => ({ is }));
  const update = vi.fn((_payload: unknown) => ({ eq }));
  mocks.from.mockReturnValue({ update });
  return { update, eq, is };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireAuth.mockResolvedValue(user);
  mocks.checkRateLimit.mockResolvedValue({ allowed: true, remaining: 9, resetAt: new Date() });
});

describe('POST /api/user/age-confirmation', () => {
  it('returns 401 when signed out', async () => {
    mocks.requireAuth.mockResolvedValue(NextResponse.json({}, { status: 401 }));
    const res = await POST(post({ confirmed: true }));
    expect(res.status).toBe(401);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it('returns 429 when rate limited', async () => {
    mocks.checkRateLimit.mockResolvedValue({ allowed: false, remaining: 0, resetAt: new Date() });
    const res = await POST(post({ confirmed: true }));
    expect(res.status).toBe(429);
  });

  it('returns 400 for invalid JSON', async () => {
    const res = await POST(post('not json'));
    expect(res.status).toBe(400);
  });

  it.each([{}, { confirmed: false }, { confirmed: 'true' }])('rejects %j', async (body) => {
    const res = await POST(post(body));
    expect(res.status).toBe(400);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it('sets age_confirmed_at on the caller own profile only when empty', async () => {
    const chain = updateChain({ error: null });
    const res = await POST(post({ confirmed: true }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ confirmed: true });
    expect(mocks.from).toHaveBeenCalledWith('user_profiles');
    const payload = chain.update.mock.calls[0][0] as { age_confirmed_at: string };
    expect(new Date(payload.age_confirmed_at).getTime()).not.toBeNaN();
    expect(chain.eq).toHaveBeenCalledWith('id', 'user-1');
    expect(chain.is).toHaveBeenCalledWith('age_confirmed_at', null);
  });

  it('returns 500 with a generic message on database error', async () => {
    updateChain({ error: { message: 'secret detail' } });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = await POST(post({ confirmed: true }));
    expect(res.status).toBe(500);
    expect(JSON.stringify(await res.json())).not.toContain('secret detail');
  });
});
