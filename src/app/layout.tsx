import type { Metadata, Viewport } from 'next';
import { Oswald } from 'next/font/google';
import './globals.css';
import { UserProvider } from '@/lib/contexts/UserContext';
import { getSiteOrigin } from '@/lib/site-origin';
import { Navigation } from '@/shared/components/Navigation';

const oswald = Oswald({
  subsets: ['latin'],
  variable: '--font-oswald',
  display: 'swap',
});


export const metadata: Metadata = {
  title: {
    default: 'Coaching Animator - Rugby Play Visualisation',
    template: '%s | Coaching Animator',
  },
  description: 'Create and share animated rugby plays. Visualise tactics, demonstrate formations, and share with your team.',
  keywords: ['rugby', 'coaching', 'animation', 'plays', 'tactics', 'visualisation'],
  authors: [{ name: 'Coaching Animator' }],
  creator: 'Coaching Animator',
  metadataBase: new URL(getSiteOrigin()),
  openGraph: {
    type: 'website',
    locale: 'en_GB',
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

import { OfflineIndicator } from '@/shared/components/OfflineIndicator';
import { Toaster } from 'sonner';
import { Footer } from '@/shared/components/Footer';
import { AgeConfirmationDialog } from '@/shared/components/AgeConfirmationDialog';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={oswald.variable} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-screen bg-background antialiased" suppressHydrationWarning>
        <UserProvider>
          <Navigation variant="full" />
          {children}
          <Footer />
          <OfflineIndicator />
          <AgeConfirmationDialog />
        </UserProvider>
        <Toaster position="bottom-left" />

      </body>
    </html>
  );
}
