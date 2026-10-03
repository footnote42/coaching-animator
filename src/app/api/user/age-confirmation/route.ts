import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireAuth, isAuthError } from '@/lib/server/auth';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/server/rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const AgeConfirmationSchema = z.object({ confirmed: z.literal(true) });

/** Records that the signed-in person declared they are 18 or over (ADR 0003). */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (isAuthError(authResult)) return authResult;
    const user = authResult;

    const rateLimitResult = await checkRateLimit(user.id, 'profile_update');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' } },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
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

    const parsed = AgeConfirmationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'You must confirm you are 18 or over' } },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    // Only set when still empty, so the original confirmation date is kept.
    const { error } = await supabase
      .from('user_profiles')
      .update({ age_confirmed_at: new Date().toISOString() })
      .eq('id', user.id)
      .is('age_confirmed_at', null);

    if (error) {
      console.error('[Age Confirmation API] Database error:', error);
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: 'Failed to record confirmation' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ confirmed: true });
  } catch (err) {
    console.error('[Age Confirmation API] Fatal error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
