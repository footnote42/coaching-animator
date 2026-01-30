import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

const AdminReportsQuerySchema = z.object({
  status: z.enum(['pending', 'reviewed', 'dismissed']).default('pending'),
  limit: z.coerce.number().min(1).max(50).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export async function GET(request: NextRequest) {
  const authResult = await requireAdmin();
  if (isAuthError(authResult)) return authResult;

  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  const query = AdminReportsQuerySchema.safeParse(searchParams);

  if (!query.success) {
    return NextResponse.json(
      { error: { code: 'INVALID_PARAMS', message: query.error.message } },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();

  const { data: reports, error, count } = await supabase
    .from('content_reports')
    .select(`
      id,
      reason,
      details,
      status,
      created_at,
      animation:saved_animations!animation_id (
        id,
        title,
        user_id
      ),
      reporter:user_profiles!reporter_id (
        id,
        display_name
      )
    `, { count: 'exact' })
    .eq('status', query.data.status)
    .order('created_at', { ascending: false })
    .range(query.data.offset, query.data.offset + query.data.limit - 1);

  if (error) {
    console.error('Admin reports fetch error:', error);
    return NextResponse.json(
      { error: { code: 'DB_ERROR', message: 'Failed to fetch reports' } },
      { status: 500 }
    );
  }

  // Transform to match API contract format
  const transformedReports = (reports || []).map((report: any) => {
    // Get animation author display name
    let authorDisplayName = null;
    if (report.animation?.user_id) {
      // We need a separate query for the animation author
      // For now, we'll include user_id and let the UI resolve it if needed
    }

    return {
      id: report.id,
      animation: report.animation ? {
        id: report.animation.id,
        title: report.animation.title,
        user_id: report.animation.user_id,
        author_display_name: authorDisplayName,
      } : null,
      reporter: report.reporter ? {
        id: report.reporter.id,
        display_name: report.reporter.display_name,
      } : null,
      reason: report.reason,
      details: report.details,
      status: report.status,
      created_at: report.created_at,
    };
  });

  // Fetch author display names for animations
  const userIds = [...new Set(transformedReports
    .filter(r => r.animation?.user_id)
    .map(r => r.animation!.user_id))];

  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('id, display_name')
      .in('id', userIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p.display_name]) || []);

    transformedReports.forEach(report => {
      if (report.animation?.user_id) {
        report.animation.author_display_name = profileMap.get(report.animation.user_id) || null;
      }
    });
  }

  return NextResponse.json({
    reports: transformedReports,
    total: count ?? 0,
  });
}
