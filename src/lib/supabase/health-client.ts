import { createSupabaseBrowserClient } from './client';
import { HealthCheckResult } from './health';

export { type HealthCheckResult } from './health';

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
 * Quick client health check - only tests database connectivity.
 * Used for frequent checks where full health check is too expensive.
 */
export async function quickClientHealthCheck(): Promise<{ healthy: boolean; latency: number; error?: string }> {
    const startTime = Date.now();

    try {
        const client = createSupabaseBrowserClient();

        // 3-second timeout for health check
        const { error } = await Promise.race([
            client.from('saved_animations').select('id').eq('visibility', 'public').limit(1),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
        ]);

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
