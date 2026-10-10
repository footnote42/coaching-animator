import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { requireAuth, isAuthError, requireNotBanned, requireAgeConfirmed } from '@/lib/server/auth';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/server/rate-limit';
import { UpdatePracticeSchema } from '@/lib/schemas/practices';
import { validate, formatError, MAX_SCRIPT_BYTES } from '@/features/practice/engine';
import type { Json } from '@/lib/supabase/database.types';
import { getSharedPractice } from '@/lib/server/practices';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface RouteParams {
  params: { id: string };
}

const notFound = () =>
  NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Practice not found' } }, { status: 404 });

/**
 * GET /api/practices/[id]: full Practice including script, read through
 * get_shared_practice(): the owner at any visibility, anyone for link and public.
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const practice = await getSharedPractice(params.id);
    if (!practice) return notFound();
    return NextResponse.json({ practice });
  } catch (err) {
    console.error('[Practices API] Fatal GET [id] Error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}

const LIST_COLUMNS = 'id, title, description, visibility, tags, source_url, source_title, schema_version, created_at, updated_at';

/** PATCH /api/practices/[id]: owner only; partial { title, description, visibility, tags, sourceUrl, sourceTitle, script }. */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

    const parsed = UpdatePracticeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
        { status: 400 }
      );
    }
    const { title, description, visibility, tags, sourceUrl, sourceTitle, script } = parsed.data;

    const update: {
      title?: string;
      description?: string | null;
      visibility?: 'private' | 'link' | 'public';
      tags?: string[];
      source_url?: string | null;
      source_title?: string | null;
      script?: Json;
      schema_version?: number;
    } = {};
    if (title !== undefined) update.title = title;
    if (description !== undefined) update.description = description;
    if (visibility !== undefined) update.visibility = visibility;
    if (tags !== undefined) update.tags = tags;
    if (sourceUrl !== undefined) update.source_url = sourceUrl;
    if (sourceTitle !== undefined) update.source_title = sourceTitle;

    if (script !== undefined) {
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
      update.script = script as Json;
      update.schema_version = result.script.schemaVersion;
    }

    // Admin client: direct REST writes are revoked (#175); every write is scoped by owner_id below.
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('practices')
      .update(update)
      .eq('id', params.id)
      .eq('owner_id', user.id)
      .select(LIST_COLUMNS);

    if (error) {
      console.error('[Practices API] Update error:', error);
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: 'Failed to update practice' } },
        { status: 500 }
      );
    }
    if (!data || data.length === 0) return notFound();
    return NextResponse.json({ practice: data[0] });
  } catch (err) {
    console.error('[Practices API] Fatal PATCH Error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}

/** DELETE /api/practices/[id]: owner only. */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth();
    if (isAuthError(authResult)) return authResult;

    // Admin client: direct REST writes are revoked (#175); every write is scoped by owner_id below.
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('practices')
      .delete()
      .eq('id', params.id)
      .eq('owner_id', authResult.id)
      .select('id');

    if (error) {
      console.error('[Practices API] Delete error:', error);
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: 'Failed to delete practice' } },
        { status: 500 }
      );
    }
    if (!data || data.length === 0) return notFound();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Practices API] Fatal DELETE Error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
