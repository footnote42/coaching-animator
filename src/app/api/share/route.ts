import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireAuth, isAuthError, requireNotBanned } from '@/lib/server/auth';
import { validatePayloadSize } from '@/lib/schemas/animations';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/server/rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (isAuthError(authResult)) return authResult;
    const user = authResult;

    // Check if user is banned
    const banCheck = await requireNotBanned(user.id);
    if (banCheck) return banCheck;

    // Rate limiting
    const rateLimit = await checkRateLimit(`user:${user.id}`, 'create_animation');
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' } },
        { status: 429, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    // Parse request body
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: { code: 'INVALID_JSON', message: 'Invalid JSON body' } },
        { status: 400 }
      );
    }

    // Validate payload size
    const sizeCheck = validatePayloadSize(body);
    if (!sizeCheck.valid) {
      return NextResponse.json(
        { error: { code: 'PAYLOAD_TOO_LARGE', message: sizeCheck.error } },
        { status: 413 }
      );
    }

    // Compute frame count and duration from payload
    const frames = Array.isArray(body.frames) ? body.frames : [];
    const frameCount = frames.length;
    const durationMs = frames.reduce(
      (sum: number, frame: { duration?: number }) => sum + (frame.duration ?? 1000),
      0
    );

    const title = (typeof body.name === 'string' && body.name.trim())
      ? body.name.trim()
      : 'Untitled Animation';

    const supabase = await createSupabaseServerClient();

    // Upsert — if this animation was already shared by this user with the same
    // payload, we return the existing id rather than creating duplicates.
    // Simple insert for now; upsert requires a unique constraint we don't have.
    const { data: animation, error } = await supabase
      .from('saved_animations')
      .insert({
        user_id: user.id,
        title,
        animation_type: 'tactic',
        payload: body,
        frame_count: frameCount,
        duration_ms: durationMs,
        visibility: 'link_shared',
        tags: [],
      })
      .select('id')
      .single();

    if (error) {
      console.error('[Share API] Database error:', error);
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: 'Failed to save animation' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ id: animation.id }, { status: 201 });
  } catch (err) {
    console.error('[Share API] Fatal POST error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
