import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/server/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { AdminFeedbackQuerySchema } from '@/lib/schemas/feedback';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** GET /api/admin/feedback: submissions, newest first. Admin only. */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if (isAuthError(authResult)) return authResult;

    const query = AdminFeedbackQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
    if (!query.success) {
      return NextResponse.json(
        { error: { code: 'INVALID_PARAMS', message: query.error.message } },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    const { data, error, count } = await supabase
      .from('feedback')
      .select('id, name, email, area, what, rating, created_at, read_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(query.data.offset, query.data.offset + query.data.limit - 1);

    if (error) {
      console.error('[Admin Feedback] Fetch error:', error);
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: 'Failed to fetch feedback' } },
        { status: 500 }
      );
    }
    return NextResponse.json({ feedback: data ?? [], total: count ?? 0 });
  } catch (err) {
    console.error('[Admin Feedback] Fatal GET Error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
