"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateEquifaxData(applicationId: string, data: any) {
    const supabase = await createClient()

    const { error } = await (supabase as any)
        .from('equifax_onboarding_data')
        .update(data)
        .eq('application_id', applicationId)

    if (error) {
        console.error("Failed to update equifax data:", error)
        throw new Error("Failed to save data")
    }

    revalidatePath('/equifax-onboarding')
    return { success: true }
}

export async function getOrCreateEquifaxApplication() {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) throw new Error("Unauthorized")

    const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('org_id')
        .eq('id', session.user.id)
        .maybeSingle()

    if (!profile?.org_id) throw new Error("No organization context found.")

    // 1. Check for existing app
    let { data: app } = await (supabase as any)
        .from('equifax_onboarding_applications')
        .select('*')
        .eq('org_id', profile.org_id)
        .maybeSingle()

    if (!app) {
        // Create new app
        const { data: newApp, error: appError } = await (supabase as any)
            .from('equifax_onboarding_applications')
            .insert({ org_id: profile.org_id, status: 'draft' })
            .select()
            .maybeSingle()

        if (appError) throw new Error("Failed to create application")
        app = newApp

        // Initialize data row
        const { error: dataError } = await (supabase as any)
            .from('equifax_onboarding_data')
            .insert({ application_id: app.id })

        if (dataError) throw new Error("Failed to initialize data")
    }

    // 2. Fetch data
    const { data: equifaxData } = await (supabase as any)
        .from('equifax_onboarding_data')
        .select('*')
        .eq('application_id', app.id)
        .maybeSingle()

    return { application: app, data: equifaxData || {} }
}

export async function submitEquifaxApplication(applicationId: string) {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error("Unauthorized")

    const { error } = await (supabase as any)
        .from('equifax_onboarding_applications')
        .update({ status: 'submitted' })
        .eq('id', applicationId)

    if (error) {
        console.error("Failed to submit application:", error)
        throw new Error("Failed to submit application")
    }

    revalidatePath('/equifax-onboarding')
    revalidatePath('/admin/equifax')
    return { success: true }
}
