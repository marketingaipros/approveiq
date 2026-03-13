"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

interface Props { data: any; onChange: (field: string, value: any) => void }

export function ExperianStep4Affiliated({ data, onChange }: Props) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-black text-slate-900">Step 4: Affiliated & Parent Company Info</h2>
                <p className="text-sm text-slate-500 mt-1">
                    Experian requires disclosure of any parent company or affiliated entities that may share accounts or data.
                </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-5">
                {/* Parent company toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <div>
                        <p className="text-sm font-semibold text-slate-800">Does your company have a parent company?</p>
                        <p className="text-xs text-slate-500 mt-0.5">A company that owns 50% or more of your business entity.</p>
                    </div>
                    <Switch
                        checked={data.has_parent_company ?? false}
                        onCheckedChange={v => onChange("has_parent_company", v)}
                    />
                </div>

                {data.has_parent_company && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-1">
                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b pb-2">Parent Company Details</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                    Parent Company Name <span className="text-red-500">*</span>
                                </Label>
                                <Input placeholder="Parent Corp LLC" value={data.parent_company_name || ""} onChange={e => onChange("parent_company_name", e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Parent Company Address</Label>
                                <Input placeholder="Full address" value={data.parent_company_address || ""} onChange={e => onChange("parent_company_address", e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Parent Equifax Member ID</Label>
                                <Input placeholder="If applicable" value={data.parent_company_equifax_id || ""} onChange={e => onChange("parent_company_equifax_id", e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Parent Experian Member ID</Label>
                                <Input placeholder="If applicable" value={data.parent_company_experian_id || ""} onChange={e => onChange("parent_company_experian_id", e.target.value)} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Affiliated companies */}
                <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Affiliated Companies
                    </Label>
                    <p className="text-xs text-slate-400">
                        List any subsidiaries or affiliated entities that will contribute data under this membership.
                    </p>
                    <Textarea
                        placeholder="Company A (subsidiary), Company B (joint venture)..."
                        className="resize-none min-h-[100px]"
                        value={data.affiliated_companies || ""}
                        onChange={e => onChange("affiliated_companies", e.target.value)}
                    />
                </div>
            </div>
        </div>
    )
}
