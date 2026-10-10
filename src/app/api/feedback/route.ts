import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getUser, requireNotBanned } from '@/lib/server/auth';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/server/rate-limit';
import { FeedbackSchema } from '@/lib/schemas/feedback';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || request.headers.get('x-real-ip') || 'unknown';
}

/**
 * POST /api/feedback: send feedback. Signed-out visitors may submit (rate
 * limited by IP); banned accounts may not.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();

    if (user) {
      const banCheck = await requireNotBanned(user.id);
      if (banCheck) return banCheck;
    }

    const rateLimit = await checkRateLimit(user ? `user:${user.id}` : `ip:${clientIp(request)}`, 'feedback');
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: { code: 'RATE_LIMITED', message: 'Too many submissions. Please try again later.' } },
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

    const parsed = FeedbackSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
        { status: 400 }
      );
    }
    const { name, email, area, what, rating } = parsed.data;

    // No .select(): signed-out submitters have no SELECT right on this table.
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from('feedback').insert({
      name,
      email: email || null,
      area,
      what,
      rating,
      // Lets account deletion anonymise this row (see migration 20261010100000).
      user_id: user?.id ?? null,
    });

    if (error) {
      console.error('[Feedback API] Insert error:', error);
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: 'Failed to send feedback' } },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true }, { status: 201, headers: getRateLimitHeaders(rateLimit) });
  } catch (err) {
    console.error('[Feedback API] Fatal POST Error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
