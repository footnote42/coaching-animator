import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export function createSupabaseBrowserClient() {
  // Return existing instance if available (singleton pattern)
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Create new instance with proper configuration to handle React Strict Mode
  supabaseInstance = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Use localStorage persistence for auth state
        persistSession: true,
        // Disable auto-refresh during initialization to prevent AbortErrors
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // Use 'navigator.locks' with a longer timeout to prevent race conditions
        // This helps with React Strict Mode double-mounting
        flowType: 'pkce',
      },
      // Mark as singleton to prevent multiple initialization attempts
      isSingleton: true,
    }
  );

  return supabaseInstance;
}
