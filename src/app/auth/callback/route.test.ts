import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const state = vi.hoisted(() => ({ profile: null as { id: string } | null }));

vi.mock('next/headers', () => ({
  cookies: async () => ({ getAll: () => [], set: () => {} }),
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({
    auth: {
      exchangeCodeForSession: async () => ({ error: null }),
      getUser: async () => ({ data: { user: { id: 'u1' } } }),
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: async () => ({ data: state.profile }) }) }),
    }),
  }),
}));

import { GET } from './route';

const call = (qs: string) => GET(new NextRequest(`http://localhost:3000/auth/callback?${qs}`));
const location = (res: Response) => new URL(res.headers.get('location')!).pathname;

describe('auth callback landing', () => {
  beforeEach(() => {
    state.profile = { id: 'u1' };
  });

  it('returning user with no next lands on My Practices', async () => {
    expect(location(await call('code=c'))).toBe('/my-practices');
  });

  it('new user with no next lands on My Practices', async () => {
    state.profile = null;
    expect(location(await call('code=c'))).toBe('/my-practices');
  });

  it('an explicit next wins for returning and new users', async () => {
    expect(location(await call('code=c&next=/practice'))).toBe('/practice');
    state.profile = null;
    expect(location(await call('code=c&next=/practice'))).toBe('/practice');
  });

  it('an unsafe next falls back to My Practices', async () => {
    expect(location(await call('code=c&next=//evil.example'))).toBe('/my-practices');
  });

  it('a missing code goes to the login error page', async () => {
    expect(location(await call(''))).toBe('/login');
  });
});
