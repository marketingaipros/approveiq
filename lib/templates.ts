export type ChecklistTemplateItem = {
    title: string
    description: string
    required: boolean
    requirement_tag?: string // Used for AI data reuse mapping
    source_attribution?: string
}

export type BureauTemplate = {
    id: string
    name: string
    description: string
    bureau: string
    items: ChecklistTemplateItem[]
}

// Mirrors the rules_json JSONB shape in the knowledge_base table
export type BureauRules = {
    min_records?: number
    requires_dispute_doc?: boolean
    requires_dispute_pdf?: boolean         // Equifax 2023: mandatory PDF upload
    requires_lending_license?: boolean
    requires_3_months_historical?: boolean  // Equifax: 3-month initial historical load
    repayment_types?: string[]
    required_checklist_tags?: string[]
    source_year?: number                   // e.g. 2023
    [key: string]: unknown
}

/**
 * Converts a live Knowledge Base entry (with rules_json) into a BureauTemplate object.
 * Called by the Templates page to dynamically generate templates from DB rules.
 */
export function buildTemplateFromRules(kbEntry: {
    id: string
    topic: string
    content: string
    bureau: string | null
    rules_json: BureauRules | null
}): BureauTemplate {
    const bureau = kbEntry.bureau || "general"
    const rules = kbEntry.rules_json || {}
    const tags = rules.required_checklist_tags || []

    // Map known requirement tags to human-readable checklist items
    const TAG_LABELS: Record<string, { title: string; description: string }> = {
        METRO2_VALIDATION:    { title: "Metro 2® File Validation",       description: "Upload a sample file passing the Metro 2® standard format checks." },
        SERVICE_AGREEMENT:    { title: "Service / Subscriber Agreement",  description: "Upload the signed service agreement for data reporting." },
        SECURITY_AUDIT:       { title: "Security Audit Attestation",      description: "Upload SOC 2 Type 2 or equivalent attestation." },
        DISPUTE_POLICY:        { title: "Dispute Documentation Policy",    description: "Submit your consumer dispute handling policy and procedures." },
        METRO2_TEST_BATCH:    { title: "Metro 2® Test Batch",             description: "Submission of 100+ sample records for quality testing." },
        SITE_INSPECTION:       { title: "Physical Site Inspection",        description: "Proof of completed third-party site visit or virtual equivalent." },
        DUNS_VERIFICATION:    { title: "DUNS Number Verification",         description: "Confirm your business DUNS number for entity matching." },
        AR_SUMMARY:           { title: "Aged A/R Summary Report",          description: "Submit an Aged Accounts Receivable summary for trade reference." },
        TRANSMISSION_SETUP:   { title: "Secure Transmission Setup",        description: "FTP/SFTP credentials and secure channel configuration." },
        TAX_ID_VERIFICATION:  { title: "W-9 / Tax ID Verification",        description: "Verification of business entity and federal tax standing." },
    }

    const items: ChecklistTemplateItem[] = tags.map(tag => ({
        title: TAG_LABELS[tag]?.title || tag,
        description: TAG_LABELS[tag]?.description || `Complete the ${tag} requirement.`,
        required: true,
        requirement_tag: tag,
        source_attribution: `Source: ${bureauLabel(bureau)} Compliance Standards`
    }))

    // If no tags defined, create a generic checklist
    if (items.length === 0) {
        items.push({
            title: "Bureau Service Agreement",
            description: "Upload your signed service agreement.",
            required: true,
            requirement_tag: "SERVICE_AGREEMENT"
        })
    }

    return {
        id: `${bureau}-kb-${kbEntry.id}`,
        name: kbEntry.topic,
        description: kbEntry.content?.split("\n").find(l => l && !l.startsWith("#"))?.replace(/\*\*/g, "") || "",
        bureau,
        items
    }
}

function bureauLabel(bureau: string): string {
    const labels: Record<string, string> = {
        equifax: "Equifax",
        experian: "Experian",
        sbfe: "SBFE",
        dnb: "D&B",
        creditsafe: "Creditsafe"
    }
    return labels[bureau] || bureau
}



export const BUREAU_TEMPLATES: BureauTemplate[] = [
    {
        id: "experian-furnisher",
        name: "Experian Data Furnisher",
        description: "Official requirements for reporting consumer credit data to Experian.",
        bureau: "experian",
        items: [
            {
                title: 'Metro 2® File Validation',
                description: 'Upload a sample file passing the Metro 2® standard format checks.',
                source_attribution: 'Source: CDIA Metro 2® Format 2024',
                requirement_tag: 'METRO2_VALIDATION',
                required: true
            },
            {
                title: 'Data Subscriber Agreement (DSA)',
                description: 'Upload the signed DSA header page.',
                source_attribution: 'Source: Experian Legal',
                requirement_tag: 'SERVICE_AGREEMENT',
                required: true
            },
            {
                title: 'Security Audit Attestation',
                description: 'Upload SOC 2 Type 2 or equivalent attestation.',
                source_attribution: 'Source: Experian Security Standards',
                requirement_tag: 'SECURITY_AUDIT',
                required: true
            }
        ]
    },
    {
        id: "equifax-metro2",
        name: "Equifax Metro 2® Intake",
        description: "Standard workflow for Equifax data furnishing approval.",
        bureau: "equifax",
        items: [
            {
                title: 'Equifax Service Agreement',
                description: 'Signed master agreement for data reporting.',
                source_attribution: 'Source: Equifax Legal',
                requirement_tag: 'SERVICE_AGREEMENT',
                required: true
            },
            {
                title: 'Metro 2® Test Batch',
                description: 'Submission of 100+ sample records for quality testing.',
                source_attribution: 'Source: Equifax Technical Ops',
                requirement_tag: 'METRO2_TEST_BATCH',
                required: true
            },
            {
                title: 'Physical Site Inspection',
                description: 'Proof of completed third-party site visit or virtual equivalent.',
                source_attribution: 'Source: Equifax Security',
                requirement_tag: 'SITE_INSPECTION',
                required: true
            }
        ]
    },
    {
        id: "dnb-commercial",
        name: "D&B Commercial Reporting",
        description: "Workflow for reporting commercial trade lines to Dun & Bradstreet.",
        bureau: "dnb",
        items: [
            {
                title: 'Trade Exchange Agreement',
                description: 'Agreement for sharing commercial credit data.',
                source_attribution: 'Source: D&B Global Privacy',
                requirement_tag: 'SERVICE_AGREEMENT',
                required: true
            },
            {
                title: 'FTP Credentials Form',
                description: 'Secure transmission setup form.',
                source_attribution: 'Source: D&B IT Operations',
                requirement_tag: 'TRANSMISSION_SETUP',
                required: true
            },
            {
                title: 'W-9 / Tax ID Verification',
                description: 'Verification of business entity tax standing.',
                source_attribution: 'Source: D&B Compliance',
                requirement_tag: 'TAX_ID_VERIFICATION',
                required: true
            }
        ]
    },
    {
        id: "sba-8a",
        name: "SBA 8(a) Certification",
        description: "Standard checklist for US SBA 8(a) Business Development Program application.",
        bureau: "experian", // Using 'experian' as a placeholder for general business/gov compliance in this demo context
        items: [
            {
                title: 'Proof of US Citizenship',
                description: 'Upload valid passport, birth certificate, or naturalization papers.',
                source_attribution: 'Source: SBA.gov Requirements',
                requirement_tag: 'CITIZENSHIP_PROOF',
                required: true
            },
            {
                title: 'Personal Tax Returns (3 Years)',
                description: 'Upload personal federal tax returns for the last 3 years.',
                source_attribution: 'Source: SBA Financial Review',
                requirement_tag: 'TAX_RETURNS_PERSONAL',
                required: true
            },
            {
                title: 'Personal Net Worth Statement',
                description: 'Completed SBA Form 413 for each owner >10%.',
                source_attribution: 'Source: SBA Forms',
                requirement_tag: 'NET_WORTH_STATEMENT',
                required: true
            }
        ]
    }
]
