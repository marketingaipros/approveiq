"use server"

import { createClient, createAdminClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return redirect(`/login?error=${encodeURIComponent(error.message)}`)
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

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { data: { user, session }, error } = await supabase.auth.signUp({
        email,
        password,
    })

    if (error) {
        return redirect(`/login?error=${encodeURIComponent(error.message)}`)
    }

    if (user) {
        try {
            // Essential Onboarding: Create Org & Profile using Service Role (Admin)
            // to bypass RLS policies for new user setup
            const supabaseAdmin = createAdminClient() as any

            const { data: org, error: orgError } = await supabaseAdmin
                .from('organizations')
                .insert({
                    name: 'Miller Incorporation',
                    subscription_tier: 'starter',
                    subscription_status: 'active'
                })
                .select()
                .single()

            if (org && !orgError) {
                await supabaseAdmin.from('profiles').insert({
                    id: user.id,
                    org_id: org.id,
                    full_name: 'Chris Miller',
                    role: 'Owner',
                    is_system_admin: false
                })
            }
        } catch (error) {
            console.error("Onboarding Error: Admin client creation failed (likely missing SUPABASE_SERVICE_ROLE_KEY)", error)
            // Continue to dashboard anyway so user isn't stuck
        }
    }

    // Bypass email verification notice for demo flow
    return redirect('/dashboard')
}
