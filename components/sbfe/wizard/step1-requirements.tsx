"use client"

import { Shield, Clock, DollarSign, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const REQUIREMENTS = [
    {
        icon: Clock,
        title: "Mandatory Monthly Data Submission",
        content: "All SBFE members must submit small business credit data monthly, within 30 days of each reporting cycle. Consistent non-submission may result in membership suspension.",
        tag: "SBFE_GOVERNANCE",
        tagColor: "bg-violet-100 text-violet-700 border-violet-200",
    },
    {
        icon: Shield,
        title: "Small-Business Credit Originator or Processor Only",
        content: "Membership is restricted to entities that originate or process small-business credit. Trade credit providers (net-30 between businesses for goods/services) are explicitly excluded.",
        tag: "LENDER_VERIFICATION",
        tagColor: "bg-blue-100 text-blue-700 border-blue-200",
    },
    {
        icon: DollarSign,
        title: "Annual Dues Based on Account Volume",
        content: "Annual dues are tiered by total active small-business account volume. Dues are invoiced annually; failure to pay within 60 days may result in data access suspension.",
        tag: "SBFE_GOVERNANCE",
        tagColor: "bg-violet-100 text-violet-700 border-violet-200",
    },
    {
        icon: AlertTriangle,
        title: "Data Use Restricted to Credit / Risk Purposes Only",
        content: "SBFE data is exclusively licensed for credit underwriting, risk management, and portfolio monitoring. Use for marketing, solicitation, or resale is a material breach of the membership agreement and strictly prohibited.",
        tag: "SBFE_GOVERNANCE",
        tagColor: "bg-violet-100 text-violet-700 border-violet-200",
    },
]

export function SBFEStep1Requirements() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-slate-900">Step 1: SBFE Participation Requirements</h2>
                    <p className="text-sm text-slate-500 mt-1">Review all membership standards. No input is required on this step.</p>
                </div>
                <Button variant="outline" size="sm" className="gap-2 print:hidden" onClick={() => window.print()}>
                    Download / Print
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {REQUIREMENTS.map((r, i) => (
                    <Card key={i} className="border border-slate-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center justify-between gap-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <r.icon className="h-4 w-4 text-slate-400" />
                                    {r.title}
                                </div>
                                <Badge className={`text-[10px] shrink-0 ${r.tagColor}`}>{r.tag}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-600 leading-relaxed">{r.content}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="p-4 bg-slate-900 rounded-xl text-xs leading-relaxed text-slate-300">
                <span className="font-bold text-white">Requirement Tags: </span>
                <span className="font-mono text-blue-300">LENDER_VERIFICATION</span>
                {" · "}
                <span className="font-mono text-violet-300">SBFE_GOVERNANCE</span>
                {" — These tags are used by the AI Brain to audit submitted applications against SBFE membership standards."}
            </div>
        </div>
    )
}
