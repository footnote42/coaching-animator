'use client';

import dynamic from 'next/dynamic';
import { Suspense, useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '../../lib/supabase/client';
import { SaveToCloudModal } from '../../components/SaveToCloudModal';
import { useProjectStore } from '../../src/store/projectStore';
import type { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

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

function LoadingSpinner() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-text-primary">Loading...</p>
      </div>
    </div>
  );
}

export default function AnimationToolPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AnimationToolPageContent />
    </Suspense>
  );
}

function AnimationToolPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loadId = searchParams.get('load');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const project = useProjectStore((state) => state.project);
  const loadProject = useProjectStore((state) => state.loadProject);

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

  // Load animation from cloud if URL parameter is present
  useEffect(() => {
    if (loadId && !project) {
      fetch(`/api/animations/${loadId}`, { credentials: 'include' })
        .then(res => {
          if (!res.ok) throw new Error('Failed to load animation');
          return res.json();
        })
        .then(data => {
          if (data.payload) {
            // Add required project fields that aren't stored in payload
            const projectData = {
              ...data.payload,
              id: data.id || crypto.randomUUID(),
              createdAt: data.created_at || new Date().toISOString(),
              updatedAt: data.updated_at || new Date().toISOString(),
            };
            const result = loadProject(projectData);
            if (!result.success) {
              console.error('Failed to load project:', result.errors);
              toast.error('Failed to load animation');
            } else {
              // Clear autosave to prevent confusion
              localStorage.removeItem('rugby_animator_autosave');
              localStorage.removeItem('rugby_animator_autosave_timestamp');
            }
          }
        })
        .catch(err => {
          console.error('Failed to load animation from cloud:', err);
          toast.error('Failed to load animation');
        });
    }
  }, [loadId, project, loadProject]);

  const handleSaveToCloud = useCallback(() => {
    if (!user) {
      router.push('/login?redirect=/app');
      return;
    }
    setShowSaveModal(true);
  }, [user, router]);

  const handleSaveSuccess = useCallback((id: string) => {
    setShowSaveModal(false);
    toast.success('Animation saved to cloud!');
    console.log('Saved animation ID:', id);
  }, []);

  const getPayload = useCallback(() => {
    if (!project) return null;
    return {
      version: '1.0',
      name: project.name,
      sport: project.sport,
      frames: project.frames,
      settings: project.settings,
    };
  }, [project]);

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

  const payload = getPayload();

  return (
    <>
      <Editor isAuthenticated={!!user} onSaveToCloud={handleSaveToCloud} loadingFromCloud={!!loadId} />
      {showSaveModal && payload && (
        <SaveToCloudModal
          projectName={project?.name || 'Untitled Animation'}
          payload={payload}
          onClose={() => setShowSaveModal(false)}
          onSuccess={handleSaveSuccess}
        />
      )}
    </>
  );
}
