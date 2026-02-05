
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    console.log("Checking bureau_programs...");
    const { data: programs, error: pError } = await supabase.from('bureau_programs').select('*');
    if (pError) console.error(pError);
    else console.log("Programs found:", programs.length);

    if (programs.length > 0) {
        const pId = programs[0].id;
        console.log(`Checking checklist_items for program ${pId}...`);
        const { data: items, error: iError } = await supabase
            .from('checklist_items')
            .select('*')
            .eq('program_id', pId);

        if (iError) console.error(iError);
        else {
            console.log("Items found:", items.length);
            items.forEach(item => {
                console.log(`- [${item.status}] ${item.title}`);
            });
        }
    }
}

checkData();
