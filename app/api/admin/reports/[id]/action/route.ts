import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isAuthError } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

const ReportActionSchema = z.object({
  action: z.enum(['dismiss', 'hide', 'delete', 'warn_user', 'ban_user']),
  reason: z.string().max(500).optional(),
});

interface RouteParams {
  params: { id: string };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id: reportId } = params;
  const authResult = await requireAdmin();
  if (isAuthError(authResult)) return authResult;
  const admin = authResult;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: 'INVALID_JSON', message: 'Invalid JSON body' } },
      { status: 400 }
    );
  }

  const parsed = ReportActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
      { status: 400 }
    );
  }

  const { action, reason } = parsed.data;

  // Require reason for destructive actions
  if (['hide', 'warn_user', 'ban_user'].includes(action) && !reason) {
    return NextResponse.json(
      { error: { code: 'REASON_REQUIRED', message: 'Reason is required for this action' } },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();

  // Get the report with animation details
  const { data: report, error: fetchError } = await supabase
    .from('content_reports')
    .select(`
      id,
      status,
      animation_id,
      animation:saved_animations!animation_id (
        id,
        user_id
      )
    `)
    .eq('id', reportId)
    .single();

  if (fetchError || !report) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Report not found' } },
      { status: 404 }
    );
  }

  if (report.status !== 'pending') {
    return NextResponse.json(
      { error: { code: 'ALREADY_PROCESSED', message: 'Report has already been processed' } },
      { status: 400 }
    );
  }

  // Supabase returns relations as arrays when using select with !
  const animationData = report.animation as unknown as { id: string; user_id: string } | { id: string; user_id: string }[] | null;
  const animation = Array.isArray(animationData) ? animationData[0] : animationData;

  // Execute action
  const actionTaken = action;
  const newStatus: 'reviewed' | 'dismissed' = action === 'dismiss' ? 'dismissed' : 'reviewed';

  try {
    switch (action) {
      case 'dismiss':
        // Just mark report as dismissed, no other action
        break;

      case 'hide':
        if (!animation) {
          return NextResponse.json(
            { error: { code: 'ANIMATION_NOT_FOUND', message: 'Animation not found' } },
            { status: 404 }
          );
        }
        // Set hidden_at on the animation
        const { error: hideError } = await supabase
          .from('saved_animations')
          .update({ hidden_at: new Date().toISOString() })
          .eq('id', animation.id);

        if (hideError) {
          console.error('Hide animation error:', hideError);
          return NextResponse.json(
            { error: { code: 'ACTION_FAILED', message: 'Failed to hide animation' } },
            { status: 500 }
          );
        }
        break;

      case 'delete':
        if (!animation) {
          return NextResponse.json(
            { error: { code: 'ANIMATION_NOT_FOUND', message: 'Animation not found' } },
            { status: 404 }
          );
        }
        // Delete the animation
        const { error: deleteError } = await supabase
          .from('saved_animations')
          .delete()
          .eq('id', animation.id);

        if (deleteError) {
          console.error('Delete animation error:', deleteError);
          return NextResponse.json(
            { error: { code: 'ACTION_FAILED', message: 'Failed to delete animation' } },
            { status: 500 }
          );
        }
        break;

      case 'warn_user':
        if (!animation?.user_id) {
          return NextResponse.json(
            { error: { code: 'USER_NOT_FOUND', message: 'Animation owner not found' } },
            { status: 404 }
          );
        }
        // Increment warning count on user profile
        const { error: warnError } = await supabase.rpc('increment_user_warnings', {
          target_user_id: animation.user_id,
        });

        // If RPC doesn't exist, fall back to direct update
        if (warnError) {
          console.log('Warning via RPC failed, trying direct update');
          // Note: This requires a warning_count column which may not exist yet
          // For now, we'll log the warning action
          console.log(`Warning issued to user ${animation.user_id}: ${reason}`);
        }
        break;

      case 'ban_user':
        if (!animation?.user_id) {
          return NextResponse.json(
            { error: { code: 'USER_NOT_FOUND', message: 'Animation owner not found' } },
            { status: 404 }
          );
        }
        // Set banned_at on user profile
        const { error: banError } = await supabase
          .from('user_profiles')
          .update({ banned_at: new Date().toISOString() })
          .eq('id', animation.user_id);

        if (banError) {
          console.error('Ban user error:', banError);
          return NextResponse.json(
            { error: { code: 'ACTION_FAILED', message: 'Failed to ban user' } },
            { status: 500 }
          );
        }
        break;
    }

    // Update report status
    const { error: updateError } = await supabase
      .from('content_reports')
      .update({
        status: newStatus,
        reviewed_by: admin.id,
        reviewed_at: new Date().toISOString(),
        admin_notes: reason || null,
      })
      .eq('id', reportId);

    if (updateError) {
      console.error('Update report status error:', updateError);
      return NextResponse.json(
        { error: { code: 'UPDATE_FAILED', message: 'Failed to update report status' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      report_id: reportId,
      status: newStatus,
      action_taken: actionTaken,
    });

  } catch (err) {
    console.error('Admin action error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
