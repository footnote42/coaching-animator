import { afterEach, describe, expect, it, vi } from 'vitest';
import { CANONICAL_ORIGIN, getSiteOrigin } from '@/lib/site-origin';

describe('getSiteOrigin', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('defaults to the canonical origin', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '');
    expect(getSiteOrigin()).toBe(CANONICAL_ORIGIN);
    expect(getSiteOrigin()).not.toMatch(/localhost|vercel\.app/);
  });

  it('uses NEXT_PUBLIC_SITE_URL and strips trailing slashes', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000/');
    expect(getSiteOrigin()).toBe('http://localhost:3000');
  });
});
