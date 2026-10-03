export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { requireAuth, requireNotBanned, isAuthError } from '@/lib/server/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/server/rate-limit';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth();
  if (isAuthError(user)) return user;

  const notBanned = await requireNotBanned(user.id);
  if (isAuthError(notBanned)) return notBanned;

  const rateLimit = await checkRateLimit(user.id, 'tokens_api');
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, {
      status: 429,
      headers: getRateLimitHeaders(rateLimit),
    });
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('personal_tokens')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', params.id)
    .eq('owner_id', user.id);

  if (error) {
    console.error('[Tokens API] Error revoking token:', error);
    return NextResponse.json(
      { error: 'Failed to revoke token' },
      { status: 500, headers: getRateLimitHeaders(rateLimit) }
    );
  }

  return NextResponse.json(
    { success: true },
    { headers: getRateLimitHeaders(rateLimit) }
  );
}
