"use client"

import { CheckCircle2, Building2, Phone, Hash, Globe, Shield, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const SECTIONS = [
    {
        icon: Building2,
        title: "Legal Entity Requirements",
        tag: "DNB_ELIGIBILITY",
        tagColor: "bg-blue-100 text-blue-700 border-blue-200",
        items: [
            "Must be structured as an LLC or Corporation",
            "Sole proprietorships are NOT eligible",
            "Business must be in active good standing with state of incorporation",
        ],
    },
    {
        icon: Hash,
        title: "EIN Requirement",
        tag: "DNB_ELIGIBILITY",
        tagColor: "bg-blue-100 text-blue-700 border-blue-200",
        items: [
            "A valid federal Employer Identification Number (EIN) is required",
            "Social Security Numbers will not be accepted",
            "EIN must match IRS records for the legal entity name",
        ],
    },
    {
        icon: Globe,
        title: "Commercial Address Requirement",
        tag: "DNB_ELIGIBILITY",
        tagColor: "bg-blue-100 text-blue-700 border-blue-200",
        items: [
            "Must be a verifiable commercial address",
            "PO Boxes are NOT accepted as a primary address (AI Auditor will block)",
            "Residential addresses will be flagged High Risk and require review",
        ],
    },
    {
        icon: Phone,
        title: "Business Phone Requirement",
        tag: "LENDER_VERIFICATION",
        tagColor: "bg-violet-100 text-violet-700 border-violet-200",
        items: [
            "Must have a dedicated business landline or business VoIP number",
            "Personal cell phones are not acceptable",
            "Phone must be listed under the business name",
        ],
    },
    {
        icon: Shield,
        title: "D-U-N-S Number",
        tag: "DNB_ELIGIBILITY",
        tagColor: "bg-blue-100 text-blue-700 border-blue-200",
        items: [
            "D-U-N-S numbers are assigned by D&B — you may already have one",
            "If you don't have a DUNS, D&B will assign one upon application review",
            "Check if your business already has a DUNS at dnb.com/duns-lookup",
        ],
    },
    {
        icon: FileText,
        title: "Ongoing Submission Standards",
        tag: "MONTHLY_CONTRIBUTION",
        tagColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
        items: [
            "If reporting: 20–50 active B2B customer accounts required monthly",
            "If building credit: 3–4 B2B trade references with $500–$1,000 limits required",
            "All submissions must be B2B — no consumer accounts",
        ],
    },
]

export function DNBStep1Requirements() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-slate-900">Step 1: D&B Prerequisites</h2>
                    <p className="text-sm text-slate-500 mt-1">Review all requirements before proceeding. No input required on this step.</p>
                </div>
                <Button variant="outline" size="sm" className="gap-2 print:hidden" onClick={() => window.print()}>
                    Download / Print
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {SECTIONS.map((s, i) => (
                    <Card key={i} className="border border-slate-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center justify-between gap-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <s.icon className="h-4 w-4 text-slate-400" />
                                    {s.title}
                                </div>
                                <Badge className={`text-[10px] ${s.tagColor} shrink-0`}>{s.tag}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-1">
                                {s.items.map((item, j) => (
                                    <li key={j} className="flex items-start gap-2 text-sm text-slate-600">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="p-4 bg-slate-900 rounded-xl text-xs leading-relaxed text-slate-300">
                <span className="font-bold text-white">AI Auditor Active: </span>
                PO Box addresses will be <span className="text-red-400 font-mono">blocked</span> — residential addresses will be flagged{" "}
                <span className="text-amber-400 font-mono">High Risk</span>. Non-B2B trade references and personal accounts will be flagged{" "}
                <span className="text-amber-400 font-mono">⚠ Invalid Reference</span> in Step 4.
            </div>
        </div>
    )
}
