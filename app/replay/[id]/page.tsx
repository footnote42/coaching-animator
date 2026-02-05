import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { createSupabaseServerClient } from '../../../lib/supabase/server';
import { ReplayViewer } from './ReplayViewer';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

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

  const { data: animation, error } = await supabase
    .from('saved_animations')
    .select(`
      id,
      title,
      description,
      animation_type,
      tags,
      payload,
      duration_ms,
      frame_count,
      visibility,
      upvote_count,
      view_count,
      created_at,
      user_id
    `)
    .eq('id', id)
    .is('hidden_at', null)
    .in('visibility', ['public', 'link_shared'])
    .single();

  // Fetch author display name separately
  let authorDisplayName: string | null = null;
  if (animation?.user_id) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('display_name')
      .eq('id', animation.user_id)
      .single();
    authorDisplayName = profile?.display_name ?? null;
  }

  if (error || !animation) {
    notFound();
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
          <h1 className="text-2xl font-heading font-bold text-text-primary">
            {animation.title}
          </h1>
          {animation.description && (
            <p className="mt-2 text-text-primary/80">
              {animation.description}
            </p>
          )}
          <div className="flex items-center gap-4 mt-2 text-sm text-text-primary/70">
            <span>By {authorDisplayName || 'Anonymous Coach'}</span>
            <span>•</span>
            <span className="capitalize">{animation.animation_type}</span>
            <span>•</span>
            <span>{animation.frame_count} frames</span>
            <span>•</span>
            <span>{animation.upvote_count} upvotes</span>
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
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface-warm">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-text-primary/70">
            Created with{' '}
            <a href="/" className="text-primary hover:underline">
              Visualise Your Own Play
            </a>
          </p>
          <p className="mt-2">
            <a
              href="/app"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-text-inverse font-medium hover:bg-primary/90 transition-colors"
            >
              Create Your Own Animation
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
