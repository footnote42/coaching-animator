/**
 * Add max_animations column via direct SQL execution
 * Run with: npx tsx scripts/add-max-animations.ts
 */

// @ts-ignore - postgres package doesn't have type declarations
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('Missing DATABASE_URL in .env.local');
  console.error('Please add: DATABASE_URL=postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres');
  process.exit(1);
}

async function addColumn() {
  console.log('=== Adding max_animations column ===\n');

  const sql = postgres(connectionString);

  try {
    // Add the column
    console.log('1. Adding column...');
    await sql`
      ALTER TABLE user_profiles
      ADD COLUMN IF NOT EXISTS max_animations INTEGER DEFAULT 50 NOT NULL
    `;
    console.log('✅ Column added');

    // Update existing rows
    console.log('\n2. Updating existing rows...');
    const result = await sql`
      UPDATE user_profiles
      SET max_animations = 50
      WHERE max_animations IS NULL
    `;
    console.log(`✅ Updated ${result.count} rows`);

    // Verify
    console.log('\n3. Verifying...');
    const [sample] = await sql`
      SELECT id, display_name, animation_count, max_animations
      FROM user_profiles
      LIMIT 1
    `;
    console.log('Sample row:', sample);

    console.log('\n✅ Migration complete!');

  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

addColumn();
