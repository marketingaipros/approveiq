"use client"

import { Badge } from "@/components/ui/badge"
import { Building2, Users, ArrowRight } from "lucide-react"

interface Props { data: any; onChange: (field: string, value: any) => void }

export function DNBStep3Intent({ data, onChange }: Props) {
    const selected = data.intent || ""

    const options = [
        {
            value: "reporting_customers",
            icon: Users,
            title: "I want to Report on My Customers",
            description: "You have existing B2B customers with active accounts and want to contribute payment history data to the D&B commercial database.",
            requirements: [
                "20–50 active B2B customer accounts",
                "Monthly data submission",
                "Customer D-U-N-S numbers (or match assistance)",
            ],
            tags: ["DNB_REPORTING", "MONTHLY_CONTRIBUTION"],
            color: "border-blue-400 bg-blue-50 ring-blue-500",
            selectedColor: "border-blue-500 bg-blue-50 ring-2 ring-blue-400",
            tagColor: "bg-blue-100 text-blue-700",
        },
        {
            value: "building_credit",
            icon: Building2,
            title: "I want to Build Business Credit",
            description: "You want to establish or improve your D&B business credit file using your trade relationships and vendor accounts.",
            requirements: [
                "3–4 active B2B trade references",
                "Credit limits of $500–$1,000 per reference",
                "References must be B2B (no personal accounts)",
            ],
            tags: ["DNB_CREDIT_BUILDING"],
            color: "border-violet-400 bg-violet-50 ring-violet-500",
            selectedColor: "border-violet-500 bg-violet-50 ring-2 ring-violet-400",
            tagColor: "bg-violet-100 text-violet-700",
        },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-black text-slate-900">Step 3: What is Your Primary Intent?</h2>
                <p className="text-sm text-slate-500 mt-1">
                    Select your goal — D&B workflows are different depending on whether you are building credit or reporting on customers.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {options.map(opt => (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => onChange("intent", opt.value)}
                        className={`text-left rounded-2xl border-2 p-6 space-y-4 transition-all duration-200 hover:shadow-md ${
                            selected === opt.value ? opt.selectedColor : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className={`p-3 rounded-xl ${selected === opt.value ? "bg-white shadow-sm" : "bg-slate-100"}`}>
                                <opt.icon className="h-5 w-5 text-slate-600" />
                            </div>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                                {opt.tags.map(t => (
                                    <Badge key={t} className={`text-[10px] font-mono ${opt.tagColor} border-0`}>{t}</Badge>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-base font-black text-slate-900 leading-tight">{opt.title}</h3>
                            <p className="text-sm text-slate-500 mt-1 leading-relaxed">{opt.description}</p>
                        </div>

                        <ul className="space-y-1">
                            {opt.requirements.map((r, i) => (
                                <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                                    <ArrowRight className="h-3 w-3 text-slate-400 shrink-0" />
                                    {r}
                                </li>
                            ))}
                        </ul>

                        {selected === opt.value && (
                            <div className="pt-2 text-xs font-bold text-emerald-600 flex items-center gap-1.5 animate-in fade-in">
                                ✓ Selected — continue to Step 4 for the required fields
                            </div>
                        )}
                    </button>
                ))}
            </div>

            {!selected && (
                <p className="text-center text-xs text-slate-400">Select one option to continue to Step 4.</p>
            )}
        </div>
    )
}
