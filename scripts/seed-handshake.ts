import fs from 'fs'
const envContent = fs.readFileSync('.env.local', 'utf-8')
envContent.split('\\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) process.env[match[1]] = match[2].trim()
})
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
    console.log("Seeding universal data handshake test...")

    // 1. Create user and profile
    const email = "test+apex@approveiq.com"
    const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
        email,
        password: "Password123!",
        email_confirm: true,
        user_metadata: { full_name: "Apex Admin" }
    })
    
    if (authErr && !authErr.message.includes("already")) {
         console.error("Auth error", authErr)
         return
    }

    const userId = authUser?.user?.id || (await supabase.auth.admin.listUsers()).data.users.find(u => u.email === email)?.id
    if (!userId) throw new Error("Could not find or create user")

    // 2. Create organization
    console.log("Creating organization: Apex Commercial Lending, LLC")
    const { data: org, error: orgErr } = await supabase
        .from('organizations')
        .upsert({
            name: "Apex Commercial Lending, LLC",
            data_cache: {
                company_name: "Apex Commercial Lending, LLC",
                address: "123 Business Park Way, Frisco, TX 75034",
                street_address: "123 Business Park Way",
                city: "Frisco",
                state: "TX",
                zip: "75034",
                ein: "99-1234567",
                industry: "Commercial Equipment Finance",
                phone: "(555) 123-4567",
                website: "https://apexcommerciallending.com",
            }
        }, { onConflict: 'name' })
        .select()
        .single()
        
    let orgId = org?.id
    if (orgErr) {
        // Fallback: If some columns don't exist, we'll try just standard ones
        console.error("Org insert error (might be missing columns):", orgErr.message)
        const { data: orgFallback, error: orgFallbackErr } = await supabase
            .from('organizations')
            .upsert({ name: "Apex Commercial Lending, LLC" })
            .select().single()
            
        if (orgFallbackErr) throw orgFallbackErr
        orgId = orgFallback.id
        
        // We might need to update the table schema if it's missing columns, let's execute SQL via postgres function if any, or just fail for now.
    }

    console.log("Created org:", orgId)

    // Link profile
    await supabase.from('profiles').upsert({
        id: userId,
        org_id: orgId,
        full_name: "Apex Admin",
        role: "Admin"
    })

    // 3. Create active onboarding programs
    console.log("Creating onboarding programs for Equifax, Experian, SBFE, D&B...")
    
    // Equifax
    const { data: eqApp } = await supabase.from('equifax_onboarding_applications').insert({ org_id: orgId, status: 'draft' }).select().single()
    if (eqApp) await supabase.from('equifax_onboarding_data').insert({ application_id: eqApp.id })

    // Experian
    const { data: exApp } = await supabase.from('experian_onboarding_applications').insert({ org_id: orgId, status: 'draft' }).select().single()
    if (exApp) await supabase.from('experian_onboarding_data').insert({ application_id: exApp.id })

    // SBFE 
    const { data: sbfeApp } = await supabase.from('sbfe_onboarding_applications').insert({ org_id: orgId, status: 'draft' }).select().single()
    if (sbfeApp) await supabase.from('sbfe_onboarding_data').insert({ application_id: sbfeApp.id })

    // D&B
    const { data: dnbApp } = await supabase.from('dnb_onboarding_applications').insert({ org_id: orgId, status: 'draft' }).select().single()
    if (dnbApp) await supabase.from('dnb_onboarding_data').insert({ application_id: dnbApp.id })

    console.log("✅ Seed complete! Login with: " + email + " / Password123!")
}

run()
