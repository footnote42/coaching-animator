import type { Metadata } from 'next';
import { createSupabaseServerClient } from '@/lib/supabase/server';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Pick<LayoutProps, 'params'>): Promise<Metadata> {
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
    return {
      title: 'Progression not found',
      description: 'This progression does not exist or is private. Browse the gallery for rugby animations shared by coaches.',
    };
  }

  return {
    title: `${animation.title} progression`,
    description: animation.description || `Step-by-step progression for ${animation.title}, built up from simple to game-realistic on Coaching Animator.`,
  };
}

export default function ProgressionLayout({ children }: Pick<LayoutProps, 'children'>) {
  return children;
}
