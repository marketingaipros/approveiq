import fs from 'fs'
const envContent = fs.readFileSync('.env.local', 'utf-8')
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) process.env[match[1]] = match[2].trim()
})
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
    const { data: orgs } = await supabase.from('organizations').select('id, name')
    
    for (const org of orgs || []) {
        console.log(`Processing Org: ${org.name}`)
        const { data: programs } = await supabase.from('bureau_programs').select('id, title, bureau').eq('org_id', org.id)
        
        const desiredBureaus = [
            { title: 'Experian Data Furnisher', bureau: 'experian' },
            { title: 'Equifax Metro 2® Intake', bureau: 'equifax' },
            { title: 'D&B Commercial Reporting', bureau: 'dnb' },
            { title: 'CreditSafe Trade Reporting', bureau: 'creditsafe' },
            { title: 'SBFE Trade Data Furnisher', bureau: 'sbfe' }
        ]

        // Keep ONE of each bureau if they exist, delete duplicates
        const seen = new Set()
        for (const prog of programs || []) {
            if (seen.has(prog.bureau)) {
                console.log(`Deleting duplicate: ${prog.title} (${prog.bureau})`)
                await supabase.from('bureau_programs').delete().eq('id', prog.id)
            } else {
                seen.add(prog.bureau)
                
                // Update title to be canonical if needed? No, let's leave existing titles alone, just delete dupes.
            }
        }

        // Add missing
        for (const desired of desiredBureaus) {
            if (!seen.has(desired.bureau)) {
                console.log(`Adding missing: ${desired.title} (${desired.bureau})`)
                await supabase.from('bureau_programs').insert({
                    org_id: org.id,
                    title: desired.title,
                    bureau: desired.bureau,
                    status: 'active',
                    progress_percent: 0
                })
            }
        }
    }
}
run()
