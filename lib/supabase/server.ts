import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'

import { getEnvVar } from '@/lib/utils/env'

export async function createClient() {
    const cookieStore = await cookies()

    return createServerClient<Database>(
        getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
        getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    )
}

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createAdminClient() {
    return createSupabaseClient<Database>(
        getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
        getEnvVar('SUPABASE_SERVICE_ROLE_KEY'),
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )
}
