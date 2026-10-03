export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { requireAuth, requireNotBanned, isAuthError } from '@/lib/server/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/server/rate-limit';
import { createTokenSchema } from '@/lib/schemas/tokens';
import { randomBytes, createHash } from 'node:crypto';

export async function GET(request: Request) {
  const user = await requireAuth();
  if (isAuthError(user)) return user;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('personal_tokens')
    .select('id, name, created_at, last_used_at, revoked_at')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Tokens API] Error listing tokens:', error);
    return NextResponse.json({ error: 'Failed to list tokens' }, { status: 500 });
  }

  return NextResponse.json({ tokens: data });
}

export async function POST(request: Request) {
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

  try {
    const json = await request.json();
    const result = createTokenSchema.safeParse(json);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: result.error.flatten() },
        { status: 400, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    const supabase = await createSupabaseServerClient();

    // Check cap
    const { count, error: countError } = await supabase
      .from('personal_tokens')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', user.id)
      .is('revoked_at', null);

    if (countError) {
      console.error('[Tokens API] Error checking token cap:', countError);
      return NextResponse.json({ error: 'Failed to create token' }, { status: 500 });
    }

    if ((count ?? 0) >= 10) {
      return NextResponse.json(
        { error: 'Maximum of 10 active tokens allowed' },
        { status: 400, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    const plaintext = 'ca_pat_' + randomBytes(32).toString('base64url');
    const hash = createHash('sha256').update(plaintext).digest('hex');

    const { data, error } = await supabase
      .from('personal_tokens')
      .insert({
        owner_id: user.id,
        name: result.data.name,
        token_hash: hash,
      })
      .select('id, name, created_at, last_used_at, revoked_at')
      .single();

    if (error) {
      console.error('[Tokens API] Error inserting token:', error);
      return NextResponse.json({ error: 'Failed to create token' }, { status: 500 });
    }

    // Return plaintext exactly once
    return NextResponse.json(
      { token: data, plaintext },
      { headers: getRateLimitHeaders(rateLimit) }
    );
  } catch (error) {
    console.error('[Tokens API] Create token failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
