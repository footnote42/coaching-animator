import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
    try {
        const result = {
            ok: true,
            timestamp: new Date().toISOString(),
            env: {
                hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
                hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
                nodeEnv: process.env.NODE_ENV,
                urlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL ? process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 15) : 'missing'
            }
        };
        return NextResponse.json(result);
    } catch (err) {
        return NextResponse.json({
            ok: false,
            error: err instanceof Error ? err.message : String(err)
        }, { status: 500 });
    }
}
