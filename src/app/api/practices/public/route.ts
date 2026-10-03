import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { PublicPracticesQuerySchema } from '@/lib/schemas/practices';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const PAGE_SIZE = 12;

interface ThumbnailMarker {
  kind: string;
  team?: string;
  cell: { x: number; y: number };
}

/** Pulls just what the card thumbnail needs from a stored script, tolerating odd shapes. */
function toThumbnail(script: unknown) {
  const s = (script ?? {}) as {
    area?: { width: number; length: number };
    markers?: Array<{ id: string; kind: string; team?: string }>;
    base?: { placements?: Array<{ marker: string; cell?: { x: number; y: number }; holder?: string }> };
  };
  const byId = new Map((s.markers ?? []).map((m) => [m.id, m]));
  const markers: ThumbnailMarker[] = [];
  const placements = s.base?.placements ?? [];
  const cellOf = new Map(placements.filter((p) => p.cell).map((p) => [p.marker, p.cell!]));
  for (const p of placements) {
    const m = byId.get(p.marker);
    // The ball has a holder instead of a cell and sits on its holder.
    const cell = p.cell ?? (p.holder ? cellOf.get(p.holder) : undefined);
    if (m && cell) markers.push({ kind: m.kind, team: m.team, cell });
  }
  return { area: s.area ?? { width: 1, length: 1 }, markers };
}

/** GET /api/practices/public?q=&page=: public Practices, newest first. No auth. */
export async function GET(request: NextRequest) {
  try {
    const parsed = PublicPracticesQuerySchema.safeParse({
      q: request.nextUrl.searchParams.get('q') ?? undefined,
      page: request.nextUrl.searchParams.get('page') ?? undefined,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: parsed.error.message } },
        { status: 400 }
      );
    }
    const { q, page } = parsed.data;
    const from = (page - 1) * PAGE_SIZE;

    const supabase = await createSupabaseServerClient();
    let query = supabase
      .from('practices')
      .select('id, title, description, created_at, script')
      .eq('visibility', 'public')
      .eq('hidden', false)
      .order('created_at', { ascending: false })
      .range(from, from + PAGE_SIZE); // one extra row tells us whether another page exists

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
    const practices = rows.slice(0, PAGE_SIZE).map((row) => {
      const progressions = (row.script as { progressions?: unknown[] } | null)?.progressions;
      return {
        id: row.id,
        title: row.title,
        description: row.description,
        created_at: row.created_at,
        progressionCount: Array.isArray(progressions) ? progressions.length : 0,
        thumbnail: toThumbnail(row.script),
      };
    });
    return NextResponse.json({ practices, page, hasMore: rows.length > PAGE_SIZE });
  } catch (err) {
    console.error('[Practices API] Fatal public GET Error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
