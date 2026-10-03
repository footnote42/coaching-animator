import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const rpc = vi.fn();
vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(async () => ({ rpc })),
}));

import { checkRateLimit, getRateLimitHeaders } from '../rate-limit';

const WINDOW_START = '2026-01-01T00:00:00.000Z';
const config = { maxRequests: 5, windowMs: 60 * 60 * 1000 };

function hit(count: number) {
  rpc.mockResolvedValueOnce({ data: [{ hit_count: count, window_start: WINDOW_START }], error: null });
}

describe('checkRateLimit (Postgres-backed)', () => {
  beforeEach(() => rpc.mockReset());
  afterEach(() => vi.restoreAllMocks());

  it('calls rate_limit_hit with namespaced key and window seconds', async () => {
    hit(1);
    await checkRateLimit('1.2.3.4', 'contact', config);
    expect(rpc).toHaveBeenCalledWith('rate_limit_hit', { p_key: '1.2.3.4:contact', p_window_seconds: 3600 });
  });

  it('allows requests under the limit and reports remaining', async () => {
    hit(1);
    const result = await checkRateLimit('a', 'contact', config);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
    expect(result.resetAt.toISOString()).toBe('2026-01-01T01:00:00.000Z');
  });

  it('allows the request that reaches the limit', async () => {
    hit(5);
    const result = await checkRateLimit('a', 'contact', config);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it('blocks once the count exceeds the limit', async () => {
    hit(6);
    const result = await checkRateLimit('a', 'contact', config);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('uses the default config for the endpoint', async () => {
    hit(1);
    const result = await checkRateLimit('a', 'upvote');
    expect(result.remaining).toBe(29);
  });

  it('fails open and logs when the rpc returns an error', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    rpc.mockResolvedValueOnce({ data: null, error: { message: 'db down' } });
    const result = await checkRateLimit('a', 'contact', config);
    expect(result.allowed).toBe(true);
    expect(spy.mock.calls[0][0]).toContain('[RateLimit]');
  });

  it('fails open and logs when the rpc throws', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    rpc.mockRejectedValueOnce(new Error('network'));
    const result = await checkRateLimit('a', 'contact', config);
    expect(result.allowed).toBe(true);
    expect(spy.mock.calls[0][0]).toContain('[RateLimit]');
  });

  it('builds response headers', async () => {
    hit(1);
    const headers = getRateLimitHeaders(await checkRateLimit('a', 'contact', config));
    expect(headers['X-RateLimit-Remaining']).toBe('4');
    expect(headers['X-RateLimit-Reset']).toBeDefined();
  });
});
