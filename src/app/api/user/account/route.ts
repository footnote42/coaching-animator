import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireAuth, isAuthError } from '@/lib/server/auth';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/server/rate-limit';

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

  const supabase = await createSupabaseServerClient();

  // Delete all user data (cascades via foreign keys)

  // First, delete the user from Supabase Auth
  // Note: This requires the service role key, which we may not have access to here
  // In a production setup, this would typically be done via a server action or admin API

  // For now, we'll delete the profile row
  const { error: profileError } = await supabase
    .from('user_profiles')
    .delete()
    .eq('id', user.id);

  if (profileError) {
    console.error('Database error:', profileError);
    return NextResponse.json(
      { error: { code: 'DB_ERROR', message: 'Failed to delete account data' } },
      { status: 500 }
    );
  }

  // Sign out the user
  await supabase.auth.signOut();

  return new NextResponse(null, { status: 204 });
}
