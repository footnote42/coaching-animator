import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { PublicPracticesQuerySchema } from '@/lib/schemas/practices';
import { resolveStep, validate, stepCount, type ResolvedStep } from '@/features/practice/engine';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const PAGE_SIZE = 12;

/** The base Step resolved for the card thumbnail, or null if the stored script no longer validates. */
function toThumbnail(script: unknown): ResolvedStep | null {
  const result = validate(script);
  return result.ok ? resolveStep(result.script, 0) : null;
}

/** What a Gallery card shows, derived from the stored script. Null counts when the script no longer validates. */
function toSummary(script: unknown) {
  const result = validate(script);
  if (!result.ok) return { playerCount: null, area: null, progressionCount: 0 };
  const base = resolveStep(result.script, 0);
  return {
    playerCount: base.markers.filter((m) => m.kind === 'attacker' || m.kind === 'defender').length,
    area: { width: base.area.width, length: base.area.length },
    progressionCount: stepCount(result.script) - 1,
  };
}

/** GET /api/practices/public?q=&tag=&page=: public Practices, newest first. No auth. */
export async function GET(request: NextRequest) {
  try {
    const parsed = PublicPracticesQuerySchema.safeParse({
      q: request.nextUrl.searchParams.get('q') ?? undefined,
      page: request.nextUrl.searchParams.get('page') ?? undefined,
      tag: request.nextUrl.searchParams.get('tag') ?? undefined,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
        { status: 400 }
      );
    }
    const { q, tag, page } = parsed.data;
    const from = (page - 1) * PAGE_SIZE;

    const supabase = await createSupabaseServerClient();
    let query = supabase
      .from('practices')
      .select('id, owner_id, title, description, created_at, script, tags, source_url')
      .eq('visibility', 'public')
      .eq('hidden', false)
      .order('created_at', { ascending: false })
      .range(from, from + PAGE_SIZE); // one extra row tells us whether another page exists

    if (tag) query = query.contains('tags', [tag]);

    if (q) {
      const escaped = q.replace(/[\\%_]/g, (c) => `\\${c}`);
      query = query.ilike('title', `%${escaped}%`);
    }

    const { data, error } = await query;
    if (error) {
      console.error('[Practices API] Public list error:', error);
      return NextResponse.json(
        { error: { code: 'DB_ERROR', message: 'Failed to fetch practices' } },
        { status: 500 }
      );
    }

    const rows = data ?? [];
    const pageRows = rows.slice(0, PAGE_SIZE);

    // Coach display names (only names are public, via public_display_names); a failed lookup just leaves the name off.
    const names = new Map<string, string | null>();
    const ownerIds = [...new Set(pageRows.map((r) => r.owner_id as string))];
    if (ownerIds.length > 0) {
      const { data: profiles } = await supabase.rpc('public_display_names', { ids: ownerIds });
      (profiles as { id: string; display_name: string | null }[] | null)?.forEach((p) => names.set(p.id, p.display_name));
    }

    const practices = pageRows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      created_at: row.created_at,
      tags: (row.tags as string[] | null) ?? [],
      coachName: names.get(row.owner_id as string) ?? null,
      hasSource: Boolean(row.source_url),
      ...toSummary(row.script),
      thumbnail: toThumbnail(row.script),
    }));
    return NextResponse.json({ practices, page, hasMore: rows.length > PAGE_SIZE });
  } catch (err) {
    console.error('[Practices API] Fatal public GET Error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
