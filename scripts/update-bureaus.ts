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
        const { data: programs } = await supabase.from('bureau_programs').select('*').eq('org_id', org.id)
        
        const desiredBureaus = [
            { title: 'Experian', bureau: 'experian' },
            { title: 'Equifax', bureau: 'equifax' },
            { title: 'Dun & Bradstreet', bureau: 'dnb' },
            { title: 'CreditSafe', bureau: 'creditsafe' },
            { title: 'SBFE', bureau: 'sbfe' }
        ]

        // Keep ONE of each bureau if they exist, update their title to exact desired name.
        // Delete extras and missing desired bureaus will be added.
        const seen = new Set()
        for (const prog of programs || []) {
            const desired = desiredBureaus.find(d => d.bureau === prog.bureau)
            
            if (seen.has(prog.bureau) || !desired) {
                console.log(`Deleting extra/duplicate: ${prog.title} (${prog.bureau})`)
                await supabase.from('bureau_programs').delete().eq('id', prog.id)
            } else {
                seen.add(prog.bureau)
                
                if (prog.title !== desired.title) {
                    console.log(`Renaming: ${prog.title} -> ${desired.title}`)
                    await supabase.from('bureau_programs').update({ title: desired.title }).eq('id', prog.id)
                }
            }
        }

        // Add missing ones
        for (const desired of desiredBureaus) {
            if (!seen.has(desired.bureau)) {
                console.log(`Adding missing: ${desired.title} (${desired.bureau})`)
                await supabase.from('bureau_programs').insert({
                    org_id: org.id,
                    title: desired.title,
                    bureau: desired.bureau,
                    status: 'active',
                    progress_percent: 0,
                    completed_steps: []
                })
            }
        }
    }
}
run().catch(console.error)
