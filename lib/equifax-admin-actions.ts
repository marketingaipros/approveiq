"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { getUserAndOrg } from "./actions"

/**
 * Get all Equifax onboarding applications that are ready for admin review.
 * Only fetches draft (100% complete) and manual_review_required cases.
 */
export async function getPendingEquifaxApplications() {
    const supabase = await createClient()
    
    // Auth check - simulate admin restriction
    const { user } = await getUserAndOrg()
    if (!user) {
        throw new Error("Unauthorized")
    }
    
    // In a real app we'd also check if the user is a system admin:
    // const { data: profile } = await supabase.from('profiles').select('is_system_admin').eq('id', user.id).single()
    // if (!profile?.is_system_admin) throw new Error("Unauthorized Admin Access")

    // Fetch applications and their joined data
    const { data: applications, error: appError } = await supabase
        .from('equifax_onboarding_applications')
        .select(`
            *,
            organizations (
                name
            ),
            equifax_onboarding_data (*)
        `)
        .in('status', ['draft', 'manual_review_required'])
        .order('created_at', { ascending: false })

    if (appError) {
        console.error("Error fetching pending equifax applications:", appError)
        throw new Error("Failed to load applications")
    }

    // Filter down to applications where the data portion is 100% complete
    // Some logic could be pushed to the DB logic, but since we calculate completion on the fly:
    const readyApplications = (applications || []).filter((app: any) => {
        const data = app.equifax_onboarding_data?.[0];
        if (!data) return false;

        const isCompleted = data.company_name_completed && 
            data.company_address_completed && 
            data.company_phone_completed && 
            data.company_website_completed && 
            data.industry_completed && 
            data.repayment_terms_completed && 
            data.loan_ranges_completed && 
            data.estimated_records_completed && 
            data.dispute_procedures_completed && 
            data.lending_license_completed;

        // Either it's fully complete, or it's flagged for manual review which overrules the draft status
        return isCompleted || app.status === 'manual_review_required';
    });

    return readyApplications
}

/**
 * Verify an Equifax application and grant a member number.
 * Triggers transition to "Task Group 2: Data & Transmission Setup".
 */
export async function verifyEquifaxApplication(applicationId: string, memberNumber: string, isApproved: boolean) {
    const supabase = await createClient()
    
    const { user } = await getUserAndOrg()
    if (!user) throw new Error("Unauthorized")

    const newStatus = isApproved ? 'approved' : 'rejected'

    const { error } = await (supabase as any)
        .from('equifax_onboarding_applications')
        .update({
            status: newStatus,
            equifax_member_number: memberNumber || null,
        })
        .eq('id', applicationId)

    if (error) {
        console.error("Error verifying application:", error)
        throw new Error("Update failed")
    }

    revalidatePath('/admin/equifax')
    return { success: true, status: newStatus }
}

/**
 * Update the transmission type for an approved Equifax application.
 * Part of "Task Group 2: Data & Transmission Setup".
 */
export async function updateTransmissionSetup(applicationId: string, transmissionType: 'metro_2' | 'cfn', adminNotes?: string) {
    const supabase = await createClient()
    
    const { user } = await getUserAndOrg()
    if (!user) throw new Error("Unauthorized")

    const { error } = await (supabase as any)
        .from('equifax_onboarding_applications')
        .update({
            transmission_type: transmissionType,
            transmission_setup_completed: true,
            admin_notes: adminNotes || null,
        })
        .eq('id', applicationId)

    if (error) {
        console.error("Error updating transmission setup:", error)
        throw new Error("Update failed")
    }

    revalidatePath('/admin/equifax')
    return { success: true }
}
