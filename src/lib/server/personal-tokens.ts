import { createHash } from 'node:crypto';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function verifyPersonalToken(plaintext: string): Promise<string | null> {
  const hash = createHash('sha256').update(plaintext).digest('hex');
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase.rpc('verify_personal_token', { p_hash: hash });

  if (error) {
    console.error('[Tokens API] verify_personal_token error:', error);
    return null;
  }

  return data || null;
}
