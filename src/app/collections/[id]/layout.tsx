import type { Metadata } from 'next';
import { createSupabaseServerClient } from '@/lib/supabase/server';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Pick<LayoutProps, 'params'>): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  // RLS limits this to collections the viewer may see
  const { data: collection } = await supabase
    .from('collections')
    .select('name, description')
    .eq('id', id)
    .single();

  if (!collection) {
    return {
      title: 'Collection not found',
      description: 'This collection does not exist or is private. Browse the gallery for rugby animations shared by coaches.',
    };
  }

  return {
    title: collection.name,
    description: collection.description || `A collection of rugby animations: ${collection.name}. Watch the plays and drills on Coaching Animator.`,
  };
}

export default function CollectionLayout({ children }: Pick<LayoutProps, 'children'>) {
  return children;
}
