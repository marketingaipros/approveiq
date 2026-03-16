"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { getUserAndOrg } from "./actions"
import { DynamicRequirement } from "@/components/bureau/admin/requirement-builder"

export async function getDynamicRequirements() {
    const supabase = await createClient()
    
    // Auth check
    const { user } = await getUserAndOrg()
    if (!user) throw new Error("Unauthorized")

    // In production, enforce admin check here

    const { data, error } = await supabase
        .from('dynamic_requirements')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Error fetching requirements:", error)
        throw new Error("Failed to load requirements")
    }

    return data as DynamicRequirement[]
}

export async function createDynamicRequirement(req: Omit<DynamicRequirement, 'id'>) {
    const supabase = await createClient()
    const { user } = await getUserAndOrg()
    if (!user) throw new Error("Unauthorized")

    // Find highest display order
    const { data: maxOrderData } = await supabase
        .from('dynamic_requirements')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1)
        .single()
    const maxOrder: any = maxOrderData;
        
    const nextOrder = maxOrder ? (maxOrder.display_order || 0) + 1 : 1;

    const { error } = await (supabase as any)
        .from('dynamic_requirements')
        .insert({
            bureau_name: req.bureau_name,
            field_key: req.field_key,
            field_label: req.field_label,
            field_type: req.field_type,
            options: req.options,
            is_required: req.is_required,
            validation_rules: req.validation_rules || {},
            display_order: nextOrder
        })

    if (error) {
        console.error("Error inserting requirement:", error)
        throw new Error("Creation failed")
    }

    revalidatePath('/admin/requirement-manager')
    revalidatePath('/multi-bureau') // Invalidate client dashboards
}

export async function createBureau(name: string, description: string = '') {
    const supabase = await createClient()
    const { user } = await getUserAndOrg()
    if (!user) throw new Error("Unauthorized")

    const { error } = await (supabase as any)
        .from('bureaus')
        .insert({ name, description })

    if (error) {
        console.error("Error creating bureau:", error)
        throw new Error("Failed to create bureau")
    }

    revalidatePath('/admin/requirement-manager')
    revalidatePath('/multi-bureau')
}
