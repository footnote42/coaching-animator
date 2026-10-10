import { createHash } from 'node:crypto';
import type { NextRequest } from 'next/server';

/** Client IP from the proxy headers, or null when none is present. */
export function clientIp(request: NextRequest): string | null {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || request.headers.get('x-real-ip')?.trim() || null;
}

/**
 * Rate-limit key for a request: the user when signed in, else the IP. With no
 * IP header, falls back to a hash of User-Agent + Accept-Language so unrelated
 * visitors are not all merged into one shared bucket. Residual: such a key is
 * client-controlled, so it limits honest clients but not a determined attacker
 * (who can also forge a forwarded header).
 */
export function rateLimitKey(request: NextRequest, userId?: string | null): string {
  if (userId) return `user:${userId}`;
  const ip = clientIp(request);
  if (ip) return `ip:${ip}`;
  const fingerprint = `${request.headers.get('user-agent') ?? ''}|${request.headers.get('accept-language') ?? ''}`;
  return `anon:${createHash('sha256').update(fingerprint).digest('hex').slice(0, 16)}`;
}
