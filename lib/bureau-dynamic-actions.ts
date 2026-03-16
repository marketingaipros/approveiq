"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { getUserAndOrg } from "./actions"
import { DynamicRequirement } from "@/components/bureau/admin/requirement-builder"

// Fetch the Master Profile
export async function getMasterProfile() {
    const supabase = await createClient()
    const { user, profile } = await getUserAndOrg()
    if (!user || !profile?.org_id) return null

    const { data } = await supabase
        .from('bureau_master_profiles')
        .select('*')
        .eq('org_id', profile.org_id)
        .single()
        
    return data
}

// Save to Master Profile
export async function saveMasterProfile(data: any) {
    const supabase = await createClient()
    const { user, profile } = await getUserAndOrg()
    if (!user || !profile?.org_id) throw new Error("Unauthorized")

    const { error } = await supabase
        .from('bureau_master_profiles')
        .upsert({
            org_id: profile.org_id,
            ...data
        })

    if (error) throw error
    revalidatePath('/multi-bureau')
}

// Fetch applications active for this org
export async function getActiveBureaus() {
    const supabase = await createClient()
    const { user, profile } = await getUserAndOrg()
    if (!user || !profile?.org_id) return []

    const { data } = await supabase
        .from('bureau_applications')
        .select('*, dynamic_answers(*)')
        .eq('org_id', profile.org_id)

    return data || []
}

// Fetch all available bureaus from the DB
export async function getAvailableBureaus() {
    const supabase = await createClient()
    const { user } = await getUserAndOrg()
    if (!user) return []

    const { data } = await supabase
        .from('bureaus')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })

    return data || []
}

// Opt-in to a new bureau
export async function addBureau(bureauName: string) {
    const supabase = await createClient()
    const { user, profile } = await getUserAndOrg()
    if (!user || !profile?.org_id) throw new Error("Unauthorized")

    const { error } = await (supabase as any)
        .from('bureau_applications')
        .insert({
            org_id: profile.org_id,
            bureau_name: bureauName
        })

    if (error) throw error
    revalidatePath('/multi-bureau')
}

// Fetch requirements tailored to active bureaus (plus global)
export async function getClientRequirements(activeBureaus: string[]) {
    const supabase = await createClient()
    const { user } = await getUserAndOrg()
    if (!user) return []

    const filterBureaus = [...activeBureaus, 'Global']

    const { data, error } = await supabase
        .from('dynamic_requirements')
        .select('*')
        .in('bureau_name', filterBureaus)
        .order('display_order', { ascending: true })

    if (error) throw error
    return data as DynamicRequirement[]
}

// Save a dynamic answer and check validation rules
export async function saveDynamicAnswer(requirementId: string, answerValue: string, answerOther: string | null = null) {
    const supabase = await createClient()
    const { user, profile } = await getUserAndOrg()
    if (!user || !profile?.org_id) throw new Error("Unauthorized")

    // Upsert the answer
    const { error } = await (supabase as any)
        .from('dynamic_answers')
        .upsert({
            org_id: profile.org_id,
            requirement_id: requirementId,
            answer_value: answerValue,
            answer_other: answerOther
        }, { onConflict: 'org_id, requirement_id' })

    if (error) throw error

    // Fetch the requirement to check for JSONB validation rules
    const { data: reqData } = await supabase
        .from('dynamic_requirements')
        .select('*')
        .eq('id', requirementId)
        .single()
    const req: any = reqData;
        
    if (req?.validation_rules) {
        // Implementation of 500 records logic mapping
        const rules = req.validation_rules as any;
        if (rules.min_value && req.field_type === 'number') {
            const val = parseInt(answerValue)
            if (!isNaN(val) && val < rules.min_value && rules.triggers_manual_review) {
                // Determine which bureau this belongs to (or all if Global)
                const targetBureau = req.bureau_name === 'Global' ? undefined : req.bureau_name;
                
                let query = (supabase as any).from('bureau_applications').update({ status: 'manual_review_required' }).eq('org_id', profile.org_id).eq('status', 'draft')
                if (targetBureau) {
                    query = query.eq('bureau_name', targetBureau)
                }
                
                // We won't strictly enforce the "lending license override" here elegantly as it spans multiple EAV rows,
                // but this hooks the core engine logic to mark it for manual review based on the JSON payload.
                await query;
            }
        }
    }

    // Evaluate Completion Logic
    const { data: activeBureaus } = await supabase.from('bureau_applications')
        .select('*')
        .eq('org_id', profile.org_id)
        .is('completed_at', null);
    
    if (activeBureaus && activeBureaus.length > 0) {
        const { data: allReqsData } = await (supabase as any).from('dynamic_requirements').select('*').eq('is_required', true);
        const { data: allAnswersData } = await (supabase as any).from('dynamic_answers').select('*').eq('org_id', profile.org_id);
        const allReqs: any[] = allReqsData || [];
        const allAnswers: any[] = allAnswersData || [];
        
        if (allReqs.length > 0 && allAnswers.length > 0) {
            const answeredIds = new Set(allAnswers.filter((a: any) => a.answer_value && a.answer_value.trim() !== "").map((a: any) => a.requirement_id));
            const globalReqs = allReqs.filter((r: any) => r.bureau_name === 'Global').map((r: any) => r.id);
            
            for (const b of activeBureaus as any[]) {
                const bureauReqs = allReqs.filter((r: any) => r.bureau_name === b.bureau_name).map((r: any) => r.id);
                const combinedReqs = [...globalReqs, ...bureauReqs];
                
                // Ensure there actually are requirements, and that they are all answered
                if (combinedReqs.length > 0 && combinedReqs.every(id => answeredIds.has(id))) {
                     await (supabase as any).from('bureau_applications')
                        .update({ status: 'pending_bureau', completed_at: new Date().toISOString() })
                        .eq('id', b.id);
                }
            }
        }
    }

    revalidatePath('/multi-bureau')
}
