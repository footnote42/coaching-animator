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

    const initAuth = async () => {
      try {
        if (!isSubscribed) return;

        // Add a timeout fallback for getUser to prevent infinite loading
        const authPromise = supabase.auth.getUser();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Auth timeout')), 5000)
        );

        const authResult = await Promise.race([authPromise, timeoutPromise]) as any;
        const currentUser = authResult.data?.user;

        if (!isSubscribed) return;
        setUser(currentUser ?? null);

        if (currentUser && isSubscribed) {
          await loadProfile(currentUser.id);
        }
      } catch (err) {
        // Ignore AbortErrors during cleanup
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        console.error('Error initializing auth:', err);
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isSubscribed) return;

      const newUser = session?.user ?? null;
      setUser(newUser);

      if (newUser) {
        setLoading(true); // Re-set loading while fetching new profile
        await loadProfile(newUser.id);
        setLoading(false);
      } else {
        setProfile(null);
        // Only trigger loading change if not already done in initAuth
        setLoading(false);
      }
    });

    return () => {
      isSubscribed = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    window.location.href = '/';
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


