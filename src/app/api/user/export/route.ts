export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/server/auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/server/rate-limit';

// Everything here is read with the caller's own client, so RLS limits each
// query to their rows. Token hashes, role and ban fields are never selected.
export async function GET(_request: Request) {
  const user = await requireAuth();
  if (isAuthError(user)) return user;

  const rateLimit = await checkRateLimit(user.id, 'data_export');
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, {
      status: 429,
      headers: getRateLimitHeaders(rateLimit),
    });
  }

  const supabase = await createSupabaseServerClient();

  const [profile, practices, tokens, reports] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('display_name, created_at, age_confirmed_at')
      .eq('id', user.id)
      .maybeSingle(),
    supabase
      .from('practices')
      .select('id, title, description, tags, source_title, source_url, visibility, schema_version, script, created_at, updated_at')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: true }),
    supabase
      .from('personal_tokens')
      .select('name, created_at, last_used_at, revoked_at')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: true }),
    supabase
      .from('practice_reports')
      .select('practice_id, reason, details, status, created_at')
      .eq('reporter_id', user.id)
      .order('created_at', { ascending: true }),
  ]);

  const failed = [profile, practices, tokens, reports].find((r) => r.error);
  if (failed?.error) {
    console.error('[Export API] Error:', failed.error.message);
    return NextResponse.json({ error: 'Failed to export your data' }, { status: 500 });
  }

  const now = new Date();
  const body = {
    exported_at: now.toISOString(),
    account: { email: user.email ?? null },
    profile: profile.data ?? null,
    practices: practices.data ?? [],
    personal_tokens: tokens.data ?? [],
    // Reports are readable by admins only under RLS, so this is empty for most callers.
    reports: reports.data ?? [],
    // Feedback is stored without a link to an account, so it cannot be matched to you.
    feedback: [],
  };

  return new NextResponse(JSON.stringify(body, null, 2), {
    status: 200,
    headers: {
      ...getRateLimitHeaders(rateLimit),
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="coaching-animator-export-${now.toISOString().slice(0, 10)}.json"`,
      'Cache-Control': 'no-store',
    },
  });
}
