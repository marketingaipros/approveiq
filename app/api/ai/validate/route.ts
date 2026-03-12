import { NextRequest, NextResponse } from "next/server"
import { getKnowledgeBaseRules } from "@/lib/knowledge-actions"

/**
 * AI Compliance Validation Agent
 * POST /api/ai/validate
 * Body: { bureau: string, field: string, value: string | number }
 *
 * Validates user input against live bureau rules from the Knowledge Base.
 * Uses rule-based logic now; hook up GOOGLE_AI_API_KEY for LLM-powered validation.
 */
export async function POST(request: NextRequest) {
    try {
        const { bureau, field, value } = await request.json()

        if (!bureau || !field || value === undefined) {
            return NextResponse.json({ valid: false, message: "bureau, field, and value are required." }, { status: 400 })
        }

        // Load live rules from the Knowledge Base
        const rules = await getKnowledgeBaseRules(bureau)

        if (!rules) {
            // No rules found — default to permissive pass
            return NextResponse.json({ valid: true, message: `No compliance rules found for ${bureau}. Input accepted.` })
        }

        // --- Rule-Based Compliance Engine ---
        let valid = true
        let message = "✓ Compliant"

        if (field === "record_count") {
            const minRecords = rules.min_records ?? 0
            if (minRecords > 0 && Number(value) < minRecords) {
                valid = false
                message = `${bureau.charAt(0).toUpperCase() + bureau.slice(1)} requires a minimum of ${minRecords} records. You have ${value}. Consider providing a Lending License as an exception.`
            }
        }

        if (field === "has_dispute_doc" && rules.requires_dispute_doc && !value) {
            valid = false
            message = `${bureau} requires a Dispute Documentation Policy before reporting can begin.`
        }

        if (field === "has_lending_license" && rules.requires_lending_license && !value) {
            valid = false
            message = `${bureau} requires a valid Lending License for data furnisher approval.`
        }

        if (field === "repayment_type" && Array.isArray(rules.repayment_types)) {
            if (!rules.repayment_types.includes(String(value))) {
                valid = false
                message = `${value} is not a supported repayment type for ${bureau}. Accepted: ${rules.repayment_types.join(", ")}.`
            }
        }

        // --- Optional LLM Enhancement ---
        // Uncomment below and add GOOGLE_AI_API_KEY to .env.local for AI-powered nuanced validation
        //
        // if (process.env.GOOGLE_AI_API_KEY) {
        //     const { GoogleGenerativeAI } = await import("@google/generative-ai")
        //     const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
        //     const model = genAI.getGenerativeModel({ model: "gemini-pro" })
        //     const prompt = `You are a strict bureau compliance auditor.
        //     Bureau: ${bureau}
        //     Compliance Rules: ${JSON.stringify(rules, null, 2)}
        //     User input field: ${field}
        //     User input value: ${value}
        //     Is this input compliant with the rules? Reply with JSON: { "valid": boolean, "message": string }`
        //     const result = await model.generateContent(prompt)
        //     const text = result.response.text()
        //     const parsed = JSON.parse(text.replace(/```json|```/g, "").trim())
        //     valid = parsed.valid
        //     message = parsed.message
        // }

        return NextResponse.json({ valid, message, rules_applied: bureau })

    } catch (error: any) {
        console.error("AI Validate error:", error)
        return NextResponse.json({ valid: false, message: "Validation service error." }, { status: 500 })
    }
}
