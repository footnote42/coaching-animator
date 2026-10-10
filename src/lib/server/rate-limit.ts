/**
 * Persistent Rate Limiting
 *
 * Fixed-window counters stored in the Supabase `rate_limits` table via the
 * atomic `rate_limit_hit` SQL function, so limits survive restarts and are
 * shared across serverless instances.
 *
 * If the store errors, the limiter fails OPEN (request allowed, error logged).
 */

import { createSupabaseServerClient } from '@/lib/supabase/server';

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

const DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
  'contact': { maxRequests: 5, windowMs: 60 * 60 * 1000 },
  'profile_update': { maxRequests: 10, windowMs: 60 * 60 * 1000 },
  'account_delete': { maxRequests: 3, windowMs: 24 * 60 * 60 * 1000 },
  'resend_verification': { maxRequests: 3, windowMs: 60 * 60 * 1000 },
  'practice_save': { maxRequests: 20, windowMs: 60 * 60 * 1000 },
  'practice_report': { maxRequests: 5, windowMs: 60 * 60 * 1000 },
  'feedback': { maxRequests: 5, windowMs: 60 * 60 * 1000 },
  'tokens_api': { maxRequests: 20, windowMs: 60 * 60 * 1000 },
  'data_export': { maxRequests: 5, windowMs: 60 * 60 * 1000 },
  'mcp': { maxRequests: 120, windowMs: 60 * 60 * 1000 },
};

export async function checkRateLimit(
  key: string,
  endpoint: string,
  config?: RateLimitConfig
): Promise<RateLimitResult> {
  const { maxRequests, windowMs } = config ?? DEFAULT_CONFIGS[endpoint] ?? { maxRequests: 100, windowMs: 60 * 60 * 1000 };

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc('rate_limit_hit', {
      p_key: `${key}:${endpoint}`,
      p_window_seconds: Math.max(1, Math.ceil(windowMs / 1000)),
    });
    const row = Array.isArray(data) ? data[0] : data;
    if (error || !row) {
      throw new Error(error?.message ?? 'empty response');
    }

    const count = row.hit_count;
    return {
      allowed: count <= maxRequests,
      remaining: Math.max(0, maxRequests - count),
      resetAt: new Date(new Date(row.window_start).getTime() + windowMs),
    };
  } catch (err) {
    console.error('[RateLimit] Store error, failing open:', err instanceof Error ? err.message : err);
    return {
      allowed: true,
      remaining: maxRequests,
      resetAt: new Date(Date.now() + windowMs),
    };
  }
}

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.resetAt.toISOString(),
  };
}
