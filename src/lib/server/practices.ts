import { createSupabaseServerClient } from '@/lib/supabase/server';

export interface SharedPractice {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  visibility: 'private' | 'link' | 'public';
  tags: string[];
  source_url: string | null;
  source_title: string | null;
  script: unknown;
  schema_version: number;
  created_at: string;
  updated_at: string;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * One Practice by id through get_shared_practice(): link and public Practices
 * for anyone, private ones for their owner only. Null when missing or hidden.
 */
export async function getSharedPractice(id: string): Promise<SharedPractice | null> {
  if (!UUID_RE.test(id)) return null;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc('get_shared_practice', { p_id: id }).maybeSingle();
  if (error) {
    console.error('[Practices] get_shared_practice error:', error.message);
    return null;
  }
  return (data as SharedPractice | null) ?? null;
}
