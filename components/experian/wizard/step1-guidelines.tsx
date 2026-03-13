"use client"

import { CheckCircle2, FileText, Shield, AlertTriangle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const GUIDELINES = [
    {
        icon: Shield,
        title: "Membership Eligibility",
        content: "Applicants must be a legally registered business entity. Sole proprietors, corporations, LLCs, and partnerships are eligible. All principals must pass identity and background verification.",
        tag: "Required",
        tagColor: "bg-red-100 text-red-700 border-red-200",
    },
    {
        icon: Clock,
        title: "Reporting Frequency",
        content: "Monthly reporting is mandatory. Data must be submitted within 30 days of each cycle. Experian reserves the right to suspend membership for consistent non-compliance.",
        tag: "Monthly",
        tagColor: "bg-blue-100 text-blue-700 border-blue-200",
    },
    {
        icon: FileText,
        title: "Data Format",
        content: "All commercial data must be submitted in Metro 2® format. Experian does not accept ad-hoc or proprietary formats without prior written approval.",
        tag: "Metro 2",
        tagColor: "bg-indigo-100 text-indigo-700 border-indigo-200",
    },
    {
        icon: CheckCircle2,
        title: "Dispute Resolution Required",
        content: "Members must maintain a documented dispute resolution procedure accessible to all reported business owners and guarantors. Proof may be requested during review.",
        tag: "Mandatory",
        tagColor: "bg-red-100 text-red-700 border-red-200",
    },
    {
        icon: AlertTriangle,
        title: "Prohibited Practices",
        content: "Experian does not accept tradeline rental services, pay-for-reporting schemes, or data from entities without direct lending relationships to reported accounts.",
        tag: "Restriction",
        tagColor: "bg-amber-100 text-amber-700 border-amber-200",
    },
    {
        icon: Shield,
        title: "Residential Address Verification",
        content: "Experian requires confirmation that company addresses are commercial — not residential — locations. Applications using residential addresses require additional documentation.",
        tag: "Verification",
        tagColor: "bg-purple-100 text-purple-700 border-purple-200",
    },
]

export function ExperianStep1Guidelines() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-slate-900">Step 1: Experian Membership Requirements</h2>
                    <p className="text-sm text-slate-500 mt-1">Review all participation standards. No input is required on this step.</p>
                </div>
                <Button variant="outline" size="sm" className="gap-2 print:hidden" onClick={() => window.print()}>
                    Download / Print
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {GUIDELINES.map((g, i) => (
                    <Card key={i} className="border border-slate-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center justify-between gap-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <g.icon className="h-4 w-4 text-slate-400" />
                                    {g.title}
                                </div>
                                <Badge className={`text-[10px] shrink-0 ${g.tagColor}`}>{g.tag}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-600 leading-relaxed">{g.content}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="p-4 bg-slate-900 rounded-xl text-xs text-slate-300 leading-relaxed">
                <span className="font-bold text-white">Requirement Tag: </span>
                <span className="font-mono text-violet-300">EXPERIAN_MEMBERSHIP_APP</span> — The AI Brain will audit submitted data against these standards before forwarding to Experian.
            </div>
        </div>
    )
}
