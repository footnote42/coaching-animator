import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/server/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** POST /api/admin/feedback/[id]/read: mark a submission as read. Admin only. */
export async function POST(_request: NextRequest, props: RouteParams) {
  const params = await props.params;
  try {
    const authResult = await requireAdmin();
    if (isAuthError(authResult)) return authResult;

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('feedback')
      .update({ read_at: new Date().toISOString() })
      .eq('id', params.id)
      .is('read_at', null)
      .select('id, read_at')
      .maybeSingle();

    if (error) {
      console.error('[Admin Feedback] Mark read error:', error);
      return NextResponse.json(
        { error: { code: 'UPDATE_FAILED', message: 'Failed to mark feedback as read' } },
        { status: 500 }
      );
    }
    if (!data) {
      // Missing, or already read: nothing to change.
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Unread feedback not found' } },
        { status: 404 }
      );
    }
    return NextResponse.json({ id: data.id, read_at: data.read_at });
  } catch (err) {
    console.error('[Admin Feedback] Fatal read Error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
