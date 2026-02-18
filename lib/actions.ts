'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { BUREAU_TEMPLATES } from "./templates"

import { analyzeDocument } from "./ai/processor"

export async function updateChecklistItemStatus(itemId: string, status: string, fileUrl?: string, requirementTag?: string) {
    const supabase = await createClient()

    // 1. Update status and file URL
    const updateData: any = { status, updated_at: new Date().toISOString() }
    if (fileUrl) {
        updateData.file_url = fileUrl
        updateData.rejection_reason = null
    }

    const { data: itemData, error: itemError } = await (supabase as any)
        .from('checklist_items')
        .update(updateData)
        .eq('id', itemId)
        .select('program_id, title')
        .single()

    if (itemError || !itemData) {
        console.error("Failed to update item:", itemError)
        throw new Error("Failed to update status")
    }

    // 2. Perform AI Analysis if a file was uploaded and we have a tag
    if (fileUrl && (requirementTag || itemData.requirement_tag)) {
        const tag = requirementTag || itemData.requirement_tag
        console.log(`[AI] Triggering analysis for: ${itemData.title} (Tag: ${tag})`)

        // Simulating background extraction
        // In reality, we'd use a real File object or buffer here.
        // For the mock, we just signal that the extraction happened.
        if (tag === 'TAX_ID_VERIFICATION') {
            await updateSharedData('ein', '99-1234567')
        } else if (tag === 'SECURITY_AUDIT') {
            await updateSharedData('soc2_status', 'active')
        } else if (tag === 'SERVICE_AGREEMENT') {
            await updateSharedData('agreement_signed', 'true')
        }
    }

    // 3. Recalculate Program Progress
    await recalculateProgramProgress(itemData.program_id)

    // Trigger Audit Log
    await (supabase as any).from('audit_logs').insert({
        action: 'status_changed',
        metadata: { itemId, status, fileUrl, requirementTag },
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

export async function createProgramFromTemplate(templateId: string) {
    const supabase = await createClient()

    // 1. Find template
    const template = BUREAU_TEMPLATES.find(t => t.id === templateId)
    if (!template) throw new Error("Template not found")

    // 2. Get Org Context via Profile
    const { data: { session } } = await supabase.auth.getSession()
    const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('org_id')
        .eq('id', session?.user?.id || '')
        .single()

    if (!profile?.org_id) throw new Error("No organization context found for this user.")
    const orgId = profile.org_id

    // 3. Create Program
    const { data: program, error: progError } = await (supabase as any)
        .from('bureau_programs')
        .insert({
            org_id: orgId,
            title: template.name,
            bureau: template.bureau,
            status: 'active',
            progress_percent: 0
        })
        .select()
        .single()

    if (progError || !program) {
        console.error("Failed to create program:", progError)
        throw new Error("Failed to create program")
    }

    // 4. Create Checklist Items
    const items = template.items.map(item => ({
        program_id: program.id,
        title: item.title,
        description: item.description,
        source_attribution: item.source_attribution,
        required: item.required,
        requirement_tag: item.requirement_tag,
        status: 'missing'
    }))

    const { error: itemsError } = await (supabase as any)
        .from('checklist_items')
        .insert(items)

    if (itemsError) {
        console.error("Failed to create items:", itemsError)
        // Cleanup program? Or just let user retry. Insertion of items is more critical.
        throw new Error("Failed to populate checklist")
    }

    console.log("Created program from template:", program.id)

    revalidatePath('/programs')
    revalidatePath('/dashboard')

    // Redirect to the new program page
    redirect(`/programs/${program.id}`)
}

export async function updateSecuritySettings(mfaEnforced: boolean) {
    const supabase = await createClient()

    // 1. Get Org Context
    const { data: orgs } = await (supabase as any).from('organizations').select('id').limit(1)
    if (!orgs || orgs.length === 0) throw new Error("No organization found")
    const orgId = orgs[0].id

    // 2. Update Org
    const { error } = await (supabase as any)
        .from('organizations')
        .update({ mfa_enforced: mfaEnforced })
        .eq('id', orgId)

    if (error) {
        console.error("Failed to update security settings:", error)
        throw new Error("Failed to update security settings")
    }

    // 3. Log the change
    await (supabase as any).from('audit_logs').insert({
        org_id: orgId,
        action: 'security_policy_updated',
        metadata: { mfa_enforced: mfaEnforced },
        created_at: new Date().toISOString()
    })

    revalidatePath('/settings/security')
    revalidatePath('/dashboard')
    console.log("Updated security settings for org:", orgId)
}

export async function submitProgramForReview(programId: string) {
    const supabase = await createClient()

    // 1. Double check all required items are Approved or Pending
    const { data: items } = await (supabase as any)
        .from('checklist_items')
        .select('status, required')
        .eq('program_id', programId)

    const incomplete = items?.filter((i: any) => i.required && (i.status === 'missing' || i.status === 'needs_action'))

    if (incomplete && incomplete.length > 0) {
        throw new Error(`Cannot submit. ${incomplete.length} mandatory items are still missing or need action.`)
    }

    // 2. Update Program Status
    const { error } = await (supabase as any)
        .from('bureau_programs')
        .update({
            status: 'locked_for_review',
            attested_at: new Date().toISOString()
        })
        .eq('id', programId)

    if (error) {
        console.error("Failed to submit program:", error)
        throw new Error("Failed to submit program")
    }

    // 3. Log the audit event
    const { data: orgs } = await (supabase as any).from('organizations').select('id').limit(1)
    await (supabase as any).from('audit_logs').insert({
        org_id: orgs?.[0]?.id,
        action: 'program_submitted_for_review',
        metadata: { program_id: programId },
        created_at: new Date().toISOString()
    })

    console.log("Program submitted for review:", programId)
    revalidatePath(`/programs/${programId}`)
    revalidatePath('/programs')
}

export async function getSignedURL(path: string) {
    const supabase = await createClient()
    const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(path, 3600) // 60 mins

    if (error) throw error
    return data.signedUrl
}

export async function updateSharedData(key: string, value: string) {
    const supabase = await createClient()

    // Get current org
    const { data: org } = await supabase.from('organizations').select('id, data_cache').limit(1).single()
    if (!org) return

    const newCache = { ...((org as any).data_cache as any), [key]: value }

    await (supabase as any)
        .from('organizations')
        .update({ data_cache: newCache })
        .eq('id', (org as any).id)

    console.log(`Updated shared data: ${key}`)
    revalidatePath('/dashboard')
}

export async function getAuditLogsCSV() {
    const supabase = await createClient()

    // Fetch all logs (in a real app, we'd scope by org_id from the session)
    const { data: logs, error } = await (supabase as any)
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })

    if (error || !logs) {
        throw new Error("Failed to fetch audit logs for export")
    }

    // Simple CSV generation
    const headers = ["ID", "Action", "Org ID", "User ID", "Created At", "Metadata"]
    const rows = logs.map((log: any) => [
        log.id,
        log.action,
        log.org_id,
        log.user_id,
        log.created_at,
        JSON.stringify(log.metadata).replace(/"/g, '""')
    ])

    const csvContent = [
        headers.join(","),
        ...rows.map((row: any) => row.map((val: any) => `"${val}"`).join(","))
    ].join("\n")

    return csvContent
}
