import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { emptyScript } from '@/features/practice/editing';

let profile: { age_confirmed_at: string | null } | null = null;

vi.mock('@/lib/supabase/admin', () => ({
  createSupabaseAdminClient: () => ({
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: profile, error: null }), single: async () => ({ data: { banned_at: null }, error: null }) }) }) }),
  }),
}));
vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(async () => ({
    auth: { getUser: async () => ({ data: { user: { id: 'u1' } } }) },
    from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: { banned_at: null }, error: null }) }) }) }),
  })),
}));
vi.mock('@/lib/server/rate-limit', () => ({
  checkRateLimit: vi.fn(async () => ({ allowed: true, remaining: 1, resetAt: new Date() })),
  getRateLimitHeaders: () => ({}),
}));

import { requireAgeConfirmed } from '../auth';
import { POST as createPractice } from '@/app/api/practices/route';

beforeEach(() => {
  profile = null;
});

describe('requireAgeConfirmed', () => {
  it('refuses with 403 AGE_NOT_CONFIRMED when age_confirmed_at is null', async () => {
    profile = { age_confirmed_at: null };
    const res = await requireAgeConfirmed('u1');
    expect(res?.status).toBe(403);
    expect((await res!.json()).error.code).toBe('AGE_NOT_CONFIRMED');
  });

  it('fails closed when there is no profile row', async () => {
    expect((await requireAgeConfirmed('u1'))?.status).toBe(403);
  });

  it('allows a confirmed account', async () => {
    profile = { age_confirmed_at: '2026-10-10T00:00:00Z' };
    expect(await requireAgeConfirmed('u1')).toBeNull();
  });
});

describe('POST /api/practices', () => {
  it('refuses to save for an unconfirmed account', async () => {
    profile = { age_confirmed_at: null };
    const req = new NextRequest('http://localhost/api/practices', {
      method: 'POST',
      body: JSON.stringify({ title: 'x', script: emptyScript() }),
    });
    const res = await createPractice(req);
    expect(res.status).toBe(403);
    expect((await res.json()).error.code).toBe('AGE_NOT_CONFIRMED');
  });
});
