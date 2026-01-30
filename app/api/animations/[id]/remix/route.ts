import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../../../lib/supabase/server';
import { requireAuth, isAuthError, requireNotBanned } from '../../../../../lib/auth';
import { checkQuota } from '../../../../../lib/quota';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface RouteParams {
  params: { id: string };
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  const { id } = params;
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;
  const user = authResult;

  // Check if user is banned
  const banCheck = await requireNotBanned(user.id);
  if (banCheck) return banCheck;
  const supabase = await createSupabaseServerClient();

  // Fetch the original animation (must be public)
  const { data: original, error: fetchError } = await supabase
    .from('saved_animations')
    .select('*')
    .eq('id', id)
    .eq('visibility', 'public')
    .is('hidden_at', null)
    .single();

  if (fetchError || !original) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Animation not found or not public' } },
      { status: 404 }
    );
  }

  // Check user quota
  const quota = await checkQuota(user.id);
  if (!quota.allowed) {
    return NextResponse.json(
      { error: { code: 'QUOTA_EXCEEDED', message: `You have reached the maximum of ${quota.max} animations. Delete some to create more.` } },
      { status: 403 }
    );
  }

  // Create the remix (copy with modified title, set to private)
  const remixTitle = `${original.title} (Remix)`.slice(0, 100); // Ensure title fits constraint

  const { data: remix, error: insertError } = await supabase
    .from('saved_animations')
    .insert({
      user_id: user.id,
      title: remixTitle,
      description: original.description,
      coaching_notes: original.coaching_notes,
      animation_type: original.animation_type,
      tags: original.tags,
      payload: original.payload,
      duration_ms: original.duration_ms,
      frame_count: original.frame_count,
      visibility: 'private', // Remixes start as private
    })
    .select('id, title, created_at')
    .single();

  if (insertError) {
    console.error('Remix insert error:', insertError);
    return NextResponse.json(
      { error: { code: 'DB_ERROR', message: `Failed to create remix: ${insertError.message}` } },
      { status: 500 }
    );
  }

  return NextResponse.json({
    id: remix.id,
    title: remix.title,
    created_at: remix.created_at,
  }, { status: 201 });
}
