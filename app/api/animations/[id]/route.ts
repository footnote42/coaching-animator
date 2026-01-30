import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';
import { getUser, requireAuth, isAuthError, requireNotBanned } from '../../../../lib/auth';
import { UpdateAnimationSchema } from '../../../../lib/schemas/animations';
import { validateAnimationContent } from '../../../../lib/moderation';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const user = await getUser();
  const supabase = await createSupabaseServerClient();

  // Fetch animation
  const { data: animation, error } = await supabase
    .from('saved_animations')
    .select('*')
    .eq('id', id)
    .is('hidden_at', null)
    .single();

  if (error || !animation) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Animation not found' } },
      { status: 404 }
    );
  }

  // Fetch author display name separately
  let authorDisplayName: string | null = null;
  if (animation.user_id) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('display_name')
      .eq('id', animation.user_id)
      .single();
    authorDisplayName = profile?.display_name ?? null;
  }

  // Check access permissions
  const isOwner = user?.id === animation.user_id;
  const isPublic = animation.visibility === 'public';
  const isLinkShared = animation.visibility === 'link_shared';

  if (!isOwner && !isPublic && !isLinkShared) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'You do not have access to this animation' } },
      { status: 401 }
    );
  }

  // Check if user has upvoted (only if authenticated)
  let userHasUpvoted = false;
  if (user) {
    const { data: upvote } = await supabase
      .from('upvotes')
      .select('user_id')
      .eq('animation_id', id)
      .eq('user_id', user.id)
      .single();
    userHasUpvoted = !!upvote;
  }

  // Increment view count for non-owners
  if (!isOwner) {
    await supabase
      .from('saved_animations')
      .update({ view_count: animation.view_count + 1 })
      .eq('id', id);
  }

  return NextResponse.json({
    ...animation,
    author: {
      display_name: authorDisplayName,
    },
    user_has_upvoted: userHasUpvoted,
    is_owner: isOwner,
  });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;
  const user = authResult;

  // Check if user is banned
  const banCheck = await requireNotBanned(user.id);
  if (banCheck) return banCheck;

  const supabase = await createSupabaseServerClient();

  // Check ownership
  const { data: existing, error: fetchError } = await supabase
    .from('saved_animations')
    .select('user_id')
    .eq('id', id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Animation not found' } },
      { status: 404 }
    );
  }

  if (existing.user_id !== user.id) {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: 'You do not own this animation' } },
      { status: 403 }
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

  const parsed = UpdateAnimationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // Check content moderation if text fields are being updated
  if (data.title || data.description || data.coaching_notes) {
    const moderation = validateAnimationContent({
      title: data.title,
      description: data.description,
      coaching_notes: data.coaching_notes,
    });

    if (!moderation.passed) {
      return NextResponse.json(
        { error: { code: 'CONTENT_VIOLATION', message: `Content contains inappropriate language: ${moderation.flaggedWords.join(', ')}` } },
        { status: 400 }
      );
    }
  }

  // Build update object
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.coaching_notes !== undefined) updateData.coaching_notes = data.coaching_notes;
  if (data.animation_type !== undefined) updateData.animation_type = data.animation_type;
  if (data.tags !== undefined) updateData.tags = data.tags;
  if (data.visibility !== undefined) updateData.visibility = data.visibility;

  if (data.payload !== undefined) {
    updateData.payload = data.payload;
    updateData.frame_count = data.payload.frames?.length ?? 0;
    updateData.duration_ms = data.payload.frames?.reduce((sum: number, frame: { duration?: number }) => sum + (frame.duration ?? 1000), 0) ?? 0;
  }

  const { data: updated, error: updateError } = await supabase
    .from('saved_animations')
    .update(updateData)
    .eq('id', id)
    .select('id, updated_at')
    .single();

  if (updateError) {
    console.error('Database error:', updateError);
    return NextResponse.json(
      { error: { code: 'DB_ERROR', message: 'Failed to update animation' } },
      { status: 500 }
    );
  }

  return NextResponse.json(updated);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;
  const user = authResult;

  const supabase = await createSupabaseServerClient();

  // Check ownership
  const { data: existing, error: fetchError } = await supabase
    .from('saved_animations')
    .select('user_id')
    .eq('id', id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Animation not found' } },
      { status: 404 }
    );
  }

  if (existing.user_id !== user.id) {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: 'You do not own this animation' } },
      { status: 403 }
    );
  }

  const { error: deleteError } = await supabase
    .from('saved_animations')
    .delete()
    .eq('id', id);

  if (deleteError) {
    console.error('Animation delete error:', deleteError);
    return NextResponse.json(
      { error: { code: 'DB_ERROR', message: `Failed to delete animation: ${deleteError.message}` } },
      { status: 500 }
    );
  }

  return new NextResponse(null, { status: 204 });
}
