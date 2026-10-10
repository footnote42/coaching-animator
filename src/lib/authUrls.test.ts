import { describe, expect, it } from 'vitest';
import { authPageHref, buildCallbackUrl, buildConfirmUrl } from './authUrls';

const origin = 'https://example.test';

describe('buildConfirmUrl', () => {
  it('carries a safe redirect as next', () => {
    expect(buildConfirmUrl(origin, '/practice')).toBe(`${origin}/auth/confirm?next=%2Fpractice`);
  });

  it.each([null, undefined, '', 'https://evil.test', '//evil.test', '/\\evil'])(
    'falls back to /my-practices for %s',
    (bad) => {
      expect(buildConfirmUrl(origin, bad)).toBe(`${origin}/auth/confirm?next=%2Fmy-practices`);
    },
  );
});

describe('buildCallbackUrl', () => {
  it('carries a safe redirect and rejects an unsafe one', () => {
    expect(buildCallbackUrl(origin, '/practice')).toBe(`${origin}/auth/callback?next=%2Fpractice`);
    expect(buildCallbackUrl(origin, '//evil.test')).toBe(`${origin}/auth/callback?next=%2Fmy-practices`);
  });
});

describe('authPageHref', () => {
  it('carries the redirect across login and register', () => {
    expect(authPageHref('/register', '/practice')).toBe('/register?redirect=%2Fpractice');
    expect(authPageHref('/login', '/practice')).toBe('/login?redirect=%2Fpractice');
  });

  it('omits the param for the default or an unsafe value', () => {
    expect(authPageHref('/register', null)).toBe('/register');
    expect(authPageHref('/login', '/my-practices')).toBe('/login');
    expect(authPageHref('/login', 'https://evil.test')).toBe('/login');
  });
});
