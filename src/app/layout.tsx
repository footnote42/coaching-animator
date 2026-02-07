import type { Metadata, Viewport } from 'next';
import './globals.css';
import { UserProvider } from '@/lib/contexts/UserContext';
import { Navigation } from '@/components/Navigation';

export const metadata: Metadata = {
  title: {
    default: 'Coaching Animator - Rugby Play Visualisation',
    template: '%s | Coaching Animator',
  },
  description: 'Create and share animated rugby plays. Visualize tactics, demonstrate formations, and share with your team.',
  keywords: ['rugby', 'coaching', 'animation', 'plays', 'tactics', 'visualisation'],
  authors: [{ name: 'Coaching Animator' }],
  creator: 'Coaching Animator',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Coaching Animator',
    title: 'Coaching Animator - Rugby Play Visualisation',
    description: 'Create and share animated rugby plays. Visualise tactics, demonstrate formations, and share with your team.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Coaching Animator',
    description: 'Create and share animated rugby plays',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#1A3D1A', // Pitch Green
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

import { OfflineIndicator } from '@/components/OfflineIndicator';
import { Toaster } from 'sonner';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-screen bg-background antialiased" suppressHydrationWarning>
        <UserProvider>
          <Navigation variant="full" />
          {children}
          <OfflineIndicator />
        </UserProvider>
        <Toaster position="bottom-left" />
      </body>
    </html>
  );
}
