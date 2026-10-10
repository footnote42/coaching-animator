import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function getUser() {
  const supabase = await createSupabaseServerClient();
  const authResult = await supabase.auth.getUser();
  return authResult.data?.user ?? null;
}

export async function requireAuth() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }
  return user;
}

export async function requireAdmin() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: 'Admin access required' } },
      { status: 403 }
    );
  }
  return user;
}

export function isAuthError(result: unknown): result is NextResponse {
  return result instanceof NextResponse;
}

// Reads with the admin client: callers such as /api/mcp have no session, and profiles are not publicly readable (#174).
export async function checkBanned(userId: string): Promise<{ banned: boolean; reason?: string }> {
  const supabase = createSupabaseAdminClient();
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('banned_at, ban_reason')
    .eq('id', userId)
    .single();

  if (profile?.banned_at) {
    return { banned: true, reason: profile.ban_reason || 'Account suspended' };
  }
  return { banned: false };
}

export async function requireNotBanned(userId: string) {
  const banStatus = await checkBanned(userId);
  if (banStatus.banned) {
    return NextResponse.json(
      { error: { code: 'ACCOUNT_BANNED', message: banStatus.reason || 'Your account has been suspended' } },
      { status: 403 }
    );
  }
  return null;
}

/**
 * Server-side 18+ gate (ADR 0003): refuses with 403 AGE_NOT_CONFIRMED until
 * user_profiles.age_confirmed_at is set. Uses the admin client so it also works
 * for bearer-token callers (MCP) that have no cookie session. Fails closed.
 */
export async function requireAgeConfirmed(userId: string) {
  const { data: profile } = await createSupabaseAdminClient()
    .from('user_profiles')
    .select('age_confirmed_at')
    .eq('id', userId)
    .maybeSingle();

  if (!profile?.age_confirmed_at) {
    return NextResponse.json(
      {
        error: {
          code: 'AGE_NOT_CONFIRMED',
          message: 'Confirm you are 18 or over to save or publish. Sign in on the website to confirm.',
        },
      },
      { status: 403 }
    );
  }
  return null;
}
