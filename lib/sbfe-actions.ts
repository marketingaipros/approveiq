"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { SBFE_KB_RULES } from "@/lib/sbfe-constants"

/** Seed the SBFE Knowledge Base container with 4 manual rules */
export async function seedSBFEKnowledgeBase() {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) throw new Error("Unauthorized")

    let seeded = 0
    for (const rule of SBFE_KB_RULES) {
        const { error } = await (supabase as any)
            .from('knowledge_base')
            .upsert(rule, { onConflict: 'bureau,topic' })

        if (error) console.error(`Failed to seed: ${rule.topic}`, error)
        else seeded++
    }

    const { data: orgs } = await (supabase as any).from('organizations').select('id').limit(1)
    await (supabase as any).from('audit_logs').insert({
        org_id: orgs?.[0]?.id,
        user_id: session.user.id,
        action: 'sbfe_knowledge_base_seeded',
        metadata: { rules_count: SBFE_KB_RULES.length, tags: ['LENDER_VERIFICATION', 'SBFE_GOVERNANCE'] },
    })

    revalidatePath('/knowledge')
    return { success: true, seeded }
}

/** Get or create an SBFE onboarding application for the current org */
export async function getOrCreateSBFEApplication() {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) throw new Error("Unauthorized")

    const { data: orgs } = await (supabase as any)
        .from('organizations')
        .select('*')
        .limit(1)

    if (!orgs || orgs.length === 0) throw new Error("No organization context found.")
    const org = orgs[0]

    const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle()

    let { data: app } = await (supabase as any)
        .from('sbfe_onboarding_applications')
        .select('*')
        .eq('org_id', org.id)
        .maybeSingle()

    if (!app) {
        const { data: newApp, error: appError } = await (supabase as any)
            .from('sbfe_onboarding_applications')
            .insert({ org_id: org.id, status: 'draft' })
            .select()
            .single()

        if (appError) throw new Error("Failed to create SBFE application: " + appError.message)
        app = newApp

        const { error: dataError } = await (supabase as any)
            .from('sbfe_onboarding_data')
            .insert({ application_id: app.id })

        if (dataError) throw new Error("Failed to initialize SBFE data: " + dataError.message)
    }

    const { data: sbfeData } = await (supabase as any)
        .from('sbfe_onboarding_data')
        .select('*')
        .eq('application_id', app.id)
        .single()

    return {
        application: app,
        data: sbfeData || {},
        profile: {
            fullName: profile?.full_name || profile?.name || session.user.email?.split('@')[0] || '',
            email: profile?.email || session.user.email || '',
            phone: profile?.phone || profile?.phone_number || '',
        },
        org: {
            name: org.name || org.company_name || org.data_cache?.company_name || org.data_cache?.name || '',
            address: org.address || org.street_address || org.data_cache?.address || org.data_cache?.street_address || '',
            city: org.city || org.data_cache?.city || '',
            state: org.state || org.data_cache?.state || '',
            zip: org.zip || org.postal_code || org.data_cache?.zip || org.data_cache?.postal_code || '',
            website: org.website || org.company_website || org.data_cache?.website || '',
            phone: org.phone || org.company_phone || org.data_cache?.phone || '',
            ein: org.ein || org.data_cache?.ein || '',
            industry: org.industry || org.data_cache?.industry || '',
        },
    }
}

/** Auto-save SBFE bureau-specific fields */
export async function updateSBFEData(applicationId: string, data: any) {
    const supabase = await createClient()
    const { error } = await (supabase as any)
        .from('sbfe_onboarding_data')
        .update(data)
        .eq('application_id', applicationId)

    if (error) throw new Error("Failed to save SBFE data: " + error.message)
    revalidatePath('/sbfe-onboarding')
    return { success: true }
}

/** Submit SBFE application for internal review */
export async function submitSBFEApplication(applicationId: string) {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error("Unauthorized")

    const { error } = await (supabase as any)
        .from('sbfe_onboarding_applications')
        .update({ status: 'submitted' })
        .eq('id', applicationId)

    if (error) throw new Error("Failed to submit SBFE application: " + error.message)
    revalidatePath('/sbfe-onboarding')
    revalidatePath('/admin/sbfe')
    return { success: true }
}
