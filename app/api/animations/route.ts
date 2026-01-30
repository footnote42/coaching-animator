import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../lib/supabase/server';
import { requireAuth, isAuthError, requireNotBanned } from '../../../lib/auth';
import { CreateAnimationSchema, MyAnimationsQuerySchema } from '../../../lib/schemas/animations';
import { checkQuota } from '../../../lib/quota';
import { validateAnimationContent } from '../../../lib/moderation';
import { checkRateLimit, getRateLimitHeaders } from '../../../lib/rate-limit';

export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;
  const user = authResult;

  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  const query = MyAnimationsQuerySchema.safeParse(searchParams);

  if (!query.success) {
    return NextResponse.json(
      { error: { code: 'INVALID_PARAMS', message: query.error.message } },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data, error, count } = await supabase
    .from('saved_animations')
    .select('id, title, animation_type, duration_ms, frame_count, visibility, upvote_count, created_at, updated_at', { count: 'exact' })
    .eq('user_id', user.id)
    .order(query.data.sort, { ascending: query.data.order === 'asc' })
    .range(query.data.offset, query.data.offset + query.data.limit - 1);

  if (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: { code: 'DB_ERROR', message: 'Failed to fetch animations' } },
      { status: 500 }
    );
  }

  return NextResponse.json({
    animations: data,
    total: count ?? 0,
    limit: query.data.limit,
    offset: query.data.offset,
  });
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;
  const user = authResult;

  // Check if user is banned
  const banCheck = await requireNotBanned(user.id);
  if (banCheck) return banCheck;

  // Rate limiting
  const rateLimit = await checkRateLimit(`user:${user.id}`, 'create_animation');
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

  const parsed = CreateAnimationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // Check content moderation
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

  // Calculate duration and frame count from payload
  const frameCount = data.payload.frames?.length ?? 0;
  const durationMs = data.payload.frames?.reduce((sum: number, frame: { duration?: number }) => sum + (frame.duration ?? 1000), 0) ?? 0;

  // Validate limits
  if (frameCount > 50) {
    return NextResponse.json(
      { error: { code: 'FRAME_LIMIT', message: 'Animation cannot have more than 50 frames' } },
      { status: 400 }
    );
  }

  if (durationMs > 60000) {
    return NextResponse.json(
      { error: { code: 'DURATION_LIMIT', message: 'Animation cannot be longer than 60 seconds' } },
      { status: 400 }
    );
  }

  // Check quota
  const quota = await checkQuota(user.id);
  if (!quota.allowed) {
    return NextResponse.json(
      { error: { code: 'QUOTA_EXCEEDED', message: `You have reached the maximum of ${quota.max} animations. Delete some to create more.` } },
      { status: 403 }
    );
  }

  // Insert into database
  const supabase = await createSupabaseServerClient();
  const { data: animation, error } = await supabase
    .from('saved_animations')
    .insert({
      user_id: user.id,
      title: data.title,
      description: data.description ?? null,
      coaching_notes: data.coaching_notes ?? null,
      animation_type: data.animation_type,
      tags: data.tags ?? [],
      payload: data.payload,
      duration_ms: durationMs,
      frame_count: frameCount,
      visibility: data.visibility,
    })
    .select('id, created_at')
    .single();

  if (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: { code: 'DB_ERROR', message: 'Failed to save animation' } },
      { status: 500 }
    );
  }

  return NextResponse.json(animation, { status: 201 });
}
