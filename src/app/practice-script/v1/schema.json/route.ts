import schema from '@/features/practice/practice-script.schema.json';
import { getSiteOrigin } from '@/lib/site-origin';

export const dynamic = 'force-static';

/** GET /practice-script/v1/schema.json: the published JSON Schema for Practice Script v1. */
export function GET() {
  const { $schema, ...rest } = schema;
  const body = { $schema, $id: `${getSiteOrigin()}/practice-script/v1/schema.json`, ...rest };
  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      'Content-Type': 'application/schema+json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
