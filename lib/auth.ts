import { createSupabaseServerClient } from './supabase/server';
import { NextResponse } from 'next/server';

export async function getUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
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

export async function checkBanned(userId: string): Promise<{ banned: boolean; reason?: string }> {
  const supabase = await createSupabaseServerClient();
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
