import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireAuth, isAuthError } from '@/lib/server/auth';
import { getSharedPractice } from '@/lib/server/practices';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface RouteParams {
  params: { id: string };
}

const notFound = () =>
  NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Practice not found' } }, { status: 404 });

/**
 * GET /api/practices/[id]: full Practice including script, read through
 * get_shared_practice(): the owner at any visibility, anyone for link and public.
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const practice = await getSharedPractice(params.id);
    if (!practice) return notFound();
    return NextResponse.json({ practice });
  } catch (err) {
    console.error('[Practices API] Fatal GET [id] Error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}

/** DELETE /api/practices/[id]: owner only. */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth();
    if (isAuthError(authResult)) return authResult;

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('practices')
      .delete()
      .eq('id', params.id)
      .eq('owner_id', authResult.id)
      .select('id');

    if (error) {
      console.error('[Practices API] Delete error:', error);
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: 'Failed to delete practice' } },
        { status: 500 }
      );
    }
    if (!data || data.length === 0) return notFound();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Practices API] Fatal DELETE Error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
