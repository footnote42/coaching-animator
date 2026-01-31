/**
 * Supabase health check utilities for offline mode detection.
 * Tests database connectivity and service availability.
 */

import { createSupabaseServerClient } from './server';
import { createSupabaseBrowserClient } from './client';

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  database: boolean;
  storage: boolean;
  auth: boolean;
  latency: number;
  error?: string;
}

/**
 * Perform a comprehensive health check on Supabase services.
 * Tests database, storage, and auth connectivity.
 */
export async function checkSupabaseHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  const results = {
    database: false,
    storage: false,
    auth: false,
  };

  let error: string | undefined;

  try {
    // Test database connectivity with a simple query
    const supabase = await createSupabaseServerClient();
    const { error: dbError } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);
    
    results.database = !dbError;
    if (dbError) {
      error = `Database error: ${dbError.message}`;
    }

    // Test storage connectivity
    const { error: storageError } = await supabase.storage
      .from('animations')
      .list('', { limit: 1 });
    
    results.storage = !storageError;
    if (storageError && !error) {
      error = `Storage error: ${storageError.message}`;
    }

    // Test auth service (this will work even without authentication)
    const client = createSupabaseBrowserClient();
    const { error: authError } = await client.auth.getSession();
    
    results.auth = !authError;
    if (authError && !error) {
      error = `Auth error: ${authError.message}`;
    }

  } catch (err) {
    error = err instanceof Error ? err.message : 'Unknown health check error';
  }

  const latency = Date.now() - startTime;

  // Determine overall health status
  const healthyCount = [results.database, results.storage, results.auth].filter(Boolean).length;
  let status: 'healthy' | 'degraded' | 'unhealthy';

  if (healthyCount === 3) {
    status = 'healthy';
  } else if (healthyCount >= 2) {
    status = 'degraded';
  } else {
    status = 'unhealthy';
  }

  return {
    status,
    ...results,
    latency,
    error,
  };
}

/**
 * Quick health check - only tests database connectivity.
 * Used for frequent checks where full health check is too expensive.
 */
export async function quickHealthCheck(): Promise<{ healthy: boolean; latency: number; error?: string }> {
  const startTime = Date.now();

  try {
    const supabase = await createSupabaseServerClient();
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

/**
 * Client-side health check (browser environment).
 * Uses the client Supabase instance for testing.
 */
export async function clientHealthCheck(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  const results = {
    database: false,
    storage: false,
    auth: false,
  };

  let error: string | undefined;

  try {
    const client = createSupabaseBrowserClient();

    // Test auth
    const { error: authError } = await client.auth.getSession();
    results.auth = !authError;
    if (authError) {
      error = `Auth error: ${authError.message}`;
    }

    // Test database with public data
    const { error: dbError } = await client
      .from('saved_animations')
      .select('id')
      .eq('visibility', 'public')
      .limit(1);
    
    results.database = !dbError;
    if (dbError && !error) {
      error = `Database error: ${dbError.message}`;
    }

    // Test storage
    const { error: storageError } = await client.storage
      .from('animations')
      .list('', { limit: 1 });
    
    results.storage = !storageError;
    if (storageError && !error) {
      error = `Storage error: ${storageError.message}`;
    }

  } catch (err) {
    error = err instanceof Error ? err.message : 'Unknown client health check error';
  }

  const latency = Date.now() - startTime;

  // Determine overall health status
  const healthyCount = [results.database, results.storage, results.auth].filter(Boolean).length;
  let status: 'healthy' | 'degraded' | 'unhealthy';

  if (healthyCount === 3) {
    status = 'healthy';
  } else if (healthyCount >= 2) {
    status = 'degraded';
  } else {
    status = 'unhealthy';
  }

  return {
    status,
    ...results,
    latency,
    error,
  };
}

/**
 * Health check cache to avoid excessive requests.
 * Simple in-memory cache with TTL.
 */
class HealthCheckCache {
  private cache: Map<string, { result: HealthCheckResult; timestamp: number }> = new Map();
  private readonly ttl = 30000; // 30 seconds

  async getCachedResult(key: string, checkFn: () => Promise<HealthCheckResult>): Promise<HealthCheckResult> {
    const cached = this.cache.get(key);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < this.ttl) {
      return cached.result;
    }

    const result = await checkFn();
    this.cache.set(key, { result, timestamp: now });
    return result;
  }

  clear(): void {
    this.cache.clear();
  }
}

export const healthCache = new HealthCheckCache();

/**
 * Get cached health check result.
 * Uses the cache to avoid excessive health checks.
 */
export async function getCachedHealthCheck(): Promise<HealthCheckResult> {
  return healthCache.getCachedResult('main', checkSupabaseHealth);
}

/**
 * Get cached client-side health check result.
 */
export async function getCachedClientHealthCheck(): Promise<HealthCheckResult> {
  return healthCache.getCachedResult('client', clientHealthCheck);
}
