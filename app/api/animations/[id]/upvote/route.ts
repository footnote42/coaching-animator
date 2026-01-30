import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../../../lib/supabase/server';
import { requireAuth, isAuthError } from '../../../../../lib/auth';

interface RouteParams {
  params: { id: string };
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  const { id } = params;
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;
  const user = authResult;

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

  // Check if user already upvoted
  const { data: existingUpvote } = await supabase
    .from('upvotes')
    .select('user_id')
    .eq('animation_id', id)
    .eq('user_id', user.id)
    .single();

  let upvoted: boolean;
  let newCount: number;

  if (existingUpvote) {
    // Remove upvote
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
    // Add upvote
    const { error: insertError } = await supabase
      .from('upvotes')
      .insert({ animation_id: id, user_id: user.id });

    if (insertError) {
      console.error('Upvote insert error:', insertError);
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: `Failed to add upvote: ${insertError.message}` } },
        { status: 500 }
      );
    }

    upvoted = true;
    newCount = animation.upvote_count + 1;
  }

  // Note: The database has a trigger that updates upvote_count automatically
  // But we return the expected new count for immediate UI feedback

  return NextResponse.json({
    upvoted,
    upvote_count: newCount,
  });
}
