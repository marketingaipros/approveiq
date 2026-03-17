import fs from 'fs'
import { createClient } from '@supabase/supabase-js'

const envContent = fs.readFileSync('.env.local', 'utf-8')
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) process.env[match[1]] = match[2].trim()
})

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

async function run() {
    // 1. Get users and profiles
    const { data: profiles, error: pErr } = await supabaseAdmin.from('profiles').select('*')
    console.log("Profiles:", profiles)
    
    // 2. See what orgs we have
    const { data: orgs, error: oErr } = await supabaseAdmin.from('organizations').select('*')
    console.log("Orgs:", orgs?.map(o => ({ id: o.id, name: o.name })))
    
    // 3. Test the RLS condition manually for the first profile
    for (const p of profiles || []) {
        console.log(`\nTesting for user: ${p.id} (org_id: ${p.org_id})`)
        
        // Try to insert using the admin client but simulating the user's insert payload. 
        // This won't trigger RLS with service_role, but we can see the payload.
        console.log(`Would insert experian application with org_id = ${p.org_id}`)
        
        // What do policies say exactly?
        const { data: policies } = await supabaseAdmin.rpc('get_policies') // probably won't work if not defined
    }
}
run().catch(console.error)
