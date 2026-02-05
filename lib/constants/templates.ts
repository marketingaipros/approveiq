export type Template = {
    id: string
    name: string
    description: string
    items: { title: string; description: string; required: boolean }[]
}

export const STANDARD_TEMPLATES: Template[] = [
    {
        id: "iso-27001",
        name: "ISO 27001 Readiness",
        description: "Standard checklist for Information Security Management Systems.",
        items: [
            { title: "Information Security Policy", description: "Upload the approved policy document.", required: true },
            { title: "Risk Assessment Report", description: "Most recent risk assessment.", required: true },
            { title: "Statement of Applicability", description: "SoA document.", required: true },
            { title: "Access Control Policy", description: "Policy defining access rights.", required: true },
        ]
    },
    {
        id: "soc2-type1",
        name: "SOC 2 Type 1",
        description: "Prepare for your SOC 2 Type 1 audit.",
        items: [
            { title: "System Description", description: "Detailed description of the system.", required: true },
            { title: "Organizational Chart", description: "Current org chart.", required: true },
            { title: "Change Management Policy", description: "Procedures for code changes.", required: true },
        ]
    },
    {
        id: "vendor-onboarding",
        name: "Vendor Onboarding (General)",
        description: "Basic intake for new vendors.",
        items: [
            { title: "W-9 Form", description: "Tax form.", required: true },
            { title: "MSA (Master Services Agreement)", description: "Signed MSA.", required: true },
            { title: "Insurance Certificate", description: "Proof of liability insurance.", required: false },
        ]
    }
]
