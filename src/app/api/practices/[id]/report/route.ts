import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getUser, requireNotBanned } from '@/lib/server/auth';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/server/rate-limit';
import { PracticeReportSchema } from '@/lib/schemas/practices';
import { getSharedPractice } from '@/lib/server/practices';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface RouteParams {
  params: { id: string };
}

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || request.headers.get('x-real-ip') || 'unknown';
}

/**
 * POST /api/practices/[id]/report: report a link or public Practice.
 * Signed-out viewers may report (rate limited by IP); banned accounts may not.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getUser();

    if (user) {
      const banCheck = await requireNotBanned(user.id);
      if (banCheck) return banCheck;
    }

    const rateLimit = await checkRateLimit(user ? `user:${user.id}` : `ip:${clientIp(request)}`, 'practice_report');
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: { code: 'RATE_LIMITED', message: 'Too many reports. Please try again later.' } },
        { status: 429, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: { code: 'INVALID_JSON', message: 'Invalid JSON body' } },
        { status: 400 }
      );
    }

    const parsed = PracticeReportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
        { status: 400 }
      );
    }
    const { reason, details } = parsed.data;

    // Only a Practice the reporter can actually see: never a private or hidden one.
    const practice = await getSharedPractice(params.id);
    if (!practice || practice.visibility === 'private') {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Practice not found' } }, { status: 404 });
    }
    if (user && practice.owner_id === user.id) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Cannot report your own Practice' } },
        { status: 400 }
      );
    }

    // No .select(): signed-out reporters have no SELECT right on this table.
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from('practice_reports').insert({
      practice_id: practice.id,
      reporter_id: user?.id ?? null,
      reason,
      details: details || null,
    });

    if (error) {
      console.error('[Practice Reports API] Insert error:', error);
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: 'Failed to create report' } },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true }, { status: 201, headers: getRateLimitHeaders(rateLimit) });
  } catch (err) {
    console.error('[Practice Reports API] Fatal POST Error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
