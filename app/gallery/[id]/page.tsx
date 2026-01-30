import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { createSupabaseServerClient } from '../../../lib/supabase/server';
import { GalleryDetailClient } from './GalleryDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  
  const { data: animation } = await supabase
    .from('saved_animations')
    .select('title, description, animation_type, tags')
    .eq('id', id)
    .is('hidden_at', null)
    .eq('visibility', 'public')
    .single();

  if (!animation) {
    return {
      title: 'Animation Not Found',
    };
  }

  const description = animation.description || `A ${animation.animation_type} animation for rugby coaching`;

  return {
    title: `${animation.title} | Coaching Animator Gallery`,
    description,
    keywords: ['rugby', 'animation', 'coaching', animation.animation_type, ...(animation.tags || [])],
    openGraph: {
      title: animation.title,
      description,
      type: 'website',
      images: [`/api/og/${id}`],
    },
    twitter: {
      card: 'summary_large_image',
      title: animation.title,
      description,
      images: [`/api/og/${id}`],
    },
  };
}

export default async function GalleryDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: animation, error } = await supabase
    .from('saved_animations')
    .select(`
      id,
      title,
      description,
      coaching_notes,
      animation_type,
      tags,
      payload,
      duration_ms,
      frame_count,
      visibility,
      upvote_count,
      view_count,
      created_at,
      user_id,
      user_profiles!saved_animations_user_id_fkey (
        display_name
      )
    `)
    .eq('id', id)
    .is('hidden_at', null)
    .eq('visibility', 'public')
    .single();

  if (error || !animation) {
    notFound();
  }

  // Increment view count
  await supabase
    .from('saved_animations')
    .update({ view_count: (animation.view_count || 0) + 1 })
    .eq('id', id);

  const authorName = (animation.user_profiles as unknown as { display_name: string | null } | null)?.display_name || 'Anonymous Coach';

  return (
    <GalleryDetailClient
      animation={{
        ...animation,
        author: { display_name: authorName },
      }}
    />
  );
}
