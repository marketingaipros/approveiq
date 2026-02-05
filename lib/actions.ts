'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

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
}
