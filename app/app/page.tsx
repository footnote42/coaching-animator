'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '../../lib/supabase/client';
import type { User } from '@supabase/supabase-js';

const Editor = dynamic(() => import('../../components/Editor'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-text-primary">Loading editor...</p>
      </div>
    </div>
  ),
});

export default function AnimationToolPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSaveToCloud = () => {
    // TODO: Implement save to cloud modal in Phase 3d
    console.log('Save to cloud clicked');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-text-primary">Loading...</p>
        </div>
      </div>
    );
  }

  return <Editor isAuthenticated={!!user} onSaveToCloud={handleSaveToCloud} />;
}
