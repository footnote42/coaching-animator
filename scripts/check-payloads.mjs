import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(url!, key!);

async function checkSavedAnimations() {
    const { data, error } = await supabase
        .from('saved_animations')
        .select('id, title, payload')
        .limit(3);

    if (error) {
        console.error(error);
    } else {
        data.forEach(anim => {
            const size = JSON.stringify(anim.payload).length;
            console.log(`Animation: ${anim.title}, ID: ${anim.id}, Payload Size: ${size} bytes`);
            // console.log('Payload Sample:', JSON.stringify(anim.payload, null, 2).substring(0, 500));
        });
    }
}

checkSavedAnimations();
