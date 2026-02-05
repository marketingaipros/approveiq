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

    const { error } = await (supabase as any)
        .from('checklist_items')
        .update(updateData)
        .eq('id', itemId)

    if (error) {
        console.error("Failed to update item:", error)
        throw new Error("Failed to update status")
    }

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

    if (checkError || !program) {
        console.error("Program check failed:", checkError)
        throw new Error("Program not found or access denied")
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
