import type { Metadata, Viewport } from 'next';
import { Archivo, Atkinson_Hyperlegible, Caveat } from 'next/font/google';
import './globals.css';
import { UserProvider } from '@/lib/contexts/UserContext';
import { getSiteOrigin } from '@/lib/site-origin';
import { THEME_INIT_SCRIPT } from '@/shared/theme';
import { Navigation } from '@/shared/components/Navigation';

const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-archivo',
  display: 'swap',
});

const atkinson = Atkinson_Hyperlegible({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-atkinson',
  display: 'swap',
});

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat',
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

import { Toaster } from 'sonner';
import { Footer } from '@/shared/components/Footer';
import { AgeConfirmationDialog } from '@/shared/components/AgeConfirmationDialog';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${archivo.variable} ${atkinson.variable} ${caveat.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="flex min-h-screen flex-col bg-background antialiased" suppressHydrationWarning>
        <UserProvider>
          <Navigation variant="full" />
          <div className="flex-1">{children}</div>
          <Footer />
          <AgeConfirmationDialog />
        </UserProvider>
        <Toaster position="bottom-left" />

      </body>
    </html>
  );
}
