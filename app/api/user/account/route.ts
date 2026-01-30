import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';
import { requireAuth, isAuthError } from '../../../../lib/auth';

export async function DELETE() {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;
  const user = authResult;

  const supabase = await createSupabaseServerClient();

  // Delete all user data (cascades via foreign keys)
  // The user_profiles, saved_animations, upvotes, etc. will be deleted via CASCADE
  
  // First, delete the user from Supabase Auth
  // Note: This requires the service role key, which we may not have access to here
  // In a production setup, this would typically be done via a server action or admin API
  
  // For now, we'll delete the profile which will cascade to animations
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
