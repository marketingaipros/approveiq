import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

/**
 * One-time setup: creates the bureau-docs storage bucket.
 * Hit this once from your browser: /api/setup/storage
 */
export async function GET() {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return NextResponse.json({
            error: "SUPABASE_SERVICE_ROLE_KEY is not set in .env.local. Add it and redeploy.",
            hint: "Get it from: Supabase Dashboard → Project Settings → API → service_role key"
        }, { status: 500 })
    }

    try {
        const admin = createAdminClient()

        // Check if bucket exists
        const { data: buckets } = await admin.storage.listBuckets()
        const exists = buckets?.some(b => b.name === "bureau-docs")

        if (exists) {
            return NextResponse.json({ success: true, message: "Bucket 'bureau-docs' already exists." })
        }

        // Create it
        const { error } = await admin.storage.createBucket("bureau-docs", {
            public: true,
            fileSizeLimit: 10485760 // 10MB
        })

        if (error) throw error

        return NextResponse.json({ success: true, message: "✅ Storage bucket 'bureau-docs' created! You can now upload documents." })
    } catch (err: any) {
        console.error("Storage setup error:", err)
        return NextResponse.json({ error: err.message || "Failed to create bucket" }, { status: 500 })
    }
}
