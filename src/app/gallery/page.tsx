
import GalleryPage from './GalleryClient';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'Browse rugby plays and drills shared by coaches. Watch animations, upvote the best and remix ideas for your own team.',
};

export const dynamic = 'force-dynamic';

export default function Page() {
    return <GalleryPage />;
}
