import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/server/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { PracticeReportActionSchema } from '@/lib/schemas/practices';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface RouteParams {
  params: { id: string };
}

const failed = (message: string) =>
  NextResponse.json({ error: { code: 'ACTION_FAILED', message } }, { status: 500 });

/**
 * POST /api/admin/practice-reports/[id]/action: admin only.
 * dismiss | hide | unhide | delete | ban_user. Open reports move to dismissed
 * (dismiss) or actioned (hide, delete, ban_user); unhide never changes a report.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAdmin();
    if (isAuthError(authResult)) return authResult;
    const admin = authResult;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: { code: 'INVALID_JSON', message: 'Invalid JSON body' } },
        { status: 400 }
      );
    }

    const parsed = PracticeReportActionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
        { status: 400 }
      );
    }
    const { action, reason } = parsed.data;

    if (['hide', 'ban_user'].includes(action) && !reason) {
      return NextResponse.json(
        { error: { code: 'REASON_REQUIRED', message: 'Reason is required for this action' } },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    const { data: report, error: fetchError } = await supabase
      .from('practice_reports')
      .select('id, status, practice_id')
      .eq('id', params.id)
      .maybeSingle();

    if (fetchError || !report) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Report not found' } }, { status: 404 });
    }
    if (action === 'dismiss' && report.status !== 'open') {
      return NextResponse.json(
        { error: { code: 'ALREADY_PROCESSED', message: 'Report has already been processed' } },
        { status: 400 }
      );
    }

    const { data: practice } = await supabase
      .from('practices')
      .select('id, owner_id')
      .eq('id', report.practice_id)
      .maybeSingle();

    if (action !== 'dismiss' && !practice) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Practice not found' } }, { status: 404 });
    }

    // Practice writes need the admin client: direct REST writes are revoked (#175). requireAdmin() ran above.
    const writer = createSupabaseAdminClient();
    switch (action) {
      case 'hide':
      case 'unhide': {
        const { error } = await writer
          .from('practices')
          .update({ hidden: action === 'hide' })
          .eq('id', report.practice_id);
        if (error) {
          console.error('[Admin Practice Reports] Hide error:', error);
          return failed(`Failed to ${action} practice`);
        }
        break;
      }
      case 'delete': {
        // The report row goes with it (ON DELETE CASCADE).
        const { error } = await writer.from('practices').delete().eq('id', report.practice_id);
        if (error) {
          console.error('[Admin Practice Reports] Delete error:', error);
          return failed('Failed to delete practice');
        }
        return NextResponse.json({ report_id: report.id, status: 'actioned', action_taken: action });
      }
      case 'ban_user': {
        const { error } = await supabase
          .from('user_profiles')
          .update({ banned_at: new Date().toISOString(), ban_reason: reason })
          .eq('id', practice!.owner_id);
        if (error) {
          console.error('[Admin Practice Reports] Ban error:', error);
          return failed('Failed to ban user');
        }
        // A ban takes the owner's content down: hide every Practice they own (#176).
        // Unban is not an action here; hidden stays true until an admin runs unhide per Practice.
        const { error: hideError } = await writer
          .from('practices')
          .update({ hidden: true })
          .eq('owner_id', practice!.owner_id);
        if (hideError) {
          console.error('[Admin Practice Reports] Ban hide-all error:', hideError);
          return failed('User banned but hiding their Practices failed; retry the ban');
        }
        break;
      }
      case 'dismiss':
        break;
    }

    if (action === 'unhide' || report.status !== 'open') {
      return NextResponse.json({ report_id: report.id, status: report.status, action_taken: action });
    }

    const newStatus = action === 'dismiss' ? 'dismissed' : 'actioned';
    const { error: updateError } = await supabase
      .from('practice_reports')
      .update({ status: newStatus, resolved_at: new Date().toISOString(), resolved_by: admin.id })
      .eq('id', report.id);
    if (updateError) {
      console.error('[Admin Practice Reports] Update status error:', updateError);
      return NextResponse.json(
        { error: { code: 'UPDATE_FAILED', message: 'Failed to update report status' } },
        { status: 500 }
      );
    }
    return NextResponse.json({ report_id: report.id, status: newStatus, action_taken: action });
  } catch (err) {
    console.error('[Admin Practice Reports] Fatal action Error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
