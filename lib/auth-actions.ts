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

    const { data: { user }, error: authError } = await supabase.auth.signUp({
        email,
        password,
    })

    if (authError) return { error: authError.message }

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
                // 2. Create the Profile
                const { error: profileError } = await supabaseAdmin.from('profiles').insert({
                    id: user.id,
                    org_id: org.id,
                    full_name: fullName,
                    role: 'Owner',
                    is_system_admin: false
                })

                if (profileError) throw profileError
            }
        } catch (error) {
            console.error("Onboarding Error:", error)
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
            // 2. Create the Profile
            const { error: profileError } = await supabaseAdmin.from('profiles').insert({
                id: session.user.id,
                org_id: org.id,
                full_name: fullName,
                role: 'Owner',
                is_system_admin: false
            })

            if (profileError) throw profileError
        }
    } catch (error) {
        console.error("Onboarding Error:", error)
        return { error: "Failed to complete onboarding. Please try again." }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}