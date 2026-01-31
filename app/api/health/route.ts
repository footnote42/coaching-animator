import { NextResponse } from 'next/server';
import { quickHealthCheck } from '../../../lib/supabase/health';

export const dynamic = 'force-dynamic';

export async function GET() {
    const health = await quickHealthCheck();

    if (!health.healthy) {
        return NextResponse.json(
            {
                status: 'unhealthy',
                error: health.error,
                latency: health.latency,
                timestamp: new Date().toISOString()
            },
            { status: 503 }
        );
    }

    return NextResponse.json({
        status: 'healthy',
        latency: health.latency,
        timestamp: new Date().toISOString()
    });
}
