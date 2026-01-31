'use client';

import dynamic from 'next/dynamic';
import { Suspense, useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '../../lib/supabase/client';
import { SaveToCloudModal } from '../../components/SaveToCloudModal';
import { OnboardingTutorial } from '../../components/OnboardingTutorial';
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
  const [lastLoadedId, setLastLoadedId] = useState<string | null>(null);

  const project = useProjectStore((state) => state.project);
  const loadProject = useProjectStore((state) => state.loadProject);
  const saveProject = useProjectStore((state) => state.saveProject);

  // Restore editor state from sessionStorage if returning from auth redirect
  useEffect(() => {
    try {
      const savedState = sessionStorage.getItem('rugby_animator_auth_redirect_state');
      if (savedState) {
        const state = JSON.parse(savedState);
        loadProject(state);
        sessionStorage.removeItem('rugby_animator_auth_redirect_state');
        toast.success('Your work has been restored');
      }
    } catch (error) {
      console.error('Failed to restore editor state:', error);
    }
  }, [loadProject]);

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

  // Load animation from cloud if URL parameter is present or changed
  useEffect(() => {
    // Only load if we have a loadId and it's different from last loaded
    if (loadId && loadId !== lastLoadedId) {
      setLastLoadedId(loadId);
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
  }, [loadId, lastLoadedId, loadProject]);

  const handleSaveToCloud = useCallback(() => {
    if (!user) {
      // Save current editor state to sessionStorage before redirecting to login
      try {
        const currentState = saveProject();
        sessionStorage.setItem('rugby_animator_auth_redirect_state', currentState);
      } catch (error) {
        console.error('Failed to save editor state:', error);
      }
      router.push('/login?redirect=/app');
      return;
    }
    setShowSaveModal(true);
  }, [user, router, saveProject]);

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

  const payload = getPayload();

  // Onboarding Tutorial Logic
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('has_seen_tutorial');
    if (!hasSeenTutorial) {
      // Delay slightly to let editor load
      const timer = setTimeout(() => setShowTutorial(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleTutorialComplete = () => {
    localStorage.setItem('has_seen_tutorial', 'true');
    setShowTutorial(false);
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

  return (
    <>
      {/* Guest Mode Banner */}
      {!loading && !user && (
        <div className="bg-primary/5 border-b border-primary/10 px-4 py-2 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-text-primary">
            <span className="font-semibold text-primary">Guest Mode</span>
            <span className="hidden sm:inline">•</span>
            <span>Limited to 10 frames and local storage only.</span>
          </div>
          <a
            href="/register"
            className="text-primary hover:text-primary/80 font-medium underline-offset-4 hover:underline"
          >
            Create Free Account
          </a>
        </div>
      )}

      <Editor isAuthenticated={!!user} onSaveToCloud={handleSaveToCloud} loadingFromCloud={!!loadId} />
      {showSaveModal && payload && (
        <SaveToCloudModal
          projectName={project?.name || 'Untitled Animation'}
          payload={payload}
          onClose={() => setShowSaveModal(false)}
          onSuccess={handleSaveSuccess}
        />
      )}
      <OnboardingTutorial
        isOpen={showTutorial}
        onClose={handleTutorialComplete}
        onComplete={handleTutorialComplete}
      />
    </>
  );
}
