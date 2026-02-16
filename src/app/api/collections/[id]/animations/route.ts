import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireAuth, isAuthError, requireNotBanned } from '@/lib/server/auth';
import { AddAnimationToCollectionSchema } from '@/lib/schemas/collections';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/server/rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/collections/[id]/animations
 * Add an animation to a collection
 * Auth: Required (collection owner only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: collectionId } = await params;

    const authResult = await requireAuth();
    if (isAuthError(authResult)) return authResult;
    const user = authResult;

    // Check if user is banned
    const banCheck = await requireNotBanned(user.id);
    if (banCheck) return banCheck;

    // Rate limiting
    const rateLimit = await checkRateLimit(`user:${user.id}`, 'add_to_collection');
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' } },
        { status: 429, headers: getRateLimitHeaders(rateLimit) }
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

    const validation = AddAnimationToCollectionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: validation.error.message } },
        { status: 400 }
      );
    }

    const { animation_id } = validation.data;

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

    // Verify animation exists
    const { data: animation, error: animationError } = await supabase
      .from('saved_animations')
      .select('id')
      .eq('id', animation_id)
      .single();

    if (animationError || !animation) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Animation not found' } },
        { status: 404 }
      );
    }

    // Add animation to collection (UNIQUE constraint prevents duplicates)
    const { data: item, error: insertError } = await supabase
      .from('collection_items')
      .insert({
        collection_id: collectionId,
        animation_id: animation_id,
      })
      .select('id, collection_id, animation_id, added_at')
      .single();

    if (insertError) {
      // Check for duplicate constraint violation (UNIQUE constraint on collection_id + animation_id)
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: { code: 'DUPLICATE', message: 'Animation already in collection' } },
          { status: 409 }
        );
      }

      console.error('[Collections API] Failed to add animation:', insertError);
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: 'Failed to add animation to collection' } },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { item },
      { status: 201, headers: getRateLimitHeaders(rateLimit) }
    );
  } catch (err) {
    console.error('[Collections API] Fatal POST Error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
