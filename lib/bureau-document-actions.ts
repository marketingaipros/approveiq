"use server"

import { createClient, createAdminClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

const BUCKET = "bureau-docs"

/** Ensure the bureau-docs bucket exists (creates it via admin client if missing) */
async function ensureBucket() {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return // skip if no service key
    try {
        const admin = createAdminClient()
        const { data: buckets } = await admin.storage.listBuckets()
        const exists = buckets?.some(b => b.name === BUCKET)
        if (!exists) {
            await admin.storage.createBucket(BUCKET, { public: true, fileSizeLimit: 10485760 })
            console.log("✅ Created bureau-docs storage bucket")
        }
    } catch (e) {
        console.warn("Could not auto-create bucket:", e)
    }
}

export async function uploadBureauDocument(formData: FormData) {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error("Not authenticated")

    const file = formData.get("file") as File
    const bureau = formData.get("bureau") as string
    const label = formData.get("label") as string || file.name

    if (!file || !bureau) throw new Error("Missing file or bureau")

    // Auto-create bucket if it doesn't exist
    await ensureBucket()

    const filePath = `${session.user.id}/${bureau}/${Date.now()}_${file.name}`

    const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, file, { upsert: true })

    if (uploadError) {
        console.error("Upload error:", uploadError)
        throw new Error(`File upload failed: ${uploadError.message}`)
    }

    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(filePath)

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

    if (dbError) console.error("Bureau doc DB error:", dbError)

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
