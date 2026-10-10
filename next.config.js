const isDev = process.env.NODE_ENV !== 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  // Do not advertise the framework in an X-Powered-By header.
  poweredByHeader: false,

  // Routes of the retired animation model. Old share and replay ids no longer
  // exist, so those land on the share view's friendly not-found page.
  async redirects() {
    return [
      { source: '/app', destination: '/practice', permanent: true },
      { source: '/explore', destination: '/gallery', permanent: true },
      { source: '/my-gallery', destination: '/my-practices', permanent: true },
      { source: '/share/:id', destination: '/p/:id', permanent: true },
      { source: '/replay/:id', destination: '/p/:id', permanent: true },
    ];
  },

  // Security headers per FR-SEC-01
  async headers() {
    // CSP directives: Supabase and inline scripts and styles.
    // 'unsafe-eval' is dev only: Next.js uses eval for fast refresh and source
    // maps. Konva, react-konva and marked need no eval in production.
    // A local Supabase (e2e, CI) is not under *.supabase.co, so allow its origin too.
    let localSupabase = '';
    try {
      const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '');
      if (!url.hostname.endsWith('.supabase.co')) {
        localSupabase = ` ${url.origin} ${url.origin.replace(/^http/, 'ws')}`;
      }
    } catch {
      // unset or invalid: hosted defaults only
    }
    const cspDirectives = [
      "default-src 'self'",
      `script-src 'self'${isDev ? " 'unsafe-eval'" : ''} 'unsafe-inline'`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://*.supabase.co",
      "font-src 'self' data:",
      `connect-src 'self' https://*.supabase.co wss://*.supabase.co${localSupabase}`,
      "frame-src 'self'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "base-uri 'self'",
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
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains',
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
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // #177: optimizer disabled to remove the _next/image attack surface until the Next 16 upgrade.
  images: {
    unoptimized: true,
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

export default nextConfig;
