import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getUser, requireAuth, isAuthError } from '@/lib/server/auth';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/server/rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface RouteParams {
  params: { id: string };
}

/**
 * GET /api/animations/[id]/progressions
 * Returns all progressions for a base animation, ordered by progression_order.
 * Access rules:
 *   - Owner: always allowed
 *   - Public/link_shared base animation: allowed for anyone (unauthenticated too)
 *   - Private base animation: owner only
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    const user = await getUser(); // null when unauthenticated

    const supabase = await createSupabaseServerClient();

    // Fetch the base animation to check ownership and visibility
    const { data: base, error: baseError } = await supabase
      .from('saved_animations')
      .select('id, user_id, is_progression, visibility')
      .eq('id', id)
      .is('hidden_at', null)
      .single();

    if (baseError || !base) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Animation not found' } },
        { status: 404 }
      );
    }

    if (base.is_progression) {
      return NextResponse.json(
        { error: { code: 'INVALID_REQUEST', message: 'Cannot list progressions of a progression — only base animations have progressions' } },
        { status: 400 }
      );
    }

    // Access control: owner, or public/link_shared base
    const isOwner = user?.id === base.user_id;
    const isPubliclyAccessible = base.visibility === 'public' || base.visibility === 'link_shared';

    if (!isOwner && !isPubliclyAccessible) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'You do not have access to this animation' } },
        { status: 401 }
      );
    }

    // Fetch all progressions for this base animation
    const { data: progressions, error: progError } = await supabase
      .from('saved_animations')
      .select('id, title, description, animation_type, duration_ms, frame_count, visibility, upvote_count, created_at, updated_at, thumbnail_url, progression_order, current_version')
      .eq('parent_animation_id', id)
      .eq('is_progression', true)
      .is('hidden_at', null)
      .order('progression_order', { ascending: true });

    if (progError) {
      console.error('[Progressions API] DB error:', progError);
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: `Failed to fetch progressions: ${progError.message}` } },
        { status: 500 }
      );
    }

    return NextResponse.json({ progressions: progressions ?? [] });
  } catch (err) {
    console.error('[Progressions API] Fatal Error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/animations/[id]/progressions
 * Creates a new progression child animation linked to a base animation.
 * Requires auth — user must own the base animation.
 */
export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    const authResult = await requireAuth();
    if (isAuthError(authResult)) return authResult;
    const user = authResult;

    // Rate limit: prevent progression creation spam
    const rateLimitResult = await checkRateLimit(user.id, 'progression_create');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' } },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    const supabase = await createSupabaseServerClient();

    // Verify user owns the base animation and it is not itself a progression
    const { data: base, error: baseError } = await supabase
      .from('saved_animations')
      .select('id, user_id, is_progression')
      .eq('id', id)
      .eq('user_id', user.id)
      .is('hidden_at', null)
      .single();

    if (baseError || !base) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Animation not found or you do not own it' } },
        { status: 404 }
      );
    }

    if (base.is_progression) {
      return NextResponse.json(
        { error: { code: 'INVALID_REQUEST', message: 'Cannot create a progression of a progression' } },
        { status: 400 }
      );
    }

    // Check current progression count (max 5)
    const { count: existingCount } = await supabase
      .from('saved_animations')
      .select('id', { count: 'exact', head: true })
      .eq('parent_animation_id', id)
      .eq('is_progression', true)
      .is('hidden_at', null);

    if ((existingCount ?? 0) >= 5) {
      return NextResponse.json(
        { error: { code: 'LIMIT_EXCEEDED', message: 'Maximum of 5 progressions per animation reached' } },
        { status: 422 }
      );
    }

    const progressionOrder = (existingCount ?? 0) + 1;

    const { data: progression, error: insertError } = await supabase
      .from('saved_animations')
      .insert({
        user_id: user.id,
        parent_animation_id: id,
        is_progression: true,
        progression_order: progressionOrder,
        title: `Progression ${progressionOrder}`,
        visibility: 'private',
      })
      .select('id, title, progression_order, created_at')
      .single();

    if (insertError) {
      console.error('[Progressions API] Insert error:', insertError);
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: `Failed to create progression: ${insertError.message}` } },
        { status: 500 }
      );
    }

    return NextResponse.json(progression, { status: 201 });
  } catch (err) {
    console.error('[Progressions API] Fatal POST Error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
