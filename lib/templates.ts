export type ChecklistTemplateItem = {
    title: string
    description: string
    required: boolean
    source_attribution?: string
}

export type BureauTemplate = {
    id: string
    name: string
    description: string
    bureau: 'experian' | 'equifax' | 'dnb'
    items: ChecklistTemplateItem[]
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
                required: true
            },
            {
                title: 'Data Subscriber Agreement (DSA)',
                description: 'Upload the signed DSA header page.',
                source_attribution: 'Source: Experian Legal',
                required: true
            },
            {
                title: 'Security Audit Attestation',
                description: 'Upload SOC 2 Type 2 or equivalent attestation.',
                source_attribution: 'Source: Experian Security Standards',
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
                required: true
            },
            {
                title: 'Metro 2® Test Batch',
                description: 'Submission of 100+ sample records for quality testing.',
                source_attribution: 'Source: Equifax Technical Ops',
                required: true
            },
            {
                title: 'Physical Site Inspection',
                description: 'Proof of completed third-party site visit or virtual equivalent.',
                source_attribution: 'Source: Equifax Security',
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
                required: true
            },
            {
                title: 'FTP Credentials Form',
                description: 'Secure transmission setup form.',
                source_attribution: 'Source: D&B IT Operations',
                required: true
            },
            {
                title: 'W-9 / Tax ID Verification',
                description: 'Verification of business entity tax standing.',
                source_attribution: 'Source: D&B Compliance',
                required: true
            }
        ]
    }
]
