/**
 * In-Memory Rate Limiting
 * 
 * Uses an in-memory Map for rate limiting instead of database queries.
 * This reduces latency from 50-100ms (DB) to <5ms (memory).
 * 
 * Trade-offs:
 * - Rate limits reset on server restart
 * - Not shared across multiple server instances
 * - For serverless (Vercel), each instance has its own cache
 * 
 * This is acceptable for our use case since:
 * - Rate limits are per-hour windows (restart resets are rare)
 * - Vercel functions share state within warm instances
 * - Worst case: users get slightly more requests than limit
 */

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

// In-memory cache for rate limits
const rateLimitCache = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically (every 5 minutes)
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupExpiredEntries(windowMs: number): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  
  lastCleanup = now;
  const cutoff = now - windowMs * 2; // Keep entries for 2x window duration
  
  for (const [key, entry] of rateLimitCache.entries()) {
    if (entry.windowStart < cutoff) {
      rateLimitCache.delete(key);
    }
  }
}

const DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
  'create_animation': { maxRequests: 10, windowMs: 60 * 60 * 1000 },
  'report': { maxRequests: 5, windowMs: 60 * 60 * 1000 },
  'share': { maxRequests: 10, windowMs: 60 * 60 * 1000 },
  'gallery': { maxRequests: 100, windowMs: 60 * 60 * 1000 },
};

export async function checkRateLimit(
  key: string,
  endpoint: string,
  config?: RateLimitConfig
): Promise<RateLimitResult> {
  const { maxRequests, windowMs } = config ?? DEFAULT_CONFIGS[endpoint] ?? { maxRequests: 100, windowMs: 60 * 60 * 1000 };
  
  const rateLimitKey = `${key}:${endpoint}`;
  const now = Date.now();
  const windowStart = now - windowMs;

  // Periodic cleanup
  cleanupExpiredEntries(windowMs);

  const existing = rateLimitCache.get(rateLimitKey);

  // No existing entry - create new one
  if (!existing) {
    rateLimitCache.set(rateLimitKey, { count: 1, windowStart: now });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: new Date(now + windowMs),
    };
  }

  // Window expired - reset
  if (existing.windowStart < windowStart) {
    rateLimitCache.set(rateLimitKey, { count: 1, windowStart: now });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: new Date(now + windowMs),
    };
  }

  // Rate limit exceeded
  if (existing.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(existing.windowStart + windowMs),
    };
  }

  // Increment counter
  existing.count += 1;
  rateLimitCache.set(rateLimitKey, existing);

  return {
    allowed: true,
    remaining: maxRequests - existing.count,
    resetAt: new Date(existing.windowStart + windowMs),
  };
}

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.resetAt.toISOString(),
  };
}
