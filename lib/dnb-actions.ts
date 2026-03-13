"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { DNB_KB_RULES } from "@/lib/dnb-constants"

export { DNB_KB_RULES }

export async function seedDNBKnowledgeBase() {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) throw new Error("Unauthorized")

    let seeded = 0
    for (const rule of DNB_KB_RULES) {
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
        action: 'dnb_knowledge_base_seeded',
        metadata: { rules_count: DNB_KB_RULES.length, tags: ['DNB_ELIGIBILITY', 'DNB_CREDIT_BUILDING', 'DNB_REPORTING'] },
    })

    revalidatePath('/knowledge')
    return { success: true, seeded }
}

export async function getOrCreateDNBApplication() {
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
        .from('dnb_onboarding_applications')
        .select('*')
        .eq('org_id', org.id)
        .maybeSingle()

    if (!app) {
        const { data: newApp, error: appError } = await (supabase as any)
            .from('dnb_onboarding_applications')
            .insert({ org_id: org.id, status: 'draft' })
            .select()
            .single()
        if (appError) throw new Error("Failed to create D&B application: " + appError.message)
        app = newApp

        const { error: dataError } = await (supabase as any)
            .from('dnb_onboarding_data')
            .insert({ application_id: app.id })
        if (dataError) throw new Error("Failed to initialize D&B data: " + dataError.message)
    }

    const { data: dnbData } = await (supabase as any)
        .from('dnb_onboarding_data')
        .select('*')
        .eq('application_id', app.id)
        .single()

    return {
        application: app,
        data: dnbData || {},
        profile: {
            fullName: profile?.full_name || profile?.name || session.user.email?.split('@')[0] || '',
            email: profile?.email || session.user.email || '',
            phone: profile?.phone || profile?.phone_number || '',
        },
        org: {
            name: org.name || org.company_name || '',
            address: org.address || org.street_address || '',
            city: org.city || '',
            state: org.state || '',
            zip: org.zip || org.postal_code || '',
            website: org.website || org.company_website || '',
            phone: org.phone || org.company_phone || '',
            ein: org.ein || '',
        },
    }
}

export async function updateDNBData(applicationId: string, data: any) {
    const supabase = await createClient()
    const { error } = await (supabase as any)
        .from('dnb_onboarding_data')
        .update(data)
        .eq('application_id', applicationId)
    if (error) throw new Error("Failed to save D&B data: " + error.message)
    revalidatePath('/dnb-onboarding')
    return { success: true }
}

export async function submitDNBApplication(applicationId: string) {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error("Unauthorized")

    const { error } = await (supabase as any)
        .from('dnb_onboarding_applications')
        .update({ status: 'submitted' })
        .eq('id', applicationId)
    if (error) throw new Error("Failed to submit D&B application: " + error.message)
    revalidatePath('/dnb-onboarding')
    revalidatePath('/admin/dnb')
    return { success: true }
}
