"use server"

import { createClient } from "@/lib/supabase/server"

export interface BureauRules {
    min_records?: number
    requires_dispute_doc?: boolean
    requires_lending_license?: boolean
    repayment_types?: string[]
    required_checklist_tags?: string[]
    [key: string]: unknown
}

export interface KnowledgeBaseEntry {
    id: string
    topic: string
    content: string
    bureau: string | null
    rules_json: BureauRules | null
    created_at: string
}

/**
 * Fetch all Knowledge Base entries with their structured rules.
 * Used by Templates (for dynamic generation) and AI Agent (for compliance context).
 */
export async function getAllBureauRules(): Promise<KnowledgeBaseEntry[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('knowledge_base')
        .select('id, topic, content, bureau, rules_json, created_at')
        .order('bureau', { ascending: true })

    if (error) {
        console.error("Failed to fetch knowledge base rules:", error)
        return []
    }

    return (data || []) as KnowledgeBaseEntry[]
}

/**
 * Fetch a single bureau's structured rules by bureau slug (e.g. 'equifax').
 * Used by the AI validation endpoint.
 */
export async function getKnowledgeBaseRules(bureau: string): Promise<BureauRules | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('knowledge_base')
        .select('rules_json')
        .eq('bureau', bureau.toLowerCase())
        .limit(1)
        .maybeSingle()

    if (error || !data) return null
    return (data as any).rules_json as BureauRules | null
}
