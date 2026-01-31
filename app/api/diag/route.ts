import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../lib/supabase/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
    const result = {
        env: {
            supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            urlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 12) + '...',
        },
        server_client: 'unknown',
        database: 'unknown',
        timestamp: new Date().toISOString(),
    };

    try {
        const supabase = await createSupabaseServerClient();
        result.server_client = 'initialized';

        const { error } = await supabase.from('saved_animations').select('id').limit(1);
        if (error) {
            result.database = `error: ${error.message}`;
        } else {
            result.database = 'connected';
        }
    } catch (err) {
        result.server_client = `failed: ${err instanceof Error ? err.message : String(err)}`;
    }

    return NextResponse.json(result);
}
