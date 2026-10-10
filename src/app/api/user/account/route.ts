import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { requireAuth, isAuthError } from '@/lib/server/auth';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/server/rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function DELETE() {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;
  const user = authResult;

  // Rate limit: protect against accidental or abusive account deletion requests
  const rateLimitResult = await checkRateLimit(user.id, 'account_delete');
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' } },
      { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
    );
  }

  // Deleting the auth user cascades (ON DELETE CASCADE) to user_profiles and
  // practices. Reports they filed are kept with reporter_id set to null.
  // Always the caller's own id, never one from the request.
  try {
    const admin = createSupabaseAdminClient();
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) throw error;
  } catch (err) {
    console.error('[Account API] Error: failed to delete user', err);
    return NextResponse.json(
      { error: { code: 'DELETE_FAILED', message: 'Failed to delete account' } },
      { status: 500 }
    );
  }

  // Clear the session cookies. The user is already gone, so ignore failures.
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  } catch (err) {
    console.error('[Account API] Sign out after delete failed', err);
  }

  return new NextResponse(null, { status: 204 });
}
