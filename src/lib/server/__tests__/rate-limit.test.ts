import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit, getRateLimitHeaders } from '../rate-limit';

describe('Rate Limiter (Contact endpoint, 5 req/hour)', () => {
  const endpoint = 'contact';
  const config = { maxRequests: 5, windowMs: 60 * 60 * 1000 };

  beforeEach(() => {
    // Clear cache by restarting (we can't directly clear it, so tests should use unique IPs)
  });

  it('allows first request from new IP', async () => {
    const result = await checkRateLimit('192.168.1.1', endpoint, config);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
    expect(result.resetAt).toBeDefined();
  });

  it('allows up to 5 requests from same IP within hour', async () => {
    const ip = '10.0.0.1';

    for (let i = 0; i < 5; i++) {
      const result = await checkRateLimit(ip, endpoint, config);
      expect(result.allowed).toBe(true);
    }
  });

  it('blocks 6th request from same IP within hour', async () => {
    const ip = '10.0.0.2';

    for (let i = 0; i < 5; i++) {
      await checkRateLimit(ip, endpoint, config);
    }

    const sixthRequest = await checkRateLimit(ip, endpoint, config);
    expect(sixthRequest.allowed).toBe(false);
    expect(sixthRequest.remaining).toBe(0);
  });

  it('tracks remaining requests correctly', async () => {
    const ip = '10.0.0.3';

    let result = await checkRateLimit(ip, endpoint, config);
    expect(result.remaining).toBe(4);

    result = await checkRateLimit(ip, endpoint, config);
    expect(result.remaining).toBe(3);

    result = await checkRateLimit(ip, endpoint, config);
    expect(result.remaining).toBe(2);
  });

  it('isolates limits per IP address', async () => {
    const ip1 = '10.0.0.4';
    const ip2 = '10.0.0.5';

    for (let i = 0; i < 5; i++) {
      await checkRateLimit(ip1, endpoint, config);
    }

    // IP2 should still have full quota
    const result = await checkRateLimit(ip2, endpoint, config);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it('returns reset time on rejection', async () => {
    const ip = '10.0.0.6';

    for (let i = 0; i < 5; i++) {
      await checkRateLimit(ip, endpoint, config);
    }

    const blocked = await checkRateLimit(ip, endpoint, config);
    expect(blocked.allowed).toBe(false);
    expect(blocked.resetAt).toBeDefined();
    expect(blocked.resetAt instanceof Date).toBe(true);
  });

  it('provides proper response headers from RateLimitResult', async () => {
    const result = await checkRateLimit('10.0.0.7', endpoint, config);

    const headers = getRateLimitHeaders(result);
    expect(headers['X-RateLimit-Remaining']).toBe('4');
    expect(headers['X-RateLimit-Reset']).toBeDefined();
  });

  it('uses default contact config if none provided', async () => {
    const result = await checkRateLimit('10.0.0.8', endpoint);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4); // Default contact limit is 5
  });
});

describe('DEFAULT_CONFIGS — new endpoint keys (016-security-hardening)', () => {
  it('upvote config: 30 req/hour', async () => {
    // Use unique key prefix to avoid shared cache state with other tests
    const key = 'config-test-upvote-user';
    const result = await checkRateLimit(key, 'upvote');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(29); // 30 - 1
    expect(result.resetAt.getTime() - Date.now()).toBeGreaterThan(3590_000); // ~1 hour window
  });

  it('remix config: 5 req/hour', async () => {
    const key = 'config-test-remix-user';
    const result = await checkRateLimit(key, 'remix');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4); // 5 - 1
  });

  it('profile_update config: 10 req/hour', async () => {
    const key = 'config-test-profile-user';
    const result = await checkRateLimit(key, 'profile_update');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(9); // 10 - 1
  });

  it('account_delete config: 3 req/24hr window', async () => {
    const key = 'config-test-account-user';
    const result = await checkRateLimit(key, 'account_delete');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2); // 3 - 1
    // 24hr window: reset should be ~24h from now
    expect(result.resetAt.getTime() - Date.now()).toBeGreaterThan(23 * 60 * 60 * 1000);
  });

  it('resend_verification config: 3 req/hour — allows 3, blocks 4th', async () => {
    const ip = 'resend-test-ip-unique';
    for (let i = 0; i < 3; i++) {
      const result = await checkRateLimit(ip, 'resend_verification');
      expect(result.allowed).toBe(true);
    }
    const fourth = await checkRateLimit(ip, 'resend_verification');
    expect(fourth.allowed).toBe(false);
    expect(fourth.remaining).toBe(0);
  });

  it('progression_create config: 20 req/hour', async () => {
    const key = 'config-test-prog-create-user';
    const result = await checkRateLimit(key, 'progression_create');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(19); // 20 - 1
  });

  it('progression_reorder config: 20 req/hour', async () => {
    const key = 'config-test-prog-reorder-user';
    const result = await checkRateLimit(key, 'progression_reorder');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(19); // 20 - 1
  });
});
