import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Coaching Animator',
    short_name: 'Coaching Animator',
    description: 'Draw, animate and share rugby coaching Practices.',
    start_url: '/practice',
    display: 'browser',
    background_color: '#F8F9FA',
    theme_color: '#1A3D1A',
    scope: '/',
    icons: [
      { src: '/icon/192', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon/512', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  };
}
