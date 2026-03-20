"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

/** Get or create an Experian onboarding application for the current org */
export async function getOrCreateExperianApplication() {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) throw new Error("Unauthorized")

    // 1. Get the user profile to find their assigned org_id
    const { data: profile, error: pError } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle()

    if (pError || !profile) throw new Error("No user profile found.")
    if (!profile.org_id) throw new Error("No organization assigned to this user.")

    // 2. Get the specific organization
    const { data: org, error: orgError } = await (supabase as any)
        .from('organizations')
        .select('*')
        .eq('id', profile.org_id)
        .maybeSingle()

    if (orgError || !org) throw new Error("Organization context not found.")

    // 3. Check for existing application
    let { data: app } = await (supabase as any)
        .from('experian_onboarding_applications')
        .select('*')
        .eq('org_id', org.id)
        .maybeSingle()

    if (!app) {
        const { data: newApp, error: appError } = await (supabase as any)
            .from('experian_onboarding_applications')
            .insert({ org_id: org.id, status: 'draft' })
            .select()
            .maybeSingle()

        if (appError) throw new Error("Failed to create Experian application: " + appError.message)
        app = newApp

        let ownershipType = null
        const nameLower = org.name?.toLowerCase() || ""
        if (nameLower.includes("llc")) ownershipType = "LLC (Multi-Member)"
        else if (nameLower.includes("inc") || nameLower.includes("corp")) ownershipType = "C-Corporation"

        const { error: dataError } = await (supabase as any)
            .from('experian_onboarding_data')
            .insert({
                application_id: app.id,
                ownership_type: ownershipType,
                dba_name: org.name
            })

        if (dataError) throw new Error("Failed to initialize Experian data: " + dataError.message)
    }

    // 4. Fetch the data row
    const { data: experianData } = await (supabase as any)
        .from('experian_onboarding_data')
        .select('*')
        .eq('application_id', app.id)
        .maybeSingle()

    // Build profile shape — gracefully handle varying column names
    const profileData = {
        fullName: profile?.full_name || profile?.name || session.user.email?.split('@')[0] || '',
        email: profile?.email || session.user.email || '',
        phone: profile?.phone || profile?.phone_number || '',
    }

    // Build org shape — gracefully handle varying column names
    const orgData = {
        name: org.name || org.company_name || org.data_cache?.company_name || org.data_cache?.name || '',
        address: org.address || org.street_address || org.data_cache?.address || org.data_cache?.street_address || '',
        city: org.city || org.data_cache?.city || '',
        state: org.state || org.data_cache?.state || '',
        zip: org.zip || org.postal_code || org.data_cache?.zip || org.data_cache?.postal_code || '',
        website: org.website || org.company_website || org.data_cache?.website || '',
        phone: org.phone || org.company_phone || org.data_cache?.phone || '',
        ein: org.ein || org.data_cache?.ein || '',
        industry: org.industry || org.data_cache?.industry || '',
    }

    return {
        application: app,
        data: experianData || {},
        profile: profileData,
        org: orgData,
    }
}

/** Auto-save Experian bureau-specific fields */
export async function updateExperianData(applicationId: string, data: any) {
    const supabase = await createClient()

    const { error } = await (supabase as any)
        .from('experian_onboarding_data')
        .update(data)
        .eq('application_id', applicationId)

    if (error) throw new Error("Failed to save Experian data: " + error.message)

    revalidatePath('/experian-onboarding')
    return { success: true }
}

/** Submit application for internal review */
export async function submitExperianApplication(applicationId: string) {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error("Unauthorized")

    // 1. Get the app to find org_id
    const { data: app } = await (supabase as any)
        .from('experian_onboarding_applications')
        .select('org_id')
        .eq('id', applicationId)
        .maybeSingle()
    
    if (!app) throw new Error("Application not found")

    // 2. Update the onboarding status
    const { error } = await (supabase as any)
        .from('experian_onboarding_applications')
        .update({ status: 'submitted' })
        .eq('id', applicationId)

    if (error) throw new Error("Failed to submit Experian application: " + error.message)

    // 3. Sync to main bureau_applications table for Dashboard visibility
    await (supabase as any)
        .from('bureau_applications')
        .upsert({
            org_id: app.org_id,
            bureau_name: 'Experian',
            status: 'manual_review_required', // Shows as "Pending" in dashboard
            updated_at: new Date().toISOString()
        }, { onConflict: 'org_id, bureau_name' })

    revalidatePath('/experian-onboarding')
    revalidatePath('/admin/experian')
    revalidatePath('/dashboard')
    return { success: true }
}

/**
 * uploadBureauGuidelines — Seeds the knowledge_base with bureau guidelines
 * tagged for AI Brain access.
 */
export async function uploadBureauGuidelines(bureau: string, guidelines: { topic: string; content: string; rules_json?: any }[]) {
    const supabase = await createClient()

    for (const item of guidelines) {
        await (supabase as any)
            .from('knowledge_base')
            .upsert({
                bureau: bureau.toLowerCase(),
                topic: item.topic,
                content: item.content,
                rules_json: item.rules_json || null,
            }, { onConflict: 'bureau,topic' })
    }

    revalidatePath('/knowledge')
    return { success: true, seeded: guidelines.length }
}

/**
 * generateTemplateFromGuidelines — Creates a bureau_template + checklist items
 * from Knowledge Base entries, tagged with the given requirement_tag.
 */
export async function generateTemplateFromGuidelines(bureau: string, requirementTag: string) {
    const supabase = await createClient()

    const { data: kbEntries } = await (supabase as any)
        .from('knowledge_base')
        .select('id, topic, content, rules_json')
        .eq('bureau', bureau.toLowerCase())

    if (!kbEntries?.length) throw new Error(`No Knowledge Base entries found for bureau: ${bureau}`)

    const templateName = `${bureau} Membership Application`
    await (supabase as any)
        .from('bureau_templates')
        .delete()
        .eq('bureau', bureau.toLowerCase())
        .eq('name', templateName)

    const { data: template, error: tplError } = await (supabase as any)
        .from('bureau_templates')
        .insert({ name: templateName, bureau: bureau.toLowerCase(), description: `Auto-generated from ${bureau} Knowledge Base` })
        .select()
        .maybeSingle()

    if (tplError) throw new Error("Failed to create template: " + tplError.message)

    const items = kbEntries.map((entry: any, i: number) => ({
        template_id: template.id,
        title: entry.topic,
        description: entry.content?.split('\n').find((l: string) => l && !l.startsWith('#'))?.replace(/\*\*/g, '') || '',
        required: true,
        requirement_tag: requirementTag,
        order_index: i + 1,
    }))

    const { error: itemsError } = await (supabase as any)
        .from('template_items')
        .insert(items)

    if (itemsError) throw new Error("Failed to populate template items: " + itemsError.message)

    revalidatePath('/templates')
    return { success: true, templateId: template.id, itemCount: items.length }
}
