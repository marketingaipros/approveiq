"use server"

import { createClient, createAdminClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function login(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    return redirect('/dashboard')
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    return redirect('/login')
}

export async function signup(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const companyName = formData.get('companyName') as string
    const ein = formData.get('ein') as string

    const { data: { user, session }, error: authError } = await supabase.auth.signUp({
        email,
        password,
    })

    if (authError) return { error: authError.message }

    if (!session && user) {
        // This usually means email confirmation is required.
        // We'll still try to create their org/profile in the background using their ID
        try {
            const supabaseAdmin = createAdminClient() as any
            const { data: org, error: orgError } = await supabaseAdmin
                .from('organizations')
                .insert({
                    name: companyName,
                    data_cache: { ein: ein },
                    subscription_tier: 'starter',
                    subscription_status: 'active'
                })
                .select()
                .maybeSingle()

            if (!orgError && org) {
                await supabaseAdmin.from('profiles').update({
                    org_id: org.id,
                    full_name: fullName,
                    role: 'Owner'
                }).eq('id', user.id)
            }
        } catch (e) {
            console.error("Background onboarding failure:", e)
        }

        return { 
            message: "Authentication successful. Please check your email to verify your account before logging in." 
        }
    }

    if (user) {
        try {
            const supabaseAdmin = createAdminClient() as any

            // 1. Create the Organization
            const { data: org, error: orgError } = await supabaseAdmin
                .from('organizations')
                .insert({
                    name: companyName,
                    data_cache: { ein: ein },
                    subscription_tier: 'starter',
                    subscription_status: 'active'
                })
                .select()
                .maybeSingle()

            if (orgError) throw orgError

            if (org) {
                // 2. Update the Profile (inserted by trigger handle_new_user)
                const { error: profileError } = await supabaseAdmin.from('profiles').update({
                    org_id: org.id,
                    full_name: fullName,
                    role: 'Owner'
                }).eq('id', user.id)

                if (profileError) throw profileError
            }
        } catch (error) {
            console.error("Onboarding Error:", error)
            // Even if onboarding fails, they are signed up with Supabase. 
            // We shouldn't return a fatal error if the auth part succeeded.
        }
    }

    revalidatePath('/', 'layout')
    return redirect('/dashboard')
}

export async function completeOnboarding(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
        return redirect('/login')
    }

    const fullName = formData.get('fullName') as string
    const companyName = formData.get('companyName') as string
    const ein = formData.get('ein') as string

    try {
        const supabaseAdmin = createAdminClient() as any

        // Check if user already has an org
        const { data: existingProfile } = await supabaseAdmin
            .from('profiles')
            .select('org_id')
            .eq('id', session.user.id)
            .maybeSingle()

        let orgId = (existingProfile as any)?.org_id

        if (!orgId) {
            // 1. Create the Organization if it doesn't exist
            const { data: org, error: orgError } = await supabaseAdmin
                .from('organizations')
                .insert({
                    name: companyName,
                    data_cache: { ein: ein },
                    subscription_tier: 'starter',
                    subscription_status: 'active'
                })
                .select()
                .maybeSingle()

            if (orgError) throw orgError
            orgId = org?.id
        } else {
            // 2. Update existing organization
            const { error: orgUpdateError } = await supabaseAdmin
                .from('organizations')
                .update({
                    name: companyName,
                    data_cache: { ein: ein }
                })
                .eq('id', orgId)

            if (orgUpdateError) throw orgUpdateError
        }

        if (orgId) {
            // 3. Update the Profile (it always exists due to trigger)
            const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .update({
                    org_id: orgId,
                    full_name: fullName,
                    role: 'Owner'
                })
                .eq('id', session.user.id)

            if (profileError) throw profileError
        }
    } catch (error: any) {
        if (error.message?.includes('NEXT_REDIRECT')) {
            throw error
        }
        console.error("DEBUG: Onboarding Error Detailed:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
        })
        return { error: `Onboarding failed: ${error.message || 'Unknown server error'}. Please contact support.` }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}