'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export type UserRole = 'user' | 'admin';

interface UserProfile {
  id: string;
  display_name: string | null;
  role: UserRole;
  animation_count: number;
  max_animations: number;
}

interface UserContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (userId: string) => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, display_name, role, animation_count, max_animations')
        .eq('id', userId)
        .single();

      if (error) {
        // Ignore AbortErrors - these happen during navigation/unmount
        const isAbortError = error.message?.includes('abort') ||
          error.message?.includes('AbortError') ||
          (error as unknown as Error).name === 'AbortError';
        if (isAbortError) {
          return; // Silent return, don't set fallback profile
        }

        // Log but don't hang - provide a default profile if missing
        console.warn('Error loading user profile:', error);
        setProfile({
          id: userId,
          display_name: null,
          role: 'user',
          animation_count: 0,
          max_animations: 50,
        });
        return;
      }

      console.log('[UserContext] Profile loaded from Supabase:', data);

      if (data) {
        const newProfile = {
          id: data.id,
          display_name: data.display_name,
          role: data.role || 'user',
          animation_count: data.animation_count || 0,
          max_animations: data.max_animations || 50,
        };
        console.log('[UserContext] Setting profile state:', newProfile);
        setProfile(newProfile);
      }
    } catch (err) {
      // Ignore AbortErrors - these happen during navigation/unmount
      if (err instanceof Error && (err.name === 'AbortError' || err.message.includes('abort'))) {
        return; // Silent return
      }

      console.error('Unexpected error loading profile:', err);
      // Ensure we don't leave the user without a profile object if possible
      setProfile({
        id: userId,
        display_name: null,
        role: 'user',
        animation_count: 0,
        max_animations: 50,
      });
    }

  };

  const refreshProfile = async () => {
    console.log('[UserContext] refreshProfile called, user:', user?.id);
    if (user) {
      await loadProfile(user.id);
    }
  };

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let isSubscribed = true;
    let hasReceivedAuthState = false;

    // Set up the auth state listener FIRST before checking initial state
    // This ensures we don't miss any state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isSubscribed) return;

      const newUser = session?.user ?? null;
      setUser(newUser);
      hasReceivedAuthState = true;

      // Don't block loading state on profile loading
      if (newUser) {
        loadProfile(newUser.id);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    const initAuth = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();

        if (!isSubscribed) return;

        if (currentUser) {
          setUser(currentUser);
          loadProfile(currentUser.id); // Non-blocking
        }

        // Final fallback to ensure loading always finishes
        if (!hasReceivedAuthState) {
          setLoading(false);
          hasReceivedAuthState = true;
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        console.error('Error initializing auth:', err);
        if (isSubscribed) {
          setLoading(false);
          hasReceivedAuthState = true;
        }
      }
    };

    // Absolute failsafe: force loading false after 3 seconds no matter what
    const failsafe = setTimeout(() => {
      if (isSubscribed) {
        setLoading(false);
      }
    }, 3000);

    initAuth();

    return () => {
      isSubscribed = false;
      subscription.unsubscribe();
      clearTimeout(failsafe);
    };
  }, []);

  const signOut = async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.error('[Auth] Sign out error:', err);
    } finally {
      setUser(null);
      setProfile(null);
      window.location.href = '/';
    }
  };

  const value: UserContextValue = {
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    isAuthenticated: !!user,
    signOut,
    refreshProfile,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}


