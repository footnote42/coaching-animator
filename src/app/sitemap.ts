import { MetadataRoute } from 'next';
import { getSiteOrigin } from '@/lib/site-origin';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteOrigin();

  // Static pages
  const staticPages = [
    '',
    '/gallery',
    '/help',
    '/help/how-to',
    '/help/coaching',
    '/help/progressions',
    '/terms',
    '/privacy',
    '/contact',
  ];

  const staticRoutes: MetadataRoute.Sitemap = staticPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '/gallery' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : route === '/gallery' ? 0.9 : 0.7,
  }));

  return staticRoutes;
}
