import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_HOPS = 5;

interface RouteParams {
  params: { id: string };
}

export interface LineageNode {
  id: string;
  title: string;
}

/**
 * GET /api/animations/[id]/lineage
 *
 * Walks the remixed_from_id chain upward from the given animation, up to MAX_HOPS.
 * Returns the full ancestor chain ordered oldest-first, with the current animation last.
 *
 * Only includes public/link_shared animations in the chain.
 * Response: { chain: LineageNode[] }
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = params;
  const supabase = await createSupabaseServerClient();

  const chain: LineageNode[] = [];
  let currentId: string | null = id;
  let hops = 0;

  while (currentId && hops <= MAX_HOPS) {
    const { data: animation }: { data: { id: string; title: string; remixed_from_id: string | null; visibility: string } | null } = await supabase
      .from('saved_animations')
      .select('id, title, remixed_from_id, visibility')
      .eq('id', currentId)
      .is('hidden_at', null)
      .single();

    if (!animation) break;

    // Only include publicly accessible animations in the chain
    if (animation.visibility === 'public' || animation.visibility === 'link_shared') {
      chain.unshift({ id: animation.id, title: animation.title });
    }

    currentId = animation.remixed_from_id ?? null;
    hops++;
  }

  // A chain of 1 (just the current animation) means no meaningful genealogy
  return NextResponse.json({ chain });
}
