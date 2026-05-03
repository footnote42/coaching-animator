import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireAuth, isAuthError } from '@/lib/server/auth';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/server/rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface RouteParams {
  params: { id: string };
}

const ReorderSchema = z.object({
  order: z.array(
    z.object({
      id: z.string().uuid(),
      progression_order: z.number().int().min(1).max(5),
    })
  ).min(1).max(5),
});

/**
 * PATCH /api/animations/[id]/progressions/reorder
 * Batch-updates progression_order for child progressions of a base animation.
 * Requires auth — user must own the base animation.
 * Body: { order: [{ id: string, progression_order: number }] }
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: baseId } = params;

    const authResult = await requireAuth();
    if (isAuthError(authResult)) return authResult;
    const user = authResult;

    // Rate limit: prevent reorder spam
    const rateLimitResult = await checkRateLimit(user.id, 'progression_reorder');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' } },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    const body = await request.json();
    const parsed = ReorderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message ?? 'Invalid request body' } },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // Verify the base animation exists, belongs to user, and is not itself a progression
    const { data: base, error: baseError } = await supabase
      .from('saved_animations')
      .select('id, is_progression')
      .eq('id', baseId)
      .eq('user_id', user.id)
      .single();

    if (baseError || !base) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Base animation not found' } },
        { status: 404 }
      );
    }

    if (base.is_progression) {
      return NextResponse.json(
        { error: { code: 'INVALID_REQUEST', message: 'Cannot reorder progressions of a progression' } },
        { status: 400 }
      );
    }

    // Verify all IDs in the order are actual progressions of this base
    const incomingIds = parsed.data.order.map(o => o.id);
    const { data: existing, error: existingError } = await supabase
      .from('saved_animations')
      .select('id')
      .eq('parent_animation_id', baseId)
      .eq('is_progression', true)
      .in('id', incomingIds);

    if (existingError) {
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: existingError.message } },
        { status: 500 }
      );
    }

    if (!existing || existing.length !== incomingIds.length) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'One or more IDs are not progressions of this base animation' } },
        { status: 400 }
      );
    }

    // Batch-update progression_order for each item
    const updates = parsed.data.order.map(({ id, progression_order }) =>
      supabase
        .from('saved_animations')
        .update({ progression_order })
        .eq('id', id)
        .eq('parent_animation_id', baseId)
    );

    const results = await Promise.all(updates);
    const failed = results.find(r => r.error);
    if (failed?.error) {
      console.error('[Progressions Reorder] DB error:', failed.error);
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: failed.error.message } },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Progressions Reorder] Fatal error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
