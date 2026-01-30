import { createSupabaseServerClient } from './supabase/server';

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
  
  const supabase = await createSupabaseServerClient();
  const rateLimitKey = `${key}:${endpoint}`;
  const windowStart = new Date(Date.now() - windowMs);

  const { data: existing } = await supabase
    .from('rate_limits')
    .select('count, window_start')
    .eq('key', rateLimitKey)
    .single();

  if (!existing) {
    await supabase
      .from('rate_limits')
      .insert({ key: rateLimitKey, count: 1, window_start: new Date().toISOString() });

    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: new Date(Date.now() + windowMs),
    };
  }

  const existingWindowStart = new Date(existing.window_start);
  
  if (existingWindowStart < windowStart) {
    await supabase
      .from('rate_limits')
      .update({ count: 1, window_start: new Date().toISOString() })
      .eq('key', rateLimitKey);

    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: new Date(Date.now() + windowMs),
    };
  }

  if (existing.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(existingWindowStart.getTime() + windowMs),
    };
  }

  await supabase
    .from('rate_limits')
    .update({ count: existing.count + 1 })
    .eq('key', rateLimitKey);

  return {
    allowed: true,
    remaining: maxRequests - existing.count - 1,
    resetAt: new Date(existingWindowStart.getTime() + windowMs),
  };
}

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.resetAt.toISOString(),
  };
}
