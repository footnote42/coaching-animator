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

  // 1. Check saved_animations
  const { data: animation } = await supabase
    .from('saved_animations')
    .select('title, description, animation_type')
    .eq('id', id)
    .is('hidden_at', null)
    .in('visibility', ['public', 'link_shared'])
    .single();

  // 2. Check shares
  if (!animation) {
    const { data: share } = await supabase
      .from('shares')
      .select('payload')
      .eq('id', id)
      .single();

    if (share) {
      return {
        title: 'Shared Animation | Coaching Animator',
        description: 'View this tactic shared via Coaching Animator.',
        openGraph: {
          title: 'Shared Animation',
          description: 'View this tactic shared via Coaching Animator.',
          type: 'website'
        }
      };
    }
  }

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

  // 1. Try to find in saved_animations (Logged-in User Saves)
  let { data: animation } = await supabase
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

  // 2. If not found, try shares (Anonymous Links)
  let isShare = false;

  if (!animation) {
    const { data: share, error: shareError } = await supabase
      .from('shares')
      .select('id, payload, created_at')
      .eq('id', id)
      .single();

    if (share && !shareError) {
      isShare = true;
      // Construct a pseudo-animation object from the share data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sharePayload = share.payload as any;

      animation = {
        id: share.id,
        title: sharePayload.name || 'Shared Animation', // V1 doesn't have name, hydratePayload provides default
        description: 'A shared animation link',
        animation_type: 'tactic',
        tags: [],
        payload: share.payload,
        duration_ms: 0, // Calculated on client
        frame_count: sharePayload.frames?.length || 0,
        visibility: 'link_shared',
        upvote_count: 0,
        view_count: 0,
        created_at: share.created_at,
        user_id: null // Anonymous
      };

      // Update access time (fire and forget)
      await supabase
        .from('shares')
        .update({ last_accessed_at: new Date().toISOString() })
        .eq('id', id);
    }
  }

  // Fetch author display name separately (only if it's a real user save)
  let authorDisplayName: string | null = null;
  if (!isShare && animation?.user_id) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('display_name')
      .eq('id', animation.user_id)
      .single();
    authorDisplayName = profile?.display_name ?? null;
  }

  if (!animation) {
    notFound();
  }

  // Increment view count (only for saved animations, shares track access time instead)
  if (!isShare) {
    await supabase
      .from('saved_animations')
      .update({ view_count: (animation.view_count || 0) + 1 })
      .eq('id', id);
  }

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
