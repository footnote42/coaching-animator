/**
 * Phase 3.1 Verification Script
 * Checks all requirements without exposing sensitive data
 */

import { readFileSync, existsSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

console.log('🔍 Phase 3.1 Verification\n');
console.log('=' .repeat(50));

// Check 1: Files exist
console.log('\n📁 File Structure:');
const files = [
  '.env.local',
  '.env.local.example',
  'api/share.ts',
  'api/share/[id].ts'
];

let allFilesExist = true;
files.forEach(file => {
  const exists = existsSync(file);
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

// Check 2: Environment variables
console.log('\n🔑 Environment Variables:');
const envContent = readFileSync('.env.local', 'utf8');
const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));

const envVars = {};
lines.forEach(line => {
  const [key, ...valueParts] = line.split('=');
  envVars[key.trim()] = valueParts.join('=').trim();
});

const requiredVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
let allVarsValid = true;

requiredVars.forEach(varName => {
  const value = envVars[varName];
  const isSet = value && value.length > 10 && !value.includes('[your-');
  console.log(`  ${isSet ? '✅' : '❌'} ${varName}: ${isSet ? 'Configured (' + value.length + ' chars)' : 'Missing or placeholder'}`);
  if (!isSet) allVarsValid = false;
});

// Check 3: Supabase connection (if vars are valid)
if (allVarsValid) {
  console.log('\n🔌 Supabase Connection Test:');
  try {
    const supabase = createClient(
      envVars.SUPABASE_URL,
      envVars.SUPABASE_ANON_KEY
    );

    // Test connection with a simple query
    const { data, error } = await supabase
      .from('shares')
      .select('id')
      .limit(1);

    if (error) {
      console.log('  ❌ Connection failed:', error.message);
      console.log('  💡 Verify:');
      console.log('     - Supabase project is active');
      console.log('     - Credentials are correct');
      console.log('     - shares table exists');
    } else {
      console.log('  ✅ Connection successful');
      console.log('  ✅ Table "shares" accessible');
      console.log(`  📊 Rows in database: ${data.length}`);
    }
  } catch (err) {
    console.log('  ❌ Connection error:', err.message);
  }
} else {
  console.log('\n⏭️  Skipping connection test (environment variables not configured)');
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('\n📋 Summary:');
if (allFilesExist && allVarsValid) {
  console.log('  ✅ Phase 3.1 Complete!');
  console.log('  ➡️  Ready for Phase 3.2 (API Implementation)');
} else {
  console.log('  ⚠️  Phase 3.1 Incomplete');
  if (!allFilesExist) console.log('  ❌ Some files missing');
  if (!allVarsValid) console.log('  ❌ Environment variables not configured');
  console.log('\n  📖 See SUPABASE_SETUP_INSTRUCTIONS.md for help');
}

console.log('');
