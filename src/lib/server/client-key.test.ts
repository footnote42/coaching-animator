import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { rateLimitKey } from '@/lib/server/client-key';

const req = (headers: Record<string, string> = {}) => new NextRequest('http://localhost/x', { headers });

describe('rateLimitKey', () => {
  it('prefers the user', () => {
    expect(rateLimitKey(req({ 'x-forwarded-for': '1.2.3.4' }), 'u1')).toBe('user:u1');
  });
  it('uses the first forwarded IP, then x-real-ip', () => {
    expect(rateLimitKey(req({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' }))).toBe('ip:1.2.3.4');
    expect(rateLimitKey(req({ 'x-real-ip': '9.9.9.9' }))).toBe('ip:9.9.9.9');
  });
  it('without an IP, buckets by client fingerprint instead of one shared key', () => {
    const a = rateLimitKey(req({ 'user-agent': 'A' }));
    const b = rateLimitKey(req({ 'user-agent': 'B' }));
    expect(a).toMatch(/^anon:[0-9a-f]{16}$/);
    expect(a).not.toBe(b);
    expect(a).toBe(rateLimitKey(req({ 'user-agent': 'A' })));
  });
});
