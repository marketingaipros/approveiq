"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

/**
 * RESTRICTED ADMIN ACTIONS
 * All functions perform strict RBAC checks server-side.
 */

async function verifySystemAdmin() {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error("Unauthorized")

    const { data: profileData } = await supabase
        .from('profiles')
        .select('is_system_admin')
        .eq('id', session.user.id)
        .single()
    const profile: any = profileData;

    if (!profile?.is_system_admin) {
        throw new Error("DANGER: Unauthorized administrative attempt detected.")
    }

    return session.user.id
}

export async function toggleClientAccess(orgId: string, suspend: boolean) {
    const adminId = await verifySystemAdmin()
    const supabase = await createClient()

    // Update organization status
    const { error } = await (supabase as any)
        .from('organizations')
        .update({ subscription_status: suspend ? 'suspended' : 'active' })
        .eq('id', orgId)

    if (error) throw error

    // Log the action
    await (supabase as any).from('audit_logs').insert({
        action: suspend ? 'client_suspended' : 'client_activated',
        user_id: adminId,
        metadata: { org_id: orgId, target: 'organization_status' },
        created_at: new Date().toISOString()
    })

    revalidatePath('/admin/clients')
    console.log(`Admin ${adminId} ${suspend ? 'suspended' : 'activated'} client ${orgId}`)
}

export async function updateBureauProgramRule(programId: string, updates: any) {
    await verifySystemAdmin()
    const supabase = await createClient()

    // This would ideally update a global template, but for now updates a specific instance
    const { error } = await (supabase as any)
        .from('bureau_programs')
        .update(updates)
        .eq('id', programId)

    if (error) throw error
    revalidatePath('/admin/programs')
}
