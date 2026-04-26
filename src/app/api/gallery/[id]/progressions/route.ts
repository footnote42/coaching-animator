import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/gallery/[id]/progressions
 *
 * Returns ordered progression children for a parent animation.
 * Auth: none required — matches gallery public visibility model.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabase = await createSupabaseServerClient();

    // Verify parent exists and is public
    const { data: parent, error: parentError } = await supabase
      .from('saved_animations')
      .select('id, visibility')
      .eq('id', id)
      .single();

    if (parentError || !parent) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Animation not found' } },
        { status: 404 }
      );
    }

    // Fetch public progression children ordered by progression_order
    const { data, error } = await supabase
      .from('saved_animations')
      .select('id, title, progression_order, preview_entities')
      .eq('parent_animation_id', id)
      .eq('is_progression', true)
      .order('progression_order', { ascending: true })
      .limit(5);

    if (error) {
      console.error('[Gallery Progressions API] DB error:', error);
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: `Database error: ${error.message}` } },
        { status: 500 }
      );
    }

    return NextResponse.json({ progressions: data ?? [] });
  } catch (err) {
    console.error('[Gallery Progressions API] Fatal error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
