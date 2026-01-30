import withSerwistInit from '@serwist/next';

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  cacheOnNavigation: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV !== 'production',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Security headers per FR-SEC-01
  async headers() {
    // CSP directives - allows Supabase, Vercel analytics, inline styles for Konva
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://*.supabase.co",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://vercel.live",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "base-uri 'self'",
      "worker-src 'self' blob:",
    ].join('; ');

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspDirectives,
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // Image optimization for Supabase storage
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // Experimental features
  experimental: {
    // Enable server actions for form handling
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // Webpack config for react-konva compatibility
  webpack: (config, { isServer }) => {
    // Prevent konva from trying to load canvas (Node.js module) on server
    if (isServer) {
      config.externals = [...(config.externals || []), 'canvas'];
    }
    
    // Ensure konva uses browser build
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    
    return config;
  },
};

export default withSerwist(nextConfig);
