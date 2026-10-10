'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { PracticeReportsTab } from '@/app/admin/PracticeReportsTab';
import { FeedbackTab } from '@/app/admin/FeedbackTab';

/**
 * Admin dashboard: Practice reports (hide, delete, dismiss, ban owner) and Feedback.
 * Middleware and the admin API routes enforce the admin role; this check only
 * moves a non-admin who lands here somewhere useful.
 */
export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'reports' | 'feedback'>('reports');

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
        <div role="tablist" className="flex gap-2 mb-4">
          {(['reports', 'feedback'] as const).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                tab === t ? 'bg-primary text-text-inverse' : 'bg-surface-warm text-text-primary'
              }`}
            >
              {t === 'reports' ? 'Reports' : 'Feedback'}
            </button>
          ))}
        </div>
        <div className="bg-surface border border-border px-6 py-4">
          {tab === 'reports' ? <PracticeReportsTab /> : <FeedbackTab />}
        </div>
      </main>
    </div>
  );
}
