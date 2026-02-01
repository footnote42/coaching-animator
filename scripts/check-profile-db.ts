/**
 * Direct database check for user profile
 * Run with: npx tsx scripts/check-profile-db.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfile() {
  console.log('=== Checking user_profiles table ===\n');

  // Get test user's profile
  const { data: profiles, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', 'd045f90e-18b4-411d-b103-bae420da6e4e') // The test user ID from logs
    .single();

  if (error) {
    console.error('Error querying profile:', error);
    return;
  }

  console.log('Current profile in database:');
  console.log(JSON.stringify(profiles, null, 2));
  console.log('\n');

  // Check animation_count
  console.log('Animation count:', profiles?.animation_count);
  console.log('Max animations:', profiles?.max_animations);
  console.log('Display name:', profiles?.display_name);

  // Count actual animations
  const { count, error: countError } = await supabase
    .from('saved_animations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', 'd045f90e-18b4-411d-b103-bae420da6e4e');

  if (countError) {
    console.error('Error counting animations:', countError);
  } else {
    console.log('\nActual animations in saved_animations table:', count);
    console.log('Difference:', (count || 0) - (profiles?.animation_count || 0));
  }
}

checkProfile().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
