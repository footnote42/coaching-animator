import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireAuth, isAuthError, requireNotBanned } from '@/lib/server/auth';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/server/rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/animations/[id]/versions/[versionId]/restore
 * Restore an old version by creating a new version with the old payload
 * Owner only
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; versionId: string }> }
) {
  try {
    const { id: animationId, versionId } = await params;

    const authResult = await requireAuth();
    if (isAuthError(authResult)) return authResult;
    const user = authResult;

    // Check if user is banned
    const banCheck = await requireNotBanned(user.id);
    if (banCheck) return banCheck;

    // Rate limiting
    const rateLimit = await checkRateLimit(`user:${user.id}`, 'restore_version');
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' } },
        { status: 429, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    const supabase = await createSupabaseServerClient();

    // Verify animation exists and user owns it
    const { data: animation, error: animationError } = await supabase
      .from('saved_animations')
      .select('id, user_id, current_version, payload')
      .eq('id', animationId)
      .eq('user_id', user.id)
      .single();

    if (animationError || !animation) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Animation not found or not authorized' } },
        { status: 404 }
      );
    }

    // Fetch the version to restore
    const { data: oldVersion, error: versionError } = await supabase
      .from('animation_versions')
      .select('id, version_number, major_version, minor_version, payload')
      .eq('id', versionId)
      .eq('animation_id', animationId)
      .single();

    if (versionError || !oldVersion) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Version not found' } },
        { status: 404 }
      );
    }

    // Parse current version to determine next version number
    const currentParts = animation.current_version.split('.');
    const currentMajor = parseInt(currentParts[0], 10);
    const currentMinor = parseInt(currentParts[1], 10);

    // Restore creates a new minor version
    const newMajor = currentMajor;
    const newMinor = currentMinor + 1;
    const newVersionNumber = `${newMajor}.${newMinor}`;

    // Create new version with old payload
    const { data: newVersion, error: createError } = await supabase
      .from('animation_versions')
      .insert({
        animation_id: animationId,
        version_number: newVersionNumber,
        major_version: newMajor,
        minor_version: newMinor,
        payload: oldVersion.payload,
        created_by: user.id,
      })
      .select('id, version_number, major_version, minor_version, created_at')
      .single();

    if (createError) {
      console.error('[Versions API] Failed to create restored version:', createError);
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: 'Failed to restore version' } },
        { status: 500 }
      );
    }

    // Update animation's current_version and payload
    const { error: updateError } = await supabase
      .from('saved_animations')
      .update({
        current_version: newVersionNumber,
        payload: oldVersion.payload,
        updated_at: new Date().toISOString(),
      })
      .eq('id', animationId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('[Versions API] Failed to update animation:', updateError);
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: 'Failed to update animation with restored payload' } },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        restored_from: oldVersion.version_number,
        new_version: newVersionNumber,
        version: newVersion,
      },
      { status: 201, headers: getRateLimitHeaders(rateLimit) }
    );
  } catch (err) {
    console.error('[Versions API] Fatal POST Error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
