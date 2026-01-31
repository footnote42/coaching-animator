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

  // Fetch reports without FK joins (Vercel compatibility)
  const { data: reports, error, count } = await supabase
    .from('content_reports')
    .select('id, animation_id, reporter_id, reason, details, status, created_at', { count: 'exact' })
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

  // Fetch animations separately
  const animationIds = [...new Set((reports || []).map(r => r.animation_id).filter(Boolean))];
  const animationsMap = new Map<string, { id: string; title: string; user_id: string }>();
  
  if (animationIds.length > 0) {
    const { data: animations } = await supabase
      .from('saved_animations')
      .select('id, title, user_id')
      .in('id', animationIds);
    
    animations?.forEach(a => animationsMap.set(a.id, a));
  }

  // Fetch all user profiles (reporters + animation authors)
  const allUserIds = [...new Set([
    ...(reports || []).map(r => r.reporter_id).filter(Boolean),
    ...Array.from(animationsMap.values()).map(a => a.user_id).filter(Boolean)
  ])];
  
  const profilesMap = new Map<string, string | null>();
  
  if (allUserIds.length > 0) {
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('id, display_name')
      .in('id', allUserIds);
    
    profiles?.forEach(p => profilesMap.set(p.id, p.display_name));
  }

  // Transform to match API contract format
  const transformedReports = (reports || []).map((report: { id: string; animation_id: string | null; reporter_id: string | null; reason: string; details: string | null; status: string; created_at: string }) => {
    const animation = report.animation_id ? animationsMap.get(report.animation_id) : undefined;
    
    return {
      id: report.id,
      animation: animation ? {
        id: animation.id,
        title: animation.title,
        user_id: animation.user_id,
        author_display_name: profilesMap.get(animation.user_id) || null,
      } : null,
      reporter: report.reporter_id ? {
        id: report.reporter_id,
        display_name: profilesMap.get(report.reporter_id) || null,
      } : null,
      reason: report.reason,
      details: report.details,
      status: report.status,
      created_at: report.created_at,
    };
  });

  return NextResponse.json({
    reports: transformedReports,
    total: count ?? 0,
  });
}
