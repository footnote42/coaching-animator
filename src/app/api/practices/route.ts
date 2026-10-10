import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { requireAuth, isAuthError, requireNotBanned, requireAgeConfirmed } from '@/lib/server/auth';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/server/rate-limit';
import { CreatePracticeSchema } from '@/lib/schemas/practices';
import { validate, formatError, MAX_SCRIPT_BYTES } from '@/features/practice/engine';
import type { Json } from '@/lib/supabase/database.types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const LIST_COLUMNS = 'id, title, description, visibility, tags, source_url, source_title, schema_version, created_at, updated_at';

/** GET /api/practices: the signed-in Coach's own Practices, every visibility, newest first. */
export async function GET() {
  try {
    const authResult = await requireAuth();
    if (isAuthError(authResult)) return authResult;

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('practices')
      .select(LIST_COLUMNS)
      .eq('owner_id', authResult.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('[Practices API] List error:', error);
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: 'Failed to fetch practices' } },
        { status: 500 }
      );
    }
    return NextResponse.json({ practices: data ?? [] });
  } catch (err) {
    console.error('[Practices API] Fatal GET Error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}

/** POST /api/practices: validate and save a Practice Script as-is. */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (isAuthError(authResult)) return authResult;
    const user = authResult;

    const banCheck = await requireNotBanned(user.id);
    if (banCheck) return banCheck;

    const ageCheck = await requireAgeConfirmed(user.id);
    if (ageCheck) return ageCheck;

    const rateLimit = await checkRateLimit(`user:${user.id}`, 'practice_save');
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' } },
        { status: 429, headers: getRateLimitHeaders(rateLimit) }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: { code: 'INVALID_JSON', message: 'Invalid JSON body' } },
        { status: 400 }
      );
    }

    const parsed = CreatePracticeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
        { status: 400 }
      );
    }
    const { title, description, visibility, tags, sourceUrl, sourceTitle, script } = parsed.data;

    if (new TextEncoder().encode(JSON.stringify(script ?? null)).length > MAX_SCRIPT_BYTES) {
      return NextResponse.json(
        { error: { code: 'PAYLOAD_TOO_LARGE', message: `Script is too large: the limit is ${MAX_SCRIPT_BYTES} bytes` } },
        { status: 413 }
      );
    }

    const result = validate(script);
    if (!result.ok) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_SCRIPT',
            message: 'The Practice Script is not valid',
            details: result.errors.map(formatError),
          },
        },
        { status: 400 }
      );
    }

    // Writes use the admin client: direct REST writes are revoked from anon/authenticated (#175),
    // so the checks above are the only way in. owner_id comes from the verified session.
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('practices')
      .insert({
        owner_id: user.id,
        title,
        description: description ?? null,
        visibility,
        tags,
        source_url: sourceUrl ?? null,
        source_title: sourceTitle ?? null,
        script: script as Json,
        schema_version: result.script.schemaVersion,
      })
      .select(LIST_COLUMNS)
      .single();

    if (error || !data) {
      console.error('[Practices API] Insert error:', error);
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: 'Failed to save practice' } },
        { status: 500 }
      );
    }
    return NextResponse.json({ practice: data }, { status: 201 });
  } catch (err) {
    console.error('[Practices API] Fatal POST Error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
