import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { getSiteOrigin } from '@/lib/site-origin';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/server/rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const ResendVerificationSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ResendVerificationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid email address' } },
        { status: 400 }
      );
    }

    // IP-based rate limit: prevent email bombing
    const ip =
      request.headers.get('x-forwarded-for') ??
      request.headers.get('x-real-ip') ??
      'unknown';
    const rateLimitResult = await checkRateLimit(ip, 'resend_verification');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' } },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    const { email } = parsed.data;
    const supabase = await createSupabaseServerClient();

    // Resend verification email
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${getSiteOrigin()}/auth/confirm`,
      },
    });

    if (error) {
      console.error('Resend verification error:', error);
      return NextResponse.json(
        {
          error: {
            code: 'RESEND_FAILED',
            message: error.message || 'Failed to resend verification email',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Verification email sent. Please check your inbox.',
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
