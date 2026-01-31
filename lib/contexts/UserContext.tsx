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
        console.warn('Error loading user profile:', error);
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

        const authResult = await supabase.auth.getUser();
        const user = authResult.data?.user;

        if (!isSubscribed) return;
        setUser(user ?? null);

        if (user && isSubscribed) {
          await loadProfile(user.id);
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
        await loadProfile(newUser.id);
      } else {
        setProfile(null);
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


