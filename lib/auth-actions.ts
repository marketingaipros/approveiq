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

    // 1. Capture REAL data from the new form fields
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const companyName = formData.get('companyName') as string
    const ein = formData.get('ein') as string

    const { data: { user }, error } = await supabase.auth.signUp({
        email,
        password,
    })

    if (error) return redirect(`/login?error=${encodeURIComponent(error.message)}`)

    if (user) {
        try {
            const supabaseAdmin = createAdminClient() as any

            // 2. Create the Organization using the user's actual Company Name and EIN
            const { data: org, error: orgError } = await supabaseAdmin
                .from('organizations')
                .insert({
                    name: companyName,
                    data_cache: { ein: ein }, // This is the "Universal Data" for auto-population
                    subscription_tier: 'starter',
                    subscription_status: 'active'
                })
                .select().single()

            if (org && !orgError) {
                // 3. Create the Profile using the user's actual Full Name
                await supabaseAdmin.from('profiles').insert({
                    id: user.id,
                    org_id: org.id,
                    full_name: fullName,
                    role: 'Owner',
                    is_system_admin: false
                })
            }
        } catch (error) {
            console.error("Onboarding Error:", error)
        }
    }

    return redirect('/dashboard')
}