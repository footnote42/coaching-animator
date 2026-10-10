/**
 * Supabase health check used by the /api/health uptime endpoint.
 */

import { createSupabaseAdminClient } from './admin';

/**
 * Quick health check - only tests database connectivity.
 */
export async function quickHealthCheck(): Promise<{ healthy: boolean; latency: number; error?: string }> {
  const startTime = Date.now();

  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);

    const latency = Date.now() - startTime;

    return {
      healthy: !error,
      latency,
      error: error?.message,
    };
  } catch (err) {
    const latency = Date.now() - startTime;
    return {
      healthy: false,
      latency,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}
