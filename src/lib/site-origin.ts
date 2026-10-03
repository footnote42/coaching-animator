export const CANONICAL_ORIGIN = 'https://coaching-animator.waynetellis.com';

/** The one origin used for metadata, sitemap, robots, share and OG URLs. No trailing slash. */
export function getSiteOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return (raw || CANONICAL_ORIGIN).replace(/\/+$/, '');
}
