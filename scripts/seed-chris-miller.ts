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
    console.log("Seeding full profile for Chris Miller Inc...")

    // 1. Create user and profile
    const email = "chris.miller@chrismillerinc.com"
    const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
        email,
        password: "Password123!",
        email_confirm: true,
        user_metadata: { full_name: "Chris Miller" }
    })
    
    if (authErr && !authErr.message.includes("already")) {
         console.error("Auth error", authErr)
         return
    }

    const userId = authUser?.user?.id || (await supabase.auth.admin.listUsers()).data.users.find(u => u.email === email)?.id
    if (!userId) throw new Error("Could not find or create user")

    // 2. Create organization
    console.log("Creating organization: Chris Miller Inc")
    const { data: org, error: orgErr } = await supabase
        .from('organizations')
        .insert({
            name: "Chris Miller Inc",
            company_name: "Chris Miller Inc",
            address: "456 Mockingbird Lane, Suite 100, Austin, TX 78701",
            street_address: "456 Mockingbird Lane, Suite 100",
            city: "Austin",
            state: "TX",
            zip: "78701",
            ein: "12-3456789",
            industry: "Software Development",
            phone: "(512) 555-0199",
            website: "https://chrismillerinc.com",
            subscription_tier: "enterprise",
            subscription_status: "active"
        })
        .select()
        .single()
        
    let orgId = org?.id
    if (orgErr && orgErr.code !== '23505') { 
        throw orgErr
    } else if (orgErr && orgErr.code === '23505') {
        const { data: existingOrg } = await supabase.from('organizations').select('id').eq('name', 'Chris Miller Inc').single();
        orgId = existingOrg?.id;
    }

    console.log("Org ID:", orgId)

    // Link profile
    await supabase.from('profiles').upsert({
        id: userId,
        org_id: orgId,
        full_name: "Chris Miller",
        role: "Owner",
        is_system_admin: false
    })

    // Create bureau master profile
    await supabase.from('bureau_master_profiles').upsert({
        org_id: orgId,
        company_name: "Chris Miller Inc",
        company_address: "456 Mockingbird Lane, Suite 100, Austin, TX 78701",
        company_phone: "(512) 555-0199",
        company_website: "https://chrismillerinc.com",
        primary_contact_name: "Chris Miller",
        primary_contact_email: email,
        primary_contact_phone: "(512) 555-0199",
        years_in_business: "5",
        customer_acquisition: "Direct Sales"
    })

    // 3. Create active onboarding programs and populated data
    console.log("Creating populated onboarding programs for Equifax, Experian, SBFE, D&B...")
    
    // Equifax - Delete existing if we're re-running
    await supabase.from('equifax_onboarding_applications').delete().eq('org_id', orgId)
    const { data: eqApp } = await supabase.from('equifax_onboarding_applications').insert({ org_id: orgId, status: 'manual_review_required' }).select().single()
    if (eqApp) await supabase.from('equifax_onboarding_data').insert({ 
        application_id: eqApp.id,
        company_name: "Chris Miller Inc",
        company_address: "456 Mockingbird Lane, Suite 100, Austin, TX 78701",
        company_phone_completed: true,
        company_website_completed: true,
        industry_completed: true,
        repayment_terms_completed: true,
        loan_ranges_completed: true,
        estimated_records_completed: true,
        dispute_procedures_completed: true,
        lending_license_completed: true,
    })

    // Experian
    await supabase.from('experian_onboarding_applications').delete().eq('org_id', orgId)
    const { data: exApp } = await supabase.from('experian_onboarding_applications').insert({ org_id: orgId, status: 'pending_bureau' }).select().single()
    if (exApp) await supabase.from('experian_onboarding_data').insert({ 
        application_id: exApp.id,
        legal_entity_name: "Chris Miller Inc",
        ownership_type: "Corporation",
        state_of_incorporation: "TX",
        business_classification: "B2B",
        agreed_to_terms: true
    })

    // SBFE 
    await supabase.from('sbfe_onboarding_applications').delete().eq('org_id', orgId)
    const { data: sbfeApp } = await supabase.from('sbfe_onboarding_applications').insert({ org_id: orgId, status: 'approved' }).select().single()
    if (sbfeApp) await supabase.from('sbfe_onboarding_data').insert({ 
        application_id: sbfeApp.id,
        legal_entity_name: "Chris Miller Inc",
        portfolio_size_dollars: 5000000,
        average_loan_size: 25000,
        agreed_to_terms: true
    })

    // D&B
    await supabase.from('dnb_onboarding_applications').delete().eq('org_id', orgId)
    const { data: dnbApp } = await supabase.from('dnb_onboarding_applications').insert({ org_id: orgId, status: 'draft' }).select().single()
    if (dnbApp) await supabase.from('dnb_onboarding_data').insert({ 
        application_id: dnbApp.id,
        legal_entity_type: "Corporation",
        ein: "12-3456789",
        duns_number: "012345678",
        business_phone: "(512) 555-0199",
        business_phone_type: "landline",
        business_address: "456 Mockingbird Lane, Suite 100",
        business_city: "Austin",
        business_state: "TX",
        business_zip: "78701",
        address_type: "commercial",
        intent: "reporting_customers"
    })

    console.log("✅ Seed complete! Login with: " + email + " / Password123!")
}

run()
