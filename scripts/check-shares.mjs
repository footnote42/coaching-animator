import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error('Missing Supabase configuration');
    process.exit(1);
}

const supabase = createClient(url, key);

async function checkShares() {
    const { data, error } = await supabase
        .from('shares')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error fetching shares:', error);
    } else {
        console.log('Recent shares:', JSON.stringify(data, null, 2));
    }
}

checkShares();
