"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// ============================================================
// SBFE Knowledge Base — 4 Manual Rules
// Tags: LENDER_VERIFICATION, SBFE_GOVERNANCE
// ============================================================
export const SBFE_KB_RULES = [
    {
        topic: "Mandatory Monthly Data Submission",
        bureau: "sbfe",
        content: `## Mandatory Monthly Data Submission

**Requirement Tag: SBFE_GOVERNANCE**

All SBFE members are required to submit small business credit data on a monthly basis. Submissions must be made within 30 days of each reporting cycle.

### Key Points
- Monthly reporting is not optional — consistent non-submission may result in membership suspension.
- Data submissions must conform to the SBFE-approved format (Metro 2® or SBFE Data Specification).
- Late or missing submissions are tracked and reviewed during the annual governance audit.

### References
- SBFE Operating Procedures, Section 3.1: Data Contribution Requirements`,
        rules_json: { tag: "SBFE_GOVERNANCE", category: "reporting_frequency", enforced: true }
    },
    {
        topic: "Small-Business Credit Originator or Processor Eligibility",
        bureau: "sbfe",
        content: `## Membership Eligibility — Small-Business Credit Originators and Processors

**Requirement Tag: LENDER_VERIFICATION**

SBFE membership is restricted to entities that originate or process small-business credit. Trade credit providers are explicitly excluded.

### Eligible Member Types
- Commercial banks and credit unions
- Non-bank small-business lenders
- SBA-approved lenders
- Commercial finance companies
- Equipment finance and leasing companies (where credit risk is carried)

### Ineligible
- Trade credit providers (net-30 accounts between businesses for goods/services)
- Consumer-only lenders with no small business portfolio
- Marketplace platforms not holding credit risk

### References
- SBFE Membership Charter, Section 2.4: Eligible Contributor Categories`,
        rules_json: { tag: "LENDER_VERIFICATION", category: "eligibility", enforced: true }
    },
    {
        topic: "Annual Dues Based on Account Volume",
        bureau: "sbfe",
        content: `## Annual Dues — Volume-Based Tier Structure

**Requirement Tag: SBFE_GOVERNANCE**

SBFE charges annual membership dues calculated on the basis of total active small-business account volume contributed by the member.

### Tier Structure (Approximate)
| Annual Account Volume | Dues Tier |
|---|---|
| < 1,000 accounts | Tier 1 (Lowest) |
| 1,000 – 10,000 | Tier 2 |
| 10,001 – 50,000 | Tier 3 |
| 50,001 – 250,000 | Tier 4 |
| 250,000+ | Tier 5 (Highest) |

Dues are invoiced annually. Failure to pay dues within 60 days of invoice may result in data access suspension.

### References
- SBFE Fee Schedule (current year) — provided upon application approval`,
        rules_json: { tag: "SBFE_GOVERNANCE", category: "dues", enforced: true }
    },
    {
        topic: "Data Use Restricted to Credit and Risk Purposes",
        bureau: "sbfe",
        content: `## Data Use Policy — Credit and Risk Purposes Only

**Requirement Tag: SBFE_GOVERNANCE, LENDER_VERIFICATION**

SBFE data is exclusively licensed for credit underwriting, risk management, and portfolio monitoring. Use of SBFE data for marketing, solicitation, or any non-credit purpose is strictly prohibited and constitutes a material breach of membership agreement.

### Permitted Uses
- Credit origination and underwriting decisions
- Portfolio risk monitoring and early warning
- Fraud detection (credit-related)
- Regulatory reporting (where permitted by law)

### Prohibited Uses
- Marketing or pre-screening for product offers
- Resale or redistribution of SBFE data
- Employment screening or tenant screening
- Any purpose not directly related to credit risk assessment

Members must certify compliance with this restriction annually.

### References
- SBFE Data License Agreement, Section 5: Permitted Use of Data`,
        rules_json: { tags: ["SBFE_GOVERNANCE", "LENDER_VERIFICATION"], category: "data_use", enforced: true }
    },
]

/** Seed the SBFE Knowledge Base container with 4 manual rules */
export async function seedSBFEKnowledgeBase() {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) throw new Error("Unauthorized")

    const results = []
    for (const rule of SBFE_KB_RULES) {
        const { data, error } = await (supabase as any)
            .from('knowledge_base')
            .upsert(rule, { onConflict: 'bureau,topic' })
            .select()

        if (error) console.error(`Failed to seed: ${rule.topic}`, error)
        else results.push(data)
    }

    // Audit log
    const { data: orgs } = await (supabase as any).from('organizations').select('id').limit(1)
    await (supabase as any).from('audit_logs').insert({
        org_id: orgs?.[0]?.id,
        user_id: session.user.id,
        action: 'sbfe_knowledge_base_seeded',
        metadata: { rules_count: SBFE_KB_RULES.length, tags: ['LENDER_VERIFICATION', 'SBFE_GOVERNANCE'] },
    })

    revalidatePath('/knowledge')
    return { success: true, seeded: results.length }
}

/** Get or create an SBFE onboarding application for the current org */
export async function getOrCreateSBFEApplication() {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) throw new Error("Unauthorized")

    const { data: orgs } = await (supabase as any)
        .from('organizations')
        .select('*')
        .limit(1)

    if (!orgs || orgs.length === 0) throw new Error("No organization context found.")
    const org = orgs[0]

    const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle()

    let { data: app } = await (supabase as any)
        .from('sbfe_onboarding_applications')
        .select('*')
        .eq('org_id', org.id)
        .maybeSingle()

    if (!app) {
        const { data: newApp, error: appError } = await (supabase as any)
            .from('sbfe_onboarding_applications')
            .insert({ org_id: org.id, status: 'draft' })
            .select()
            .single()

        if (appError) throw new Error("Failed to create SBFE application: " + appError.message)
        app = newApp

        const { error: dataError } = await (supabase as any)
            .from('sbfe_onboarding_data')
            .insert({ application_id: app.id })

        if (dataError) throw new Error("Failed to initialize SBFE data: " + dataError.message)
    }

    const { data: sbfeData } = await (supabase as any)
        .from('sbfe_onboarding_data')
        .select('*')
        .eq('application_id', app.id)
        .single()

    return {
        application: app,
        data: sbfeData || {},
        profile: {
            fullName: profile?.full_name || profile?.name || session.user.email?.split('@')[0] || '',
            email: profile?.email || session.user.email || '',
            phone: profile?.phone || profile?.phone_number || '',
        },
        org: {
            name: org.name || org.company_name || '',
            address: org.address || org.street_address || '',
            city: org.city || '',
            state: org.state || '',
            zip: org.zip || org.postal_code || '',
            website: org.website || org.company_website || '',
            phone: org.phone || org.company_phone || '',
        },
    }
}

/** Auto-save SBFE bureau-specific fields */
export async function updateSBFEData(applicationId: string, data: any) {
    const supabase = await createClient()
    const { error } = await (supabase as any)
        .from('sbfe_onboarding_data')
        .update(data)
        .eq('application_id', applicationId)

    if (error) throw new Error("Failed to save SBFE data: " + error.message)
    revalidatePath('/sbfe-onboarding')
    return { success: true }
}

/** Submit SBFE application for internal review */
export async function submitSBFEApplication(applicationId: string) {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error("Unauthorized")

    const { error } = await (supabase as any)
        .from('sbfe_onboarding_applications')
        .update({ status: 'submitted' })
        .eq('id', applicationId)

    if (error) throw new Error("Failed to submit SBFE application: " + error.message)
    revalidatePath('/sbfe-onboarding')
    revalidatePath('/admin/sbfe')
    return { success: true }
}
