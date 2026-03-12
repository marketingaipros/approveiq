"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function uploadBureauDocument(formData: FormData) {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error("Not authenticated")

    const file = formData.get("file") as File
    const bureau = formData.get("bureau") as string
    const label = formData.get("label") as string || file.name

    if (!file || !bureau) throw new Error("Missing file or bureau")

    // Upload to Supabase Storage — bucket "bureau-docs"
    const filePath = `${session.user.id}/${bureau}/${Date.now()}_${file.name}`
    const { error: uploadError } = await supabase.storage
        .from("bureau-docs")
        .upload(filePath, file, { upsert: true })

    if (uploadError) {
        console.error("Upload error:", uploadError)
        throw new Error(`File upload failed: ${uploadError.message}`)
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
        .from("bureau-docs")
        .getPublicUrl(filePath)

    // Record in bureau_documents table (we'll upsert-create it)
    const { error: dbError } = await (supabase as any)
        .from("bureau_documents")
        .insert({
            user_id: session.user.id,
            bureau: bureau.toLowerCase(),
            label,
            file_path: filePath,
            file_url: publicUrl,
            file_name: file.name,
            file_size: file.size,
        })

    if (dbError) {
        console.error("Bureau doc DB error:", dbError)
        // Not fatal — file is uploaded, metadata just didn't save
    }

    revalidatePath("/knowledge")
    return { success: true, url: publicUrl, fileName: file.name }
}

export async function getBureauDocuments(bureau: string) {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return []

    const { data, error } = await (supabase as any)
        .from("bureau_documents")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("bureau", bureau.toLowerCase())
        .order("created_at", { ascending: false })

    if (error) return []
    return data || []
}
