import { Suspense } from 'react';
import { GalleryClient } from '@/features/practice/components/GalleryClient';

export const metadata = {
  title: 'Gallery',
  description: 'Browse rugby coaching Practices shared by Coaches.',
};

export default function GalleryPage() {
  return (
    <Suspense>
      <GalleryClient />
    </Suspense>
  );
}
