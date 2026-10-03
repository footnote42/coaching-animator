import { Suspense } from 'react';
import { PracticeImport } from '@/features/practice/components/PracticeImport';

export const metadata = {
  title: 'Practice editor',
};

export default function PracticePage() {
  return (
    <Suspense>
      <PracticeImport />
    </Suspense>
  );
}
