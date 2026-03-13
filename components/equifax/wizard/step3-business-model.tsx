"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Props { data: any; onChange: (field: string, value: any) => void }

export function Step3BusinessModel({ data, onChange }: Props) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-black text-slate-900">Step 3: Business Model Information</h2>
                <p className="text-sm text-slate-500 mt-1">Help Equifax understand how your company operates and serves customers.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-5">
                <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        How does your company acquire customers? <span className="text-red-500">*</span>
                    </Label>
                    <Select value={data.customer_acquisition_method || ""} onValueChange={v => onChange("customer_acquisition_method", v)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select primary method" />
                        </SelectTrigger>
                        <SelectContent>
                            {[
                                "Direct marketing / outbound sales",
                                "Referrals / word of mouth",
                                "Online / digital advertising",
                                "Broker / agent network",
                                "Branch / retail locations",
                                "Partnerships / white-label",
                                "Other"
                            ].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <div className="border border-slate-100 rounded-xl p-4 space-y-4 bg-slate-50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-slate-800">Dispute Procedures Exist <span className="text-red-500">*</span></p>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Equifax requires a documented dispute resolution process for business owners and guarantors.
                            </p>
                        </div>
                        <Switch
                            checked={data.has_dispute_procedures ?? false}
                            onCheckedChange={v => onChange("has_dispute_procedures", v)}
                        />
                    </div>

                    {data.has_dispute_procedures && (
                        <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1">
                            <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                Describe your dispute resolution process <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                placeholder="Describe how customers submit disputes, who handles them, and your typical resolution timeline..."
                                className="min-h-[120px] resize-none"
                                value={data.dispute_resolution_description || ""}
                                onChange={e => onChange("dispute_resolution_description", e.target.value)}
                            />
                        </div>
                    )}

                    {data.has_dispute_procedures === false && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 animate-in fade-in">
                            ⚠️ A dispute procedure is required by Equifax. Your application may be flagged for manual review without one.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
