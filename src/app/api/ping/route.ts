// Ultra-minimal API route for testing Vercel function execution
// No imports, no dependencies - just a basic response

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
    return new Response(JSON.stringify({
        ok: true,
        test: 'minimal-api-working',
        time: new Date().toISOString()
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

export async function POST() {
    return new Response(JSON.stringify({
        ok: true,
        method: 'POST',
        test: 'minimal-api-working'
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
