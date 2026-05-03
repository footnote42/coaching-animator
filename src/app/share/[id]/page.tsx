import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import dynamic from 'next/dynamic';

const ShareViewer = dynamic(
  () => import('@/features/animation/components/ShareViewer').then((m) => m.ShareViewer),
  {
    ssr: false,
    loading: () => (
      <div
        className="animate-pulse bg-black flex items-center justify-center text-white/50"
        style={{ position: 'fixed', inset: 0 }}
      >
        Loading…
      </div>
    ),
  },
);

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: animation } = await supabase
    .from('saved_animations')
    .select('title, description')
    .eq('id', id)
    .is('hidden_at', null)
    .in('visibility', ['public', 'link_shared'])
    .single();

  if (!animation) {
    return { title: 'Animation Not Found' };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? '';

  return {
    title: `Watch ${animation.title} | Coaching Animator`,
    description: animation.description || 'Watch this coaching animation.',
    openGraph: {
      title: `Watch ${animation.title}`,
      description: animation.description || 'Watch this coaching animation.',
      type: 'website',
      ...(baseUrl && {
        images: [
          {
            url: `${baseUrl}/og-share.png`,
            width: 1200,
            height: 630,
            alt: animation.title,
          },
        ],
      }),
    },
  };
}

export default async function SharePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  // T006a — fetch animation with progression fields
  const { data: animation } = await supabase
    .from('saved_animations')
    .select('id, title, payload, view_count, parent_animation_id, is_progression, progression_order, user_id, coaching_notes')
    .eq('id', id)
    .is('hidden_at', null)
    .single();

  // T006a — null guard: render 404 page (SC-005, FR-010)
  if (!animation) {
    notFound();
  }

  // Increment view count
  await supabase
    .from('saved_animations')
    .update({ view_count: (animation.view_count || 0) + 1 })
    .eq('id', id);

  // T006b — build fullNavigationSet for progression nav
  type NavItem = { id: string; label: string };
  let fullNavigationSet: NavItem[] = [];

  if (animation.is_progression && animation.parent_animation_id) {
    // This is a progression — fetch the base animation and sibling progressions
    const [baseResult, siblingsResult] = await Promise.all([
      supabase
        .from('saved_animations')
        .select('id, title')
        .eq('id', animation.parent_animation_id)
        .is('hidden_at', null)
        .single(),
      supabase
        .from('saved_animations')
        .select('id, title, progression_order')
        .eq('parent_animation_id', animation.parent_animation_id)
        .eq('is_progression', true)
        .is('hidden_at', null)
        .order('progression_order', { ascending: true }),
    ]);

    const base = baseResult.data;
    const siblings = siblingsResult.data ?? [];

    if (base) {
      fullNavigationSet = [
        { id: base.id, label: base.title ?? 'Base' },
        ...siblings.map((s) => ({ id: s.id, label: s.title ?? `Progression ${s.progression_order}` })),
      ];
    }
  } else if (!animation.is_progression) {
    // This is a base animation — fetch its progressions
    const { data: progressions } = await supabase
      .from('saved_animations')
      .select('id, title, progression_order')
      .eq('parent_animation_id', id)
      .eq('is_progression', true)
      .is('hidden_at', null)
      .order('progression_order', { ascending: true });

    if (progressions && progressions.length > 0) {
      fullNavigationSet = [
        { id: animation.id, label: animation.title ?? 'Base' },
        ...progressions.map((p) => ({ id: p.id, label: p.title ?? `Progression ${p.progression_order}` })),
      ];
    }
  }

  return (
    <ShareViewer
      payload={animation.payload}
      animationTitle={animation.title}
      autoPlay={true}
      fullNavigationSet={fullNavigationSet.length > 1 ? fullNavigationSet : undefined}
      currentAnimationId={id}
      animationUserId={animation.user_id}
      coachingNotes={animation.coaching_notes}
    />
  );
}
