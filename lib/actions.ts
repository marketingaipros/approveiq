'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function updateChecklistItemStatus(itemId: string, status: string, fileUrl?: string) {
    const supabase = await createClient()

    // update status
    const updateData: any = { status, updated_at: new Date().toISOString() }
    if (fileUrl) {
        updateData.file_url = fileUrl
        // If uploading, clear rejection reason
        updateData.rejection_reason = null
    }

    const { data: itemData, error: itemError } = await (supabase as any)
        .from('checklist_items')
        .update(updateData)
        .eq('id', itemId)
        .select('program_id')
        .single()

    if (itemError || !itemData) {
        console.error("Failed to update item:", itemError)
        throw new Error("Failed to update status")
    }

    // 4. Recalculate Program Progress
    await recalculateProgramProgress(itemData.program_id)

    // Trigger Audit Log (Mock for now, would be a DB trigger ideally)
    await (supabase as any).from('audit_logs').insert({
        action: 'status_changed',
        metadata: { itemId, status, fileUrl },
        created_at: new Date().toISOString()
    })

    revalidatePath('/programs/[id]', 'page')
    console.log("Updated checklist item status for:", itemId)
}

export async function seedProgramRequirements(programId: string) {
    const supabase = await createClient()

    console.log("Seeding started for ID:", programId)

    // Verify program exists
    const { data: program, error: checkError } = await (supabase as any)
        .from('bureau_programs')
        .select('id')
        .eq('id', programId)
        .single()

    const { data: existingItems } = await (supabase as any)
        .from('checklist_items')
        .select('id')
        .eq('program_id', programId)

    if (existingItems && existingItems.length > 0) {
        console.log("Checklist already populated for:", programId)
        return
    }

    const items = [
        {
            program_id: programId,
            title: 'Metro 2® File Validation',
            description: 'Upload a sample file passing the Metro 2® standard format checks.',
            source_attribution: 'Source: CDIA Metro 2® Format 2024',
            status: 'needs_action',
            required: true,
            rejection_reason: 'File failed Record 426 validation check.'
        },
        {
            program_id: programId,
            title: 'Data Subscriber Agreement (DSA)',
            description: 'Upload the signed DSA header page.',
            source_attribution: 'Source: Experian Legal',
            status: 'missing',
            required: true,
            rejection_reason: null
        },
        {
            program_id: programId,
            title: 'Security Audit Attestation',
            description: 'Upload SOC 2 Type 2 or equivalent attestation.',
            source_attribution: 'Source: Experian Security Standards',
            status: 'pending_review',
            required: true,
            rejection_reason: null
        }
    ]

    const { error } = await (supabase as any)
        .from('checklist_items')
        .insert(items)

    if (error) {
        console.error("Failed to seed items:", error)
        throw new Error(`Failed to seed items: ${error.message}`)
    }

    console.log("Successfully seeded items for program:", programId)

    revalidatePath(`/programs/${programId}`)
    revalidatePath('/dashboard')
}

/**
 * Recalculates the progress_percent for a program and the overall bureau_readiness_score for the organization.
 */
export async function recalculateProgramProgress(programId: string) {
    const supabase = await createClient()

    // 1. Get all items for this program
    const { data: items } = await (supabase as any)
        .from('checklist_items')
        .select('status')
        .eq('program_id', programId)

    if (!items || items.length === 0) return

    // 2. Calculate percentage
    const approvedCount = items.filter((i: any) => i.status === 'approved').length
    const progressPercent = Math.round((approvedCount / items.length) * 100)

    // 3. Update Program
    const { data: program, error: progError } = await (supabase as any)
        .from('bureau_programs')
        .update({ progress_percent: progressPercent })
        .eq('id', programId)
        .select('org_id')
        .single()

    if (progError || !program) {
        console.error("Failed to update program progress:", progError)
        return
    }

    // 4. Update Org Readiness Score (Average of all programs)
    const { data: programs } = await (supabase as any)
        .from('bureau_programs')
        .select('progress_percent')
        .eq('org_id', program.org_id)

    if (programs && programs.length > 0) {
        const totalProgress = programs.reduce((acc: number, p: any) => acc + (p.progress_percent || 0), 0)
        const avgReadiness = Math.round(totalProgress / programs.length)

        await (supabase as any)
            .from('organizations')
            .update({ bureau_readiness_score: avgReadiness })
            .eq('id', program.org_id)
    }

    revalidatePath(`/programs/${programId}`)
    revalidatePath('/dashboard')
}
