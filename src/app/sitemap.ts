import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://coaching-animator.vercel.app';

  // Static pages
  const staticPages = [
    '',
    '/gallery',
    '/app',
    '/login',
    '/register',
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
