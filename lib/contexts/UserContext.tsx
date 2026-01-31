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


      if (data) {
        setProfile({
          id: data.id,
          display_name: data.display_name,
          role: data.role || 'user',
          animation_count: data.animation_count || 0,
          max_animations: data.max_animations || 50,
        });
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

      hasReceivedAuthState = true;
      const newUser = session?.user ?? null;
      setUser(newUser);

      if (newUser) {
        await loadProfile(newUser.id);
      } else {
        setProfile(null);
      }

      // Only set loading false after we've received and processed auth state
      setLoading(false);
    });

    // Also try to get the current user for immediate feedback
    // But don't set loading=false here - let onAuthStateChange handle it
    const initAuth = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();

        if (!isSubscribed) return;

        // If we got a user and onAuthStateChange hasn't fired yet, 
        // set the user immediately for faster UI
        if (currentUser && !hasReceivedAuthState) {
          setUser(currentUser);
          await loadProfile(currentUser.id);
        }

        // Give onAuthStateChange a moment to fire, then set loading false if it hasn't
        setTimeout(() => {
          if (isSubscribed && !hasReceivedAuthState) {
            setLoading(false);
          }
        }, 500);
      } catch (err) {
        // Ignore AbortErrors during cleanup
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        console.error('Error initializing auth:', err);
        if (isSubscribed && !hasReceivedAuthState) {
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      isSubscribed = false;
      subscription.unsubscribe();
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


