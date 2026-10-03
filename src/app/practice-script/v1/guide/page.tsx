import { marked } from 'marked';
import { loadGuide } from '@/features/practice/docs/guide';
import { getSiteOrigin } from '@/lib/site-origin';

export const dynamic = 'force-static';

export const metadata = {
  title: 'Practice Script guide',
  description: 'How to write a Practice Script, by hand or with any AI model: rules, limits, worked examples and a prompt template.',
  alternates: { canonical: `${getSiteOrigin()}/practice-script/v1/guide` },
};

const ARTICLE = [
  'max-w-3xl mx-auto px-4 py-8 text-text-primary',
  '[&_h1]:text-3xl [&_h1]:font-heading [&_h1]:font-bold [&_h1]:mb-6',
  '[&_h2]:text-2xl [&_h2]:font-heading [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-4',
  '[&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_li]:mb-1',
  '[&_a]:text-primary [&_a]:underline [&_a]:break-all',
  '[&_code]:font-mono [&_code]:text-sm',
  '[&_pre]:overflow-x-auto [&_pre]:border [&_pre]:border-[var(--color-border)] [&_pre]:bg-[var(--color-surface)] [&_pre]:p-3 [&_pre]:mb-4 [&_pre]:text-xs',
  '[&_table]:mb-4 [&_table]:block [&_table]:overflow-x-auto [&_table]:text-sm',
  '[&_th]:border [&_th]:border-[var(--color-border)] [&_th]:px-2 [&_th]:py-1 [&_th]:text-left',
  '[&_td]:border [&_td]:border-[var(--color-border)] [&_td]:px-2 [&_td]:py-1 [&_td]:align-top',
].join(' ');

/** /practice-script/v1/guide: the Practice Script guide as a readable page, from the same source as guide.md. */
export default function PracticeScriptGuidePage() {
  const html = marked.parse(loadGuide(getSiteOrigin()), { async: false });
  return <article className={ARTICLE} dangerouslySetInnerHTML={{ __html: html }} />;
}
