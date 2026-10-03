'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { PracticeReportsTab } from '@/app/admin/PracticeReportsTab';

/**
 * Admin dashboard: Practice reports, with hide, delete, dismiss and ban owner.
 * Middleware and the admin API routes enforce the admin role; this check only
 * moves a non-admin who lands here somewhere useful.
 */
export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login?redirect=/admin');
        return;
      }
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      if (profile?.role !== 'admin') router.push('/');
    };
    void check();
  }, [router]);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-heading font-bold text-text-primary">Admin Dashboard</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-surface border border-border px-6 py-4">
          <PracticeReportsTab />
        </div>
      </main>
    </div>
  );
}
