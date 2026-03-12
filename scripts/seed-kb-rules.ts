/**
 * Seed the knowledge_base table with structured rules_json for all 5 bureaus.
 * Run with: npx tsx scripts/seed-kb-rules.ts
 * 
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env.
 */

import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const bureauEntries = [
    {
        bureau: "equifax",
        topic: "Equifax Data Furnisher Requirements",
        content: `## Equifax CFN Intake Standards (2023)\n\nEquifax requires all furnishers to submit data via the CFN (Credit File Network) format. Members must meet a minimum of **500 active accounts** (non-financial contributors) or provide a Lending License as an exception. A **Dispute Procedure PDF** must be uploaded before live reporting begins. An initial **3-month historical data load** is required for all new furnishers.`,
        rules_json: {
            min_records: 500,
            requires_dispute_doc: true,
            requires_dispute_pdf: true,
            requires_3_months_historical: true,
            requires_lending_license: false,
            repayment_types: ["ACH", "Credit", "Debit"],
            required_checklist_tags: ["METRO2_VALIDATION", "SERVICE_AGREEMENT", "SECURITY_AUDIT", "DISPUTE_POLICY", "HISTORICAL_LOAD"],
            source_year: 2023
        }
    },
    {
        bureau: "experian",
        topic: "Experian Data Subscriber Standards",
        content: `## Experian Metro 2® Compliance\n\nExperian mandates that all furnishers submit data in Metro 2® format. A signed Data Subscriber Agreement (DSA) and a security attestation (SOC 2 Type 2 or equivalent) are required before onboarding is complete.`,
        rules_json: {
            min_records: 0,
            requires_dispute_doc: false,
            requires_lending_license: false,
            repayment_types: ["ACH", "Credit", "Debit", "Wire"],
            required_checklist_tags: ["METRO2_VALIDATION", "SERVICE_AGREEMENT", "SECURITY_AUDIT"]
        }
    },
    {
        bureau: "sbfe",
        topic: "SBFE (Small Business Financial Exchange) Rules",
        content: `## SBFE Membership Requirements\n\nSBFE requires members to be SBFE-eligible institutions and submit data monthly via Metro 2® standard format. A Membership Agreement must be signed and physical mailing address validated.`,
        rules_json: {
            min_records: 0,
            requires_dispute_doc: false,
            requires_lending_license: true,
            repayment_types: ["ACH", "Check", "Wire"],
            required_checklist_tags: ["METRO2_VALIDATION", "SERVICE_AGREEMENT"]
        }
    },
    {
        bureau: "dnb",
        topic: "D&B (Dun & Bradstreet) Trade Reference Requirements",
        content: `## D&B Trade Reference Submission\n\nD&B collects business trade references for inclusion in business credit reports. Furnishers submit Aged Accounts Receivable summaries. No minimum record count, but DUNS number matching is required.`,
        rules_json: {
            min_records: 0,
            requires_dispute_doc: false,
            requires_lending_license: false,
            repayment_types: ["Net 30", "Net 60", "Net 90"],
            required_checklist_tags: ["DUNS_VERIFICATION", "AR_SUMMARY"]
        }
    },
    {
        bureau: "creditsafe",
        topic: "Creditsafe Furnisher Requirements",
        content: `## Creditsafe Data Feed Protocol\n\nCreditsafe accepts Aged A/R summary data via secure SFTP upload. A data license agreement must be signed. No minimum record threshold; global data toggles may apply.`,
        rules_json: {
            min_records: 0,
            requires_dispute_doc: false,
            requires_lending_license: false,
            repayment_types: ["Net 30", "Net 60"],
            required_checklist_tags: ["AR_SUMMARY", "SERVICE_AGREEMENT"]
        }
    }
]

async function seedKnowledgeBase() {
    console.log("🌱 Seeding knowledge_base with bureau rules...")

    for (const entry of bureauEntries) {
        const { error } = await supabase
            .from('knowledge_base')
            .upsert(entry, { onConflict: 'bureau' })

        if (error) {
            console.error(`❌ Failed to seed ${entry.bureau}:`, error.message)
        } else {
            console.log(`✅ Seeded: ${entry.bureau}`)
        }
    }

    console.log("\n✅ Done. Run your app now — Templates and AI Agent will use live rules.")
}

seedKnowledgeBase()
