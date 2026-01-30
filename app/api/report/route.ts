import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../lib/supabase/server';
import { requireAuth, isAuthError } from '../../../lib/auth';
import { ReportSchema } from '../../../lib/schemas/animations';
import { checkRateLimit, getRateLimitHeaders } from '../../../lib/rate-limit';

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;
  const user = authResult;

  // Rate limit: 5 reports per hour
  const rateLimitResult = await checkRateLimit(user.id, 'report');
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: { code: 'RATE_LIMITED', message: 'Too many reports. Please try again later.' } },
      { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
    );
  }

  // Parse and validate request body
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: 'INVALID_JSON', message: 'Invalid JSON body' } },
      { status: 400 }
    );
  }

  const parsed = ReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
      { status: 400 }
    );
  }

  const { animation_id, reason, details } = parsed.data;
  const supabase = await createSupabaseServerClient();

  // Verify animation exists and is public
  const { data: animation, error: animationError } = await supabase
    .from('saved_animations')
    .select('id, visibility, user_id')
    .eq('id', animation_id)
    .is('hidden_at', null)
    .single();

  if (animationError || !animation) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Animation not found' } },
      { status: 404 }
    );
  }

  // Cannot report private animations
  if (animation.visibility === 'private') {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Animation not found' } },
      { status: 404 }
    );
  }

  // Cannot report own animation
  if (animation.user_id === user.id) {
    return NextResponse.json(
      { error: { code: 'BAD_REQUEST', message: 'Cannot report your own animation' } },
      { status: 400 }
    );
  }

  // Check if user already reported this animation
  const { data: existingReport } = await supabase
    .from('content_reports')
    .select('id')
    .eq('animation_id', animation_id)
    .eq('reporter_id', user.id)
    .single();

  if (existingReport) {
    return NextResponse.json(
      { error: { code: 'ALREADY_REPORTED', message: 'You have already reported this animation' } },
      { status: 400 }
    );
  }

  // Create report
  const { data: report, error: insertError } = await supabase
    .from('content_reports')
    .insert({
      animation_id,
      reporter_id: user.id,
      reason,
      details: details || null,
      status: 'pending',
    })
    .select('id, created_at')
    .single();

  if (insertError) {
    console.error('Database error:', insertError);
    return NextResponse.json(
      { error: { code: 'DB_ERROR', message: 'Failed to create report' } },
      { status: 500 }
    );
  }

  return NextResponse.json({
    id: report.id,
    created_at: report.created_at,
  }, { headers: getRateLimitHeaders(rateLimitResult) });
}
