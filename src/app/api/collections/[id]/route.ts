import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireAuth, isAuthError, requireNotBanned } from '@/lib/server/auth';
import { UpdateCollectionSchema } from '@/lib/schemas/collections';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/server/rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/collections/[id]
 * Get a collection with its animations
 * Auth: Optional (public collections visible to all, private requires ownership)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabase = await createSupabaseServerClient();

    // Fetch collection (RLS will filter based on visibility and ownership)
    const { data: collection, error: collectionError } = await supabase
      .from('collections')
      .select('id, user_id, name, description, visibility, created_at, updated_at')
      .eq('id', id)
      .single();

    if (collectionError || !collection) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Collection not found' } },
        { status: 404 }
      );
    }

    // Fetch animations in this collection
    const { data: items, error: itemsError } = await supabase
      .from('collection_items')
      .select(`
        animation_id,
        added_at,
        saved_animations (
          id,
          title,
          animation_type,
          thumbnail,
          duration_ms,
          frame_count,
          visibility,
          upvote_count,
          created_at
        )
      `)
      .eq('collection_id', id)
      .order('added_at', { ascending: false });

    if (itemsError) {
      console.error('[Collections API] Failed to fetch collection items:', itemsError);
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: 'Failed to fetch collection items' } },
        { status: 500 }
      );
    }

    // Flatten the joined data
    const animations = items.map(item => ({
      ...item.saved_animations,
      added_at: item.added_at,
    }));

    return NextResponse.json({
      collection,
      animations,
    });
  } catch (err) {
    console.error('[Collections API] Fatal GET Error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/collections/[id]
 * Update collection metadata (name, description, visibility)
 * Auth: Required (owner only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const authResult = await requireAuth();
    if (isAuthError(authResult)) return authResult;
    const user = authResult;

    // Check if user is banned
    const banCheck = await requireNotBanned(user.id);
    if (banCheck) return banCheck;

    // Rate limiting
    const rateLimit = await checkRateLimit(`user:${user.id}`, 'update_collection');
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

    const validation = UpdateCollectionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: validation.error.message } },
        { status: 400 }
      );
    }

    const updateData = validation.data;

    // Update collection (RLS enforces ownership)
    const supabase = await createSupabaseServerClient();
    const { data: collection, error } = await supabase
      .from('collections')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id) // Explicit ownership check
      .select('id, user_id, name, description, visibility, created_at, updated_at')
      .single();

    if (error || !collection) {
      console.error('[Collections API] Update error:', error);
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Collection not found or not authorized' } },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { collection },
      { headers: getRateLimitHeaders(rateLimit) }
    );
  } catch (err) {
    console.error('[Collections API] Fatal PUT Error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/collections/[id]
 * Delete a collection (cascade deletes collection_items)
 * Auth: Required (owner only)
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const authResult = await requireAuth();
    if (isAuthError(authResult)) return authResult;
    const user = authResult;

    // Check if user is banned
    const banCheck = await requireNotBanned(user.id);
    if (banCheck) return banCheck;

    // Rate limiting
    const rateLimit = await checkRateLimit(`user:${user.id}`, 'delete_collection');
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' } },
        { status: 429, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    // Delete collection (RLS enforces ownership, CASCADE deletes items)
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // Explicit ownership check

    if (error) {
      console.error('[Collections API] Delete error:', error);
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: 'Failed to delete collection' } },
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
