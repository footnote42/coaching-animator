
import AnimationToolPage from './AnimationToolClient';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Animation editor',
  description: 'Build animated rugby plays and drills frame by frame on an interactive pitch, then share them with your players.',
};

export const dynamic = 'force-dynamic';

export default function Page() {
    return <AnimationToolPage />;
}
