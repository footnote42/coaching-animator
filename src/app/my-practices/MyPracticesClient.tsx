'use client';

import Link from 'next/link';
import { useUser } from '@/lib/contexts/UserContext';
import { MyPracticesList } from '@/features/practice/components/MyPracticesList';

export function MyPracticesClient() {
  const { user, loading } = useUser();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-text-primary">My Practices</h1>
        <Link href="/practice" className="inline-flex min-h-[44px] items-center text-sm underline">
          New Practice
        </Link>
      </div>
      {loading ? null : user ? (
        <MyPracticesList />
      ) : (
        <p className="text-sm text-text-primary">
          <Link href="/login?redirect=/my-practices" className="underline">Sign in</Link> to see your saved Practices.
        </p>
      )}
    </main>
  );
}
