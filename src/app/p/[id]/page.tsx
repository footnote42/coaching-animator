import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSiteOrigin } from '@/lib/site-origin';
import { PracticeShareViewer } from '@/features/practice/components/PracticeShareViewer';
import { buildShareDescription } from '@/features/practice/shareSummary';
import { loadPractice } from './loadPractice';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const loaded = await loadPractice(params.id);
  if (!loaded) return { title: 'Practice not found', robots: { index: false, follow: false } };

  const { title, visibility } = loaded.practice;
  const url = `${getSiteOrigin()}/p/${params.id}`;
  const summary = buildShareDescription(loaded.practice, loaded.script);
  // Set explicitly so og:image:alt can carry the Practice title; the image is the opengraph-image route.
  const images = [{ url: `${url}/opengraph-image`, width: 1200, height: 630, alt: title }];
  return {
    title: { absolute: title },
    description: summary,
    alternates: { canonical: url },
    // Only Gallery (public) Practices belong in search results.
    robots: visibility === 'public' ? undefined : { index: false, follow: false },
    openGraph: { title, description: summary, url, type: 'website', images },
    twitter: { card: 'summary_large_image', title, description: summary, images },
  };
}

/** /p/[id]: full-screen share view of a Practice. */
export default async function PracticeSharePage(props: PageProps) {
  const params = await props.params;
  const loaded = await loadPractice(params.id);
  if (!loaded) notFound();
  return <PracticeShareViewer practiceId={loaded.practice.id} title={loaded.practice.title} tags={loaded.practice.tags} sourceUrl={loaded.practice.source_url} sourceTitle={loaded.practice.source_title} script={loaded.script} />;
}
