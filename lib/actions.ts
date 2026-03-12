'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { BUREAU_TEMPLATES } from "./templates"

import { analyzeDocument } from "./ai/processor"

export async function getUserAndOrg() {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return { user: null, profile: null }
    
    // Fallback profile if table doesn't exist yet, but let's try to query
    const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle()
        
    return { user: session.user, profile }
}

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

    // 1. Find template (Check DB first, fallback to hardcoded)
    let dbItems = [];
    let dbTemplate = null;

    const { data: foundTemplate } = await (supabase as any)
        .from('bureau_templates')
        .select('*')
        .eq('id', templateId)
        .maybeSingle()

    if (foundTemplate) {
        dbTemplate = foundTemplate;
        const { data: foundItems } = await (supabase as any)
            .from('template_items')
            .select('*')
            .eq('template_id', templateId)
        dbItems = foundItems || [];
    }
    
    // Fallback to offline templates if not found in DB
    const templateName = dbTemplate?.name || BUREAU_TEMPLATES.find(t => t.id === templateId)?.name;
    const templateBureau = dbTemplate?.bureau || BUREAU_TEMPLATES.find(t => t.id === templateId)?.bureau;

    if (!templateName) throw new Error("Template not found")

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
            title: templateName,
            bureau: templateBureau,
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
    let itemsToInsert = [];
    if (dbTemplate && dbItems.length > 0) {
        itemsToInsert = dbItems.map((item: any) => ({
            program_id: program.id,
            title: item.title,
            description: item.description,
            required: item.required,
            requirement_tag: item.requirement_tag,
            status: 'missing'
        }))
    } else {
        const offlineTemplate = BUREAU_TEMPLATES.find(t => t.id === templateId);
        if (offlineTemplate) {
            itemsToInsert = offlineTemplate.items.map(item => ({
                program_id: program.id,
                title: item.title,
                description: item.description,
                source_attribution: item.source_attribution,
                required: item.required,
                requirement_tag: item.requirement_tag,
                status: 'missing'
            }))
        }
    }

    const { error: itemsError } = await (supabase as any)
        .from('checklist_items')
        .insert(itemsToInsert)

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

export async function uploadBureauGuidelines(formData: FormData) {
    const supabase = await createClient()
    const file = formData.get('file') as File | null
    const topic = formData.get('topic') as string
    const bureau = formData.get('bureau') as string

    if (!file || !topic) throw new Error("Missing required fields")

    // 1. Verify admin status
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error("Unauthorized")

    const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('is_system_admin')
        .eq('id', session.user.id)
        .single()

    if (!profile?.is_system_admin) throw new Error("Unauthorized")

    // 2. Upload to storage
    const fileName = `guidelines/${Date.now()}-${file.name}`
    const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file)

    if (uploadError) {
        console.error("Upload failed", uploadError)
        throw new Error("Failed to upload document")
    }

    // 3. Simulate AI Extraction
    console.log(`[AI] Extracting guidelines from ${file.name}...`)
    // Mock processing delay
    // Note: Can't use await new Promise here easily if not in an async context, but this is an async function
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const mockContent = `## Extracted Guidelines: ${topic}
    
This is an automatically generated extraction from the uploaded document: **${file.name}**.

### Key Requirements
1. The organization must adhere to standard data reporting formats.
2. An annual audit is required to maintain compliance.
3. Secure transmission protocols (SFTP) must be utilized for all batch transfers.

### References
- Section 4.2: Data Integrity
- Appendix B: Security Standards
`

    // 4. Insert into Knowledge Base
    const { error: dbError } = await (supabase as any).from('knowledge_base').insert({
        topic,
        bureau: bureau || 'General',
        content: mockContent,
    })

    if (dbError) {
        console.error("DB Error", dbError)
        throw new Error("Failed to save to knowledge base")
    }

    // 5. Audit Log
    const { data: orgs } = await (supabase as any).from('organizations').select('id').limit(1)
    await (supabase as any).from('audit_logs').insert({
        org_id: orgs?.[0]?.id,
        user_id: session.user.id,
        action: 'knowledge_base_guideline_uploaded',
        metadata: { topic, bureau, file_name: file.name },
    })

    revalidatePath('/admin/knowledge')
    revalidatePath('/knowledge')
}

export async function generateTemplateFromGuidelines(formData: FormData) {
    const supabase = await createClient()
    const file = formData.get('file') as File | null
    const title = formData.get('title') as string
    const bureau = formData.get('bureau') as string

    if (!file || !title) throw new Error("Missing required fields")

    // 1. Verify admin status
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error("Unauthorized")

    const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('is_system_admin')
        .eq('id', session.user.id)
        .single()

    if (!profile?.is_system_admin) throw new Error("Unauthorized")

    // 2. Upload to storage (optional for template extraction, but good for records)
    const fileName = `guidelines/${Date.now()}-${file.name}`
    await supabase.storage.from('documents').upload(fileName, file)

    // 3. Simulate AI Extraction
    console.log(`[AI] Extracting template requirements from ${file.name}...`)
    // Mock processing delay
    // Note: Can't use await new Promise here easily if not in an async context, but this is an async function
    await new Promise(resolve => setTimeout(resolve, 2500))
    
    // Create base template
    const { data: template, error: templateError } = await (supabase as any)
        .from('bureau_templates')
        .insert({
            name: title,
            bureau: bureau || 'general',
            description: `Generated from ${file.name}`
        })
        .select()
        .single()

    if (templateError || !template) {
        console.error("Template Gen Error", templateError)
        throw new Error("Failed to create template base")
    }

    // Insert extracted AI items
    const aiExtractedItems = [
        {
            template_id: template.id,
            title: 'Service Agreement',
            description: 'Signed master agreement for data reporting.',
            required: true,
            requirement_tag: 'SERVICE_AGREEMENT',
            order_index: 1
        },
        {
            template_id: template.id,
            title: 'Validation File Upload',
            description: 'Submit a sample file passing standard format checks extracted from the guidelines.',
            required: true,
            requirement_tag: 'METRO2_VALIDATION',
            order_index: 2
        },
        {
            template_id: template.id,
            title: 'Compliance Sign-off',
            description: 'Executive attestation of adherence to subsection 4.2 of the generated guidelines.',
            required: true,
            requirement_tag: 'ATTESTATION',
            order_index: 3
        }
    ]

    const { error: itemsError } = await (supabase as any)
        .from('template_items')
        .insert(aiExtractedItems)

    if (itemsError) {
        console.error("Items Gen Error", itemsError)
        throw new Error("Failed to create template items")
    }

    // 4. Audit Log
    const { data: orgs } = await (supabase as any).from('organizations').select('id').limit(1)
    await (supabase as any).from('audit_logs').insert({
        org_id: orgs?.[0]?.id,
        user_id: session.user.id,
        action: 'ai_template_generated',
        metadata: { template_name: title, bureau, file_name: file.name },
    })

    revalidatePath('/admin/programs')
}
