import { loadGuide } from '@/features/practice/docs/guide';
import { getSiteOrigin } from '@/lib/site-origin';

export const dynamic = 'force-static';

/** GET /practice-script/v1/guide.md: the Practice Script guide as raw markdown, for models to fetch. */
export function GET() {
  return new Response(loadGuide(getSiteOrigin()), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
