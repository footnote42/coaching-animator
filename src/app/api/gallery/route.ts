import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/server/auth';
import { GalleryQuerySchema } from '@/lib/schemas/animations';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  console.log('[Gallery API] GET request received');
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const query = GalleryQuerySchema.safeParse(searchParams);

    if (!query.success) {
      return NextResponse.json(
        { error: { code: 'INVALID_PARAMS', message: query.error.message } },
        { status: 400 }
      );
    }

    const { q, type, tags, sort, order, limit, offset } = query.data;

    // Make auth optional and resilient in gallery
    let user = null;
    try {
      user = await getUser();
    } catch (err) {
      console.error('[Gallery API] Error getting user:', err);
    }

    const supabase = await createSupabaseServerClient();

    // Build query for public animations only
    // Phase 2: filter out progression children (show one card per progression set)
    // and join remix attribution in the same flat SELECT
    let dbQuery = supabase
      .from('saved_animations')
      .select(`
      id,
      title,
      description,
      animation_type,
      tags,
      duration_ms,
      frame_count,
      upvote_count,
      created_at,
      user_id,
      progression_count,
      remix_count,
      remixed_from_id,
      remixed_from:remixed_from_id (
        id,
        title
      ),
      user_profiles (
        display_name
      )
    `, { count: 'exact' })
      .eq('visibility', 'public')
      .is('hidden_at', null)
      .eq('is_progression', false);

    // Text search
    if (q) {
      dbQuery = dbQuery.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
    }

    // Filter by animation type
    if (type) {
      dbQuery = dbQuery.eq('animation_type', type);
    }

    // Filter by tags
    if (tags) {
      const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
      if (tagArray.length > 0) {
        dbQuery = dbQuery.overlaps('tags', tagArray);
      }
    }

    // Sorting
    dbQuery = dbQuery.order(sort, { ascending: order === 'asc' });

    // Pagination
    dbQuery = dbQuery.range(offset, offset + limit - 1);

    const { data, error, count } = await dbQuery;

    if (error) {
      console.error('[Gallery API] Database error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: `Database error: ${error.message}` } },
        { status: 500 }
      );
    }

    // Check if user has upvoted each animation (if authenticated)
    let upvotedIds: Set<string> = new Set();
    if (user && data && data.length > 0) {
      try {
        const animationIds = data.map(a => a.id);
        const { data: upvotes, error: upvoteError } = await supabase
          .from('upvotes')
          .select('animation_id')
          .eq('user_id', user.id)
          .in('animation_id', animationIds);

        if (!upvoteError) {
          upvotedIds = new Set(upvotes?.map(u => u.animation_id) || []);
        }
      } catch (err) {
        console.error('[Gallery API] Error fetching upvotes:', err);
      }
    }

    // Transform response
    interface AnimationRow {
      id: string;
      title: string;
      description: string | null;
      animation_type: string;
      tags: string[];
      duration_ms: number;
      frame_count: number;
      upvote_count: number;
      created_at: string;
      user_id: string;
      progression_count: number;
      remix_count: number;
      remixed_from_id: string | null;
      remixed_from: { id: string; title: string } | { id: string; title: string }[] | null;
      user_profiles: { display_name: string | null } | null;
    }

    const animations = (data as unknown as AnimationRow[])?.map((animation) => {
      // Handle the case where user_profiles might be returned as an array or object
      const profiles = animation.user_profiles;
      const profile = Array.isArray(profiles) ? profiles[0] : profiles;
      const authorName = profile?.display_name ?? 'Anonymous';

      // Flatten remixed_from join into a title string
      const remixedFrom = Array.isArray(animation.remixed_from)
        ? animation.remixed_from[0]
        : animation.remixed_from;

      return {
        id: animation.id,
        title: animation.title,
        description: animation.description,
        animation_type: animation.animation_type,
        tags: animation.tags,
        duration_ms: animation.duration_ms,
        frame_count: animation.frame_count,
        upvote_count: animation.upvote_count,
        created_at: animation.created_at,
        user_id: animation.user_id,
        progression_count: animation.progression_count,
        remix_count: animation.remix_count,
        remixed_from_id: animation.remixed_from_id,
        remixed_from_title: remixedFrom?.title ?? null,
        author: {
          display_name: authorName,
        },
        user_has_upvoted: upvotedIds.has(animation.id),
      };
    }) || [];

    return NextResponse.json({
      animations,
      total: count ?? 0,
      limit,
      offset,
    });
  } catch (err) {
    console.error('[Gallery API] Fatal Error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
