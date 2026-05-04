import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireAuth, isAuthError, requireNotBanned } from '@/lib/server/auth';
import { CreateAnimationSchema, MyAnimationsQuerySchema, validatePayloadSize } from '@/lib/schemas/animations';
import { checkQuota } from '@/lib/quota';
import { validateAnimationContent } from '@/lib/moderation';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/server/rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Convert a data URL to a Blob for upload.
 */
function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

export async function GET(request: NextRequest) {
  try {
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
      .select(
        'id, title, description, coaching_notes, animation_type, duration_ms, frame_count, visibility, upvote_count, created_at, updated_at, progression_count, remix_count, thumbnail_url, preview_entities, tags, video_url, remixed_from_id, remixed_from:remixed_from_id(title)',
        { count: 'exact' }
      )
      .eq('user_id', user.id)
      .or('is_progression.eq.false,is_progression.is.null')
      .order(query.data.sort, { ascending: query.data.order === 'asc' })
      .range(query.data.offset, query.data.offset + query.data.limit - 1);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: 'Failed to fetch animations' } },
        { status: 500 }
      );
    }

    const animations = (data ?? []).map((row) => {
      const { remixed_from, ...rest } = row as typeof row & { remixed_from: { title: string } | null };
      return { ...rest, remixed_from_title: remixed_from?.title ?? null };
    });

    return NextResponse.json({
      animations,
      total: count ?? 0,
      limit: query.data.limit,
      offset: query.data.offset,
    });
  } catch (err) {
    console.error('[Animations API] Fatal GET Error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    // Validate payload size first (before schema validation)
    if (body.payload) {
      const sizeCheck = validatePayloadSize(body.payload);
      if (!sizeCheck.valid) {
        return NextResponse.json(
          { error: { code: 'PAYLOAD_TOO_LARGE', message: sizeCheck.error } },
          { status: 413 }
        );
      }
    }

    const parsed = CreateAnimationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Extract preview entities from first frame (T007 — 009-gallery-playbook)
    const firstFrame = data.payload.frames[0];
    const previewEntities = Object.values(firstFrame?.entities ?? {})
      .filter((e) => e.type === 'player')
      .slice(0, 15)
      .map((e) => ({ x: e.x / 8, y: e.y / 8, team: e.team }));

    // Check content moderation
    const moderation = await validateAnimationContent({
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

    const supabase = await createSupabaseServerClient();

    // Handle thumbnail upload if provided
    let thumbnailUrl: string | null = null;
    if (data.thumbnail && data.thumbnail.startsWith('data:image/')) {
      try {
        // Convert data URL to blob
        const thumbnailBlob = dataUrlToBlob(data.thumbnail);
        const thumbnailPath = `thumbnails/${user.id}/${Date.now()}.png`;

        const { error: uploadError } = await supabase.storage
          .from('animations')
          .upload(thumbnailPath, thumbnailBlob, {
            contentType: 'image/png',
            upsert: false,
          });

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('animations')
            .getPublicUrl(thumbnailPath);
          thumbnailUrl = urlData.publicUrl;
        } else {
          console.warn('Failed to upload thumbnail:', uploadError);
        }
      } catch (thumbError) {
        console.warn('Thumbnail processing error:', thumbError);
      }
    }

    // Insert into database
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
        thumbnail_url: thumbnailUrl,
        video_url: data.video_url ?? null, // V2.0: YouTube tutorial video
        current_version: '1.0', // V2.0: Initial version
        // Phase 2: Progression fields (DB trigger validates parent is base + increments counter)
        parent_animation_id: data.parent_animation_id ?? null,
        is_progression: data.is_progression ?? false,
        progression_order: data.progression_order ?? 0,
        // 009-gallery-playbook: mini-pitch preview data
        preview_entities: previewEntities.length > 0 ? previewEntities : null,
      })
      .select('id, created_at, thumbnail_url')
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: 'Failed to save animation' } },
        { status: 500 }
      );
    }

    // V2.0: Create initial version (v1.0) in animation_versions
    const { error: versionError } = await supabase
      .from('animation_versions')
      .insert({
        animation_id: animation.id,
        version_number: '1.0',
        major_version: 1,
        minor_version: 0,
        payload: data.payload,
        created_by: user.id,
      });

    if (versionError) {
      console.warn('[Animations API] Failed to create v1.0 version:', versionError);
      // Non-fatal - animation is already created, version history is optional
    }

    // Add cache invalidation headers to ensure client refreshes lists
    return NextResponse.json(animation, {
      status: 201,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (err) {
    console.error('[Animations API] Fatal POST Error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
