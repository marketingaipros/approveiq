import { NextRequest, NextResponse } from "next/server"
import { seedSBFEKnowledgeBase } from "@/lib/sbfe-actions"

export async function POST(req: NextRequest) {
    try {
        const { bureau } = await req.json()

        if (bureau === "sbfe") {
            const result = await seedSBFEKnowledgeBase()
            return NextResponse.json(result)
        }

        return NextResponse.json({ error: `Unknown bureau: ${bureau}` }, { status: 400 })
    } catch (e: any) {
        console.error("[seed-kb] Error:", e)
        return NextResponse.json({ error: e.message || "Seed failed" }, { status: 500 })
    }
}
