import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireAuth, isAuthError, requireNotBanned } from '@/lib/server/auth';
import { CreateCollectionSchema, ListCollectionsQuerySchema } from '@/lib/schemas/collections';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/server/rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/collections
 * List collections with optional filters (user_id, visibility)
 * Auth: Optional (public collections visible to all, private requires ownership)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const query = ListCollectionsQuerySchema.safeParse(searchParams);

    if (!query.success) {
      return NextResponse.json(
        { error: { code: 'INVALID_PARAMS', message: query.error.message } },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    // Get user (optional for this endpoint, but may be used for RLS filtering)
    await supabase.auth.getUser();

    // Build query based on filters
    let dbQuery = supabase
      .from('collections')
      .select('id, user_id, name, description, visibility, created_at, updated_at', { count: 'exact' });

    // Filter by user_id if specified
    if (query.data.user_id) {
      dbQuery = dbQuery.eq('user_id', query.data.user_id);
    }

    // Filter by visibility if specified
    if (query.data.visibility) {
      dbQuery = dbQuery.eq('visibility', query.data.visibility);
    }

    // Apply RLS: Public collections visible to all, private only to owner
    // (RLS policies handle this automatically)

    const { data, error, count } = await dbQuery
      .order('created_at', { ascending: false })
      .range(query.data.offset, query.data.offset + query.data.limit - 1);

    if (error) {
      console.error('[Collections API] Database error:', error);
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: 'Failed to fetch collections' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      collections: data,
      total: count ?? 0,
      limit: query.data.limit,
      offset: query.data.offset,
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
 * POST /api/collections
 * Create a new collection
 * Auth: Required
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (isAuthError(authResult)) return authResult;
    const user = authResult;

    // Check if user is banned
    const banCheck = await requireNotBanned(user.id);
    if (banCheck) return banCheck;

    // Rate limiting
    const rateLimit = await checkRateLimit(`user:${user.id}`, 'create_collection');
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

    const validation = CreateCollectionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: validation.error.message } },
        { status: 400 }
      );
    }

    const collectionData = validation.data;

    // Create collection in database
    const supabase = await createSupabaseServerClient();
    const { data: collection, error } = await supabase
      .from('collections')
      .insert({
        user_id: user.id,
        name: collectionData.name,
        description: collectionData.description || null,
        visibility: collectionData.visibility,
      })
      .select('id, user_id, name, description, visibility, created_at, updated_at')
      .single();

    if (error) {
      console.error('[Collections API] Database error:', error);
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: 'Failed to create collection' } },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { collection },
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
