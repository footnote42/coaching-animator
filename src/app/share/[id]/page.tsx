import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import dynamic from 'next/dynamic';

const ShareViewer = dynamic(
  () => import('@/features/animation/components/ShareViewer').then((m) => m.ShareViewer),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse bg-white/10 h-[300px] w-full flex items-center justify-center text-white/50">
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

  const { data: animation } = await supabase
    .from('saved_animations')
    .select('id, title, payload, view_count')
    .eq('id', id)
    .is('hidden_at', null)
    .in('visibility', ['public', 'link_shared'])
    .single();

  if (!animation) {
    notFound();
  }

  // Increment view count
  await supabase
    .from('saved_animations')
    .update({ view_count: (animation.view_count || 0) + 1 })
    .eq('id', id);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-0 py-4">
      <ShareViewer payload={animation.payload} autoPlay={true} />
    </div>
  );
}
