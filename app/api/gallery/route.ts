import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../lib/supabase/server';
import { getUser } from '../../../lib/auth';
import { GalleryQuerySchema } from '../../../lib/schemas/animations';

export async function GET(request: NextRequest) {
  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  const query = GalleryQuerySchema.safeParse(searchParams);

  if (!query.success) {
    return NextResponse.json(
      { error: { code: 'INVALID_PARAMS', message: query.error.message } },
      { status: 400 }
    );
  }

  const { q, type, tags, sort, order, limit, offset } = query.data;
  const user = await getUser();
  const supabase = await createSupabaseServerClient();

  // Build query for public animations only
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
      user_profiles (
        display_name
      )
    `, { count: 'exact' })
    .eq('visibility', 'public')
    .is('hidden_at', null);

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
    console.error('Database error:', error);
    return NextResponse.json(
      { error: { code: 'DB_ERROR', message: 'Failed to fetch gallery' } },
      { status: 500 }
    );
  }

  // Check if user has upvoted each animation (if authenticated)
  let upvotedIds: Set<string> = new Set();
  if (user && data && data.length > 0) {
    const animationIds = data.map(a => a.id);
    const { data: upvotes } = await supabase
      .from('upvotes')
      .select('animation_id')
      .eq('user_id', user.id)
      .in('animation_id', animationIds);

    upvotedIds = new Set(upvotes?.map(u => u.animation_id) || []);
  }

  // Transform response
  // We explicitly cast the joined data because TypeScript doesn't know about the relation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const animations = data?.map((animation: any) => ({
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
    author: {
      display_name: animation.user_profiles?.[0]?.display_name ?? animation.user_profiles?.display_name ?? null,
    },
    user_has_upvoted: upvotedIds.has(animation.id),
  })) || [];

  return NextResponse.json({
    animations,
    total: count ?? 0,
    limit,
    offset,
  });
}
