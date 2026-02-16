import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireAuth, isAuthError, requireNotBanned } from '@/lib/server/auth';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/server/rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * DELETE /api/collections/[id]/animations/[animationId]
 * Remove an animation from a collection
 * Auth: Required (collection owner only)
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; animationId: string }> }
) {
  try {
    const { id: collectionId, animationId } = await params;

    const authResult = await requireAuth();
    if (isAuthError(authResult)) return authResult;
    const user = authResult;

    // Check if user is banned
    const banCheck = await requireNotBanned(user.id);
    if (banCheck) return banCheck;

    // Rate limiting
    const rateLimit = await checkRateLimit(`user:${user.id}`, 'remove_from_collection');
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' } },
        { status: 429, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    const supabase = await createSupabaseServerClient();

    // Verify collection exists and user owns it
    const { data: collection, error: collectionError } = await supabase
      .from('collections')
      .select('id, user_id')
      .eq('id', collectionId)
      .eq('user_id', user.id)
      .single();

    if (collectionError || !collection) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Collection not found or not authorized' } },
        { status: 404 }
      );
    }

    // Remove animation from collection (RLS enforces ownership via collection)
    const { error: deleteError } = await supabase
      .from('collection_items')
      .delete()
      .eq('collection_id', collectionId)
      .eq('animation_id', animationId);

    if (deleteError) {
      console.error('[Collections API] Failed to remove animation:', deleteError);
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: 'Failed to remove animation from collection' } },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true },
      { headers: getRateLimitHeaders(rateLimit) }
    );
  } catch (err) {
    console.error('[Collections API] Fatal DELETE Error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
