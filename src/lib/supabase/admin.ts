import { createClient } from '@supabase/supabase-js';

/**
 * Service-role client. Server-only: bypasses RLS. Use solely for operations the
 * anon key cannot do (e.g. auth.admin.deleteUser). Never import from client code.
 */
export function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Admin database configuration missing. Please check SUPABASE_SERVICE_ROLE_KEY.');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
