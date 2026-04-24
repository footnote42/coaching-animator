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
