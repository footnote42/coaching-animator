import { createHash } from 'node:crypto';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export async function verifyPersonalToken(plaintext: string): Promise<string | null> {
  const hash = createHash('sha256').update(plaintext).digest('hex');
  const supabase = createSupabaseAdminClient();
  
  const { data, error } = await supabase.rpc('verify_personal_token', { p_hash: hash });

  if (error) {
    console.error('[Tokens API] verify_personal_token error:', error);
    return null;
  }

  return data || null;
}
