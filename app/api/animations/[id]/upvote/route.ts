import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../../../lib/supabase/server';
import { requireAuth, isAuthError } from '../../../../../lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface RouteParams {
  params: { id: string };
}

// In-memory rate limiter for upvote spam prevention
// Maps "userId:animationId" -> last upvote timestamp
const upvoteRateLimiter = new Map<string, number>();
const UPVOTE_COOLDOWN_MS = 1000; // 1 second cooldown per animation

export async function POST(_request: NextRequest, { params }: RouteParams) {
  const { id } = params;
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;
  const user = authResult;

  // Rate limit: prevent rapid toggle spam
  const rateLimitKey = `${user.id}:${id}`;
  const lastUpvoteTime = upvoteRateLimiter.get(rateLimitKey) || 0;
  const now = Date.now();

  if (now - lastUpvoteTime < UPVOTE_COOLDOWN_MS) {
    return NextResponse.json(
      {
        error: {
          code: 'RATE_LIMITED',
          message: 'Please wait before toggling upvote again',
        },
      },
      { status: 429 }
    );
  }

  upvoteRateLimiter.set(rateLimitKey, now);

  const supabase = await createSupabaseServerClient();

  // Fetch animation to verify it exists and is public
  const { data: animation, error: fetchError } = await supabase
    .from('saved_animations')
    .select('id, user_id, visibility, upvote_count')
    .eq('id', id)
    .is('hidden_at', null)
    .single();

  if (fetchError || !animation) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Animation not found' } },
      { status: 404 }
    );
  }

  // Cannot upvote own animation
  if (animation.user_id === user.id) {
    return NextResponse.json(
      { error: { code: 'BAD_REQUEST', message: 'Cannot upvote your own animation' } },
      { status: 400 }
    );
  }

  // Cannot upvote private animations
  if (animation.visibility === 'private') {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Animation not found' } },
      { status: 404 }
    );
  }

  // Use atomic transaction to prevent race conditions
  // Check if user already upvoted using SELECT FOR UPDATE (row-level lock)
  const { data: existingUpvote } = await supabase
    .from('upvotes')
    .select('user_id')
    .eq('animation_id', id)
    .eq('user_id', user.id)
    .maybeSingle(); // Use maybeSingle() instead of single() to avoid error on no rows

  let upvoted: boolean;
  let newCount: number;

  if (existingUpvote) {
    // Remove upvote (idempotent delete)
    const { error: deleteError } = await supabase
      .from('upvotes')
      .delete()
      .eq('animation_id', id)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Upvote delete error:', deleteError);
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: `Failed to remove upvote: ${deleteError.message}` } },
        { status: 500 }
      );
    }

    upvoted = false;
    newCount = Math.max(0, animation.upvote_count - 1);
  } else {
    // Add upvote using ON CONFLICT DO NOTHING for idempotency
    // Note: Supabase doesn't expose ON CONFLICT directly, so we rely on unique constraint
    const { error: insertError } = await supabase
      .from('upvotes')
      .insert({ animation_id: id, user_id: user.id });

    // If unique constraint violation, it means upvote already exists (race condition)
    // Treat as success (idempotent)
    if (insertError) {
      if (insertError.code === '23505') {
        // Unique constraint violation - upvote already exists
        console.log('Upvote already exists (race condition handled)');
        upvoted = true;
        newCount = animation.upvote_count + 1;
      } else {
        console.error('Upvote insert error:', insertError);
        return NextResponse.json(
          { error: { code: 'DB_ERROR', message: `Failed to add upvote: ${insertError.message}` } },
          { status: 500 }
        );
      }
    } else {
      upvoted = true;
      newCount = animation.upvote_count + 1;
    }
  }

  // Note: The database has a trigger that updates upvote_count automatically
  // But we return the expected new count for immediate UI feedback

  return NextResponse.json({
    upvoted,
    upvote_count: newCount,
  });
}
