import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSiteOrigin } from '@/lib/site-origin';
import { PracticeShareViewer } from '@/features/practice/components/PracticeShareViewer';
import { loadPractice } from './loadPractice';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

const DEFAULT_DESCRIPTION = 'Watch this rugby Practice Step by Step.';

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const loaded = await loadPractice(params.id);
  if (!loaded) return { title: 'Practice not found', robots: { index: false, follow: false } };

  const { title, description, visibility } = loaded.practice;
  const url = `${getSiteOrigin()}/p/${params.id}`;
  const summary = description || DEFAULT_DESCRIPTION;
  return {
    title: { absolute: title },
    description: summary,
    alternates: { canonical: url },
    // Only Gallery (public) Practices belong in search results.
    robots: visibility === 'public' ? undefined : { index: false, follow: false },
    openGraph: { title, description: summary, url, type: 'website' },
    twitter: { card: 'summary_large_image', title, description: summary },
  };
}

/** /p/[id]: full-screen share view of a Practice. */
export default async function PracticeSharePage(props: PageProps) {
  const params = await props.params;
  const loaded = await loadPractice(params.id);
  if (!loaded) notFound();
  return <PracticeShareViewer practiceId={loaded.practice.id} title={loaded.practice.title} tags={loaded.practice.tags} sourceUrl={loaded.practice.source_url} sourceTitle={loaded.practice.source_title} script={loaded.script} />;
}
