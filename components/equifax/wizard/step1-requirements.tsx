"use client"

import { Download, CheckCircle2, AlertTriangle, Clock, FileText, Users, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const REQUIREMENTS = [
    {
        icon: Users,
        title: "Minimum Record Requirement",
        content: "Contributors must submit a minimum of 500 active account records. Applicants with fewer than 500 records must provide a valid lending license to qualify.",
        tag: "500+ Records",
        tagColor: "bg-amber-100 text-amber-700 border-amber-200",
    },
    {
        icon: Clock,
        title: "Reporting Frequency",
        content: "Data must be submitted on a monthly cycle — every 30 days. Equifax does not accept irregular or one-time submissions for commercial contributors.",
        tag: "Monthly",
        tagColor: "bg-blue-100 text-blue-700 border-blue-200",
    },
    {
        icon: FileText,
        title: "Data Format Requirements",
        content: "All data submissions must conform to Equifax CFN (Credit File Network) format for commercial accounts, or Metro 2® format where applicable. A sample file may be required during review.",
        tag: "CFN / Metro 2",
        tagColor: "bg-indigo-100 text-indigo-700 border-indigo-200",
    },
    {
        icon: CheckCircle2,
        title: "Dispute Procedures Required",
        content: "All contributors must have a documented dispute resolution procedure in place for business owners and guarantors. This policy must be provided during onboarding.",
        tag: "Required",
        tagColor: "bg-red-100 text-red-700 border-red-200",
    },
    {
        icon: BarChart3,
        title: "3-Month Historical Data Load",
        content: "New contributors are required to provide a minimum of 3 months of historical account data as part of the initial data load before live reporting begins.",
        tag: "Initial Load",
        tagColor: "bg-purple-100 text-purple-700 border-purple-200",
    },
    {
        icon: AlertTriangle,
        title: "Eligibility Restriction",
        content: "Equifax does not accept \"pay for tradeline\" furnishers. Applications from companies offering tradeline rental services to consumers will be declined.",
        tag: "Restriction",
        tagColor: "bg-red-100 text-red-700 border-red-200",
    },
]

export function Step1Requirements() {
    const handlePrint = () => window.print()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-slate-900">Step 1: Equifax Reporting Requirements</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Review all eligibility standards before completing your application. No input is required on this step.
                    </p>
                </div>
                <Button variant="outline" size="sm" className="gap-2 print:hidden" onClick={handlePrint}>
                    <Download className="h-4 w-4" />
                    Download / Print
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {REQUIREMENTS.map((req, i) => (
                    <Card key={i} className="border border-slate-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center justify-between gap-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <req.icon className="h-4 w-4 text-slate-400" />
                                    {req.title}
                                </div>
                                <Badge className={`text-[10px] ${req.tagColor} shrink-0`}>{req.tag}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-600 leading-relaxed">{req.content}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="p-4 bg-slate-900 rounded-xl text-xs text-slate-300 leading-relaxed">
                <span className="font-bold text-white">Note: </span>
                These requirements are set by Equifax&apos;s Commercial Data Contributor program (2023 guidelines). They are informational only — you do not need to upload anything in this step. Your application will be reviewed against these standards by our compliance team before submission to Equifax.
            </div>
        </div>
    )
}
