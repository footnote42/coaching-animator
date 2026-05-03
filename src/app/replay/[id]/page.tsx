import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import dynamic from 'next/dynamic';
import { Video } from 'lucide-react';
import { ReplayActions } from './ReplayActions';
const ReplayViewer = dynamic(() => import('@/features/animation/components/ReplayViewer').then(m => m.ReplayViewer), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-surface h-[300px] w-full flex items-center justify-center text-text-primary/50">Loading replay viewer...</div>
});

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  // Check saved_animations
  const { data: animation } = await supabase
    .from('saved_animations')
    .select('title, description, animation_type')
    .eq('id', id)
    .is('hidden_at', null)
    .in('visibility', ['public', 'link_shared'])
    .single();

  if (!animation) {
    return {
      title: 'Animation Not Found',
    };
  }

  return {
    title: `${animation.title} | Coaching Animator`,
    description: animation.description || `A ${animation.animation_type} animation created with Coaching Animator`,
    openGraph: {
      title: animation.title,
      description: animation.description || `A ${animation.animation_type} animation`,
      type: 'website',
    },
  };
}

export default async function ReplayPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  // Fetch animation from saved_animations
  const { data: animation } = await supabase
    .from('saved_animations')
    .select(`
      id,
      title,
      description,
      coaching_notes,
      video_url,
      animation_type,
      tags,
      payload,
      duration_ms,
      frame_count,
      visibility,
      upvote_count,
      remix_count,
      view_count,
      created_at,
      user_id,
      remixed_from_id,
      remixed_from:remixed_from_id (
        id,
        title
      )
    `)
    .eq('id', id)
    .is('hidden_at', null)
    .in('visibility', ['public', 'link_shared'])
    .single();

  if (!animation) {
    notFound();
  }

  // Flatten remixed_from join
  type RemixedFrom = { id: string; title: string };
  const remixedFromRaw = (animation as unknown as { remixed_from: RemixedFrom | RemixedFrom[] | null }).remixed_from;
  const remixedFrom = Array.isArray(remixedFromRaw) ? remixedFromRaw[0] : remixedFromRaw;
  const remixedFromId: string | null = remixedFrom?.id ?? null;
  const remixedFromTitle: string | null = remixedFrom?.title ?? null;

  // Fetch author display name separately
  let authorDisplayName: string | null = null;
  if (animation.user_id) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('display_name')
      .eq('id', animation.user_id)
      .single();
    authorDisplayName = profile?.display_name ?? null;
  }

  // Increment view count
  await supabase
    .from('saved_animations')
    .update({ view_count: (animation.view_count || 0) + 1 })
    .eq('id', id);

  return (
    <div className="min-h-screen bg-[var(--color-surface-warm)]">
      {/* Animation Header */}
      <header className="border-b border-border bg-surface">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl sm:text-2xl font-heading font-bold text-text-primary">
            {animation.title}
          </h1>
          {animation.description && (
            <p className="mt-2 text-text-primary/80">
              {animation.description}
            </p>
          )}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-sm text-text-primary/70">
            <span>By {authorDisplayName || 'Anonymous Coach'}</span>
            <span className="hidden sm:inline">•</span>
            <span className="capitalize">{animation.animation_type}</span>
            <span className="hidden sm:inline">•</span>
            <span>{animation.frame_count} frames</span>
            <span className="hidden sm:inline">•</span>
            <span>{animation.upvote_count} upvotes</span>
            {(animation.remix_count ?? 0) > 0 && (
              <>
                <span className="hidden sm:inline">•</span>
                <span>{animation.remix_count} remix{animation.remix_count !== 1 ? 'es' : ''}</span>
              </>
            )}
          </div>
          {animation.tags && animation.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {animation.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Replay Viewer */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <ReplayViewer payload={animation.payload} />

        {animation.coaching_notes && (
          <div className="mt-8 p-4 bg-surface-warm border border-border rounded-none">
            <h2 className="text-lg font-heading font-bold text-text-primary mb-3">
              Coaching Notes
            </h2>
            <div className="text-text-primary/90 whitespace-pre-wrap break-words">
              {animation.coaching_notes}
            </div>
          </div>
        )}

        {/* Video URL */}
        {animation.video_url && (
          <div className="mt-4 p-4 bg-surface border border-border rounded">
            <a
              href={animation.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
            >
              <Video className="w-4 h-4" />
              Watch Tutorial Video
            </a>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface-warm">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-text-primary/70 mb-4">
            Created with{' '}
            <a href="/" className="text-primary hover:underline">
              Visualise Your Own Play
            </a>
          </p>
          <ReplayActions
            animationId={animation.id}
            remixedFromId={remixedFromId}
            remixedFromTitle={remixedFromTitle}
          />
        </div>
      </footer>
    </div>
  );
}
