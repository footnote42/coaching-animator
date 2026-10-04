import { Suspense } from 'react';
import { PracticeImport } from '@/features/practice/components/PracticeImport';

export const metadata = {
  title: 'Practice editor',
};

export default function PracticePage() {
  return (
    <Suspense fallback={<main aria-busy="true" className="min-h-[calc(100dvh-57px)]" />}>
      <PracticeImport />
    </Suspense>
  );
}
