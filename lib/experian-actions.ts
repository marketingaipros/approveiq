"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

/** Get or create an Experian onboarding application for the current org */
export async function getOrCreateExperianApplication() {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error("Unauthorized")

    // Fetch profile + org data (shared fields auto-populate from here)
    const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('org_id, full_name, email, phone')
        .eq('id', session.user.id)
        .single()

    if (!profile?.org_id) throw new Error("No organization context found.")

    const { data: org } = await (supabase as any)
        .from('organizations')
        .select('name, address, city, state, zip, website, phone')
        .eq('id', profile.org_id)
        .single()

    // Check for existing application
    let { data: app } = await (supabase as any)
        .from('experian_onboarding_applications')
        .select('*')
        .eq('org_id', profile.org_id)
        .maybeSingle()

    if (!app) {
        const { data: newApp, error: appError } = await (supabase as any)
            .from('experian_onboarding_applications')
            .insert({ org_id: profile.org_id, status: 'draft' })
            .select()
            .single()

        if (appError) throw new Error("Failed to create Experian application")
        app = newApp

        await (supabase as any)
            .from('experian_onboarding_data')
            .insert({ application_id: app.id })
    }

    const { data: experianData } = await (supabase as any)
        .from('experian_onboarding_data')
        .select('*')
        .eq('application_id', app.id)
        .single()

    return {
        application: app,
        data: experianData || {},
        profile: {
            fullName: profile.full_name || '',
            email: profile.email || session.user.email || '',
            phone: profile.phone || '',
        },
        org: org || {}
    }
}

/** Auto-save Experian bureau-specific fields */
export async function updateExperianData(applicationId: string, data: any) {
    const supabase = await createClient()

    const { error } = await (supabase as any)
        .from('experian_onboarding_data')
        .update(data)
        .eq('application_id', applicationId)

    if (error) throw new Error("Failed to save Experian data")

    revalidatePath('/experian-onboarding')
    return { success: true }
}

/** Submit application for internal review */
export async function submitExperianApplication(applicationId: string) {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error("Unauthorized")

    const { error } = await (supabase as any)
        .from('experian_onboarding_applications')
        .update({ status: 'submitted' })
        .eq('id', applicationId)

    if (error) throw new Error("Failed to submit Experian application")

    revalidatePath('/experian-onboarding')
    revalidatePath('/admin/experian')
    return { success: true }
}

/**
 * uploadBureauGuidelines — Seeds the knowledge_base with Experian guidelines
 * and tags them EXPERIAN_MEMBERSHIP_APP for AI Brain access.
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

    // Fetch all KB entries for this bureau
    const { data: kbEntries } = await (supabase as any)
        .from('knowledge_base')
        .select('id, topic, content, rules_json')
        .eq('bureau', bureau.toLowerCase())

    if (!kbEntries?.length) throw new Error(`No Knowledge Base entries found for bureau: ${bureau}`)

    // Create or replace the template
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
        .single()

    if (tplError) throw new Error("Failed to create template")

    // Create one checklist item per KB entry
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

    if (itemsError) throw new Error("Failed to populate template items")

    revalidatePath('/templates')
    return { success: true, templateId: template.id, itemCount: items.length }
}
