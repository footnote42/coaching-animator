import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/server/auth';

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
