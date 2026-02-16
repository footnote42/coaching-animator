import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireAuth, isAuthError } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/animations/[id]/versions
 * List all versions for an animation (owner only)
 * Returns versions in descending order (newest first)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: animationId } = await params;

    const authResult = await requireAuth();
    if (isAuthError(authResult)) return authResult;
    const user = authResult;

    const supabase = await createSupabaseServerClient();

    // Verify animation exists and user owns it
    const { data: animation, error: animationError } = await supabase
      .from('saved_animations')
      .select('id, user_id, current_version')
      .eq('id', animationId)
      .eq('user_id', user.id)
      .single();

    if (animationError || !animation) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Animation not found or not authorized' } },
        { status: 404 }
      );
    }

    // Fetch all versions (RLS enforces ownership via animation)
    const { data: versions, error: versionsError } = await supabase
      .from('animation_versions')
      .select('id, version_number, major_version, minor_version, created_by, created_at')
      .eq('animation_id', animationId)
      .order('created_at', { ascending: false }); // Newest first

    if (versionsError) {
      console.error('[Versions API] Failed to fetch versions:', versionsError);
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: 'Failed to fetch versions' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      animation_id: animationId,
      current_version: animation.current_version,
      versions: versions || [],
    });
  } catch (err) {
    console.error('[Versions API] Fatal GET Error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
