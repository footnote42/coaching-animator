
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

console.log('Connecting to:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
    console.log('Testing Gallery Join Query...');

    const { data, error } = await supabase
        .from('saved_animations')
        .select(`
      id,
      title,
      user_id,
      user_profiles (
        display_name
      )
    `)
        .limit(1);

    if (error) {
        console.error('Join Query Error:', JSON.stringify(error, null, 2));
    } else {
        console.log('Join Query Success:', JSON.stringify(data, null, 2));
    }
}

testQuery();
