/**
 * Apply pending migrations directly to Supabase
 * Run with: npx tsx scripts/apply-migration.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as fs from 'fs';

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

async function applyMigration() {
  console.log('=== Applying Migration: add_max_animations ===\n');

  // Read the migration file
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260201000000_add_max_animations.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

  console.log('Migration SQL:');
  console.log(migrationSQL);
  console.log('\n');

  // Execute the migration
  console.log('Executing migration...');
  const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

  if (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }

  console.log('✅ Migration applied successfully!');
  console.log('Result:', data);

  // Verify the column was added
  console.log('\nVerifying column exists...');
  const { data: profile, error: verifyError } = await supabase
    .from('user_profiles')
    .select('id, max_animations')
    .limit(1)
    .single();

  if (verifyError) {
    console.error('❌ Verification failed:', verifyError);
  } else {
    console.log('✅ Column verified:', profile);
  }
}

applyMigration().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
