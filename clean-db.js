
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanData() {
    const pId = '162b7d40-9291-4d32-9a8d-5bab52e7756e';
    console.log(`Deleting all items for program ${pId} to reset...`);
    const { error } = await supabase
        .from('checklist_items')
        .delete()
        .eq('program_id', pId);

    if (error) console.error(error);
    else console.log("Cleaned up successfully.");
}

cleanData();
