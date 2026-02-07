import { createSupabaseServerClient } from './supabase/server';

export const MAX_ANIMATIONS_PER_USER = 50;

export async function checkQuota(userId: string): Promise<{ allowed: boolean; current: number; max: number }> {
  const supabase = await createSupabaseServerClient();
  
  const { data } = await supabase
    .from('user_profiles')
    .select('animation_count')
    .eq('id', userId)
    .single();

  const current = data?.animation_count ?? 0;
  
  return {
    allowed: current < MAX_ANIMATIONS_PER_USER,
    current,
    max: MAX_ANIMATIONS_PER_USER,
  };
}

export async function getAnimationCount(userId: string): Promise<number> {
  const supabase = await createSupabaseServerClient();
  
  const { data } = await supabase
    .from('user_profiles')
    .select('animation_count')
    .eq('id', userId)
    .single();

  return data?.animation_count ?? 0;
}
