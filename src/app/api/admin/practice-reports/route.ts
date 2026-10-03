import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/server/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { AdminPracticeReportsQuerySchema } from '@/lib/schemas/practices';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** GET /api/admin/practice-reports?status=open|dismissed|actioned: admin only. */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if (isAuthError(authResult)) return authResult;

    const query = AdminPracticeReportsQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
    if (!query.success) {
      return NextResponse.json(
        { error: { code: 'INVALID_PARAMS', message: query.error.message } },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    const { data: reports, error, count } = await supabase
      .from('practice_reports')
      .select('id, practice_id, reporter_id, reason, details, status, created_at', { count: 'exact' })
      .eq('status', query.data.status)
      .order('created_at', { ascending: false })
      .range(query.data.offset, query.data.offset + query.data.limit - 1);

    if (error) {
      console.error('[Admin Practice Reports] Fetch error:', error);
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: 'Failed to fetch reports' } },
        { status: 500 }
      );
    }

    // Separate lookups, no FK joins (matches the animation reports route).
    const rows = reports ?? [];
    const practiceIds = [...new Set(rows.map((r) => r.practice_id))];
    const practices = new Map<string, { id: string; title: string; owner_id: string; hidden: boolean }>();
    if (practiceIds.length > 0) {
      const { data } = await supabase.from('practices').select('id, title, owner_id, hidden').in('id', practiceIds);
      data?.forEach((p) => practices.set(p.id, p));
    }

    const userIds = [
      ...new Set([
        ...rows.map((r) => r.reporter_id).filter((v): v is string => !!v),
        ...[...practices.values()].map((p) => p.owner_id),
      ]),
    ];
    const names = new Map<string, string | null>();
    if (userIds.length > 0) {
      const { data } = await supabase.from('user_profiles').select('id, display_name').in('id', userIds);
      data?.forEach((p) => names.set(p.id, p.display_name));
    }

    return NextResponse.json({
      reports: rows.map((r) => {
        const practice = practices.get(r.practice_id);
        return {
          id: r.id,
          practice: practice
            ? {
                id: practice.id,
                title: practice.title,
                hidden: practice.hidden,
                owner_id: practice.owner_id,
                owner_display_name: names.get(practice.owner_id) ?? null,
              }
            : null,
          reporter: r.reporter_id ? { id: r.reporter_id, display_name: names.get(r.reporter_id) ?? null } : null,
          reason: r.reason,
          details: r.details,
          status: r.status,
          created_at: r.created_at,
        };
      }),
      total: count ?? 0,
    });
  } catch (err) {
    console.error('[Admin Practice Reports] Fatal GET Error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
