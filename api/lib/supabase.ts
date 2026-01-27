/**
 * Supabase Client Singleton
 *
 * Provides a single Supabase client instance across all Vercel Function invocations.
 * The singleton pattern prevents connection leaks and ensures efficient resource usage.
 *
 * Environment variables required:
 * - SUPABASE_URL: Your Supabase project URL (e.g., https://xxxxx.supabase.co)
 * - SUPABASE_ANON_KEY: Your Supabase anonymous/public API key
 *
 * The client uses the anon key with RLS (Row Level Security) policies for access control.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

/**
 * Gets or creates the Supabase client singleton.
 *
 * @throws {Error} If SUPABASE_URL or SUPABASE_ANON_KEY environment variables are missing
 * @returns {SupabaseClient} The Supabase client instance
 */
export function getSupabaseClient(): SupabaseClient {
  // Return existing client if already initialized
  if (supabaseClient) {
    return supabaseClient;
  }

  // Validate environment variables
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing Supabase configuration: SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required. ' +
      'Set these in your .env.local file (local dev) or Vercel project settings (production).'
    );
  }

  // Create and cache the client
  supabaseClient = createClient(url, key);
  return supabaseClient;
}
