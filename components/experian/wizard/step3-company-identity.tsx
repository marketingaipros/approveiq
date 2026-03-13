"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

interface Props { data: any; onChange: (field: string, value: any) => void }

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {label}{required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {hint && <p className="text-xs text-slate-400">{hint}</p>}
            {children}
        </div>
    )
}

export function ExperianStep3CompanyIdentity({ data, onChange }: Props) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-black text-slate-900">Step 3: Company Identity</h2>
                <p className="text-sm text-slate-500 mt-1">Experian-specific business details not covered by your company profile.</p>
            </div>

            {/* Business Identity */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b pb-2">Business Details</h3>

                <div className="grid gap-4 md:grid-cols-2">
                    <Field label="DBA (Doing Business As)" hint="Leave blank if operating under legal name">
                        <Input placeholder="Other trading name" value={data.dba_name || ""} onChange={e => onChange("dba_name", e.target.value)} />
                    </Field>
                    <Field label="Years in Business" required>
                        <Input placeholder="e.g. 7" value={data.years_in_business || ""} onChange={e => onChange("years_in_business", e.target.value)} />
                    </Field>
                    <Field label="Type of Ownership" required>
                        <Select value={data.ownership_type || ""} onValueChange={v => onChange("ownership_type", v)}>
                            <SelectTrigger><SelectValue placeholder="Select structure" /></SelectTrigger>
                            <SelectContent>
                                {[
                                    "Sole Proprietorship",
                                    "General Partnership",
                                    "Limited Partnership",
                                    "LLC (Single-Member)",
                                    "LLC (Multi-Member)",
                                    "S-Corporation",
                                    "C-Corporation",
                                    "Non-Profit",
                                    "Other"
                                ].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </Field>
                    <Field label="Tax ID (EIN)" required>
                        <Input placeholder="XX-XXXXXXX" value={data.tax_id || ""} onChange={e => onChange("tax_id", e.target.value)} />
                    </Field>
                    <Field label="State of Incorporation">
                        <Input placeholder="e.g. Delaware" value={data.state_of_incorporation || ""} onChange={e => onChange("state_of_incorporation", e.target.value)} />
                    </Field>
                </div>
            </div>

            {/* Physical Location */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b pb-2">Physical Location</h3>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <Field label="Business Street Address" required>
                            <Input placeholder="123 Commerce Blvd" value={data.street_address || ""} onChange={e => onChange("street_address", e.target.value)} />
                        </Field>
                    </div>
                    <Field label="City" required>
                        <Input placeholder="Atlanta" value={data.city || ""} onChange={e => onChange("city", e.target.value)} />
                    </Field>
                    <div className="grid grid-cols-2 gap-2">
                        <Field label="State" required>
                            <Input placeholder="GA" value={data.state || ""} onChange={e => onChange("state", e.target.value)} />
                        </Field>
                        <Field label="ZIP" required>
                            <Input placeholder="30301" value={data.zip || ""} onChange={e => onChange("zip", e.target.value)} />
                        </Field>
                    </div>
                    <Field label="Lease or Own?" required>
                        <Select value={data.lease_or_own || ""} onValueChange={v => onChange("lease_or_own", v)}>
                            <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="own">Own</SelectItem>
                                <SelectItem value="lease">Lease</SelectItem>
                                <SelectItem value="virtual">Virtual / Remote</SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>
                    <Field label="How Long at This Location?">
                        <Input placeholder="e.g. 3 years" value={data.how_long_at_location || ""} onChange={e => onChange("how_long_at_location", e.target.value)} />
                    </Field>
                </div>

                {/* Residential Address Check — Experian Specific */}
                <div className="border border-amber-100 bg-amber-50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-amber-900">Residential Address Check</p>
                            <p className="text-xs text-amber-700 mt-0.5">
                                Is this a residential address? Experian requires commercial location confirmation.
                            </p>
                        </div>
                        <Switch
                            checked={data.residential_address_check ?? false}
                            onCheckedChange={v => onChange("residential_address_check", v)}
                        />
                    </div>
                    {data.residential_address_check && (
                        <div className="space-y-1.5 animate-in fade-in">
                            <Label className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Explanation</Label>
                            <Textarea
                                placeholder="Explain why the business operates from this residential address and provide any supporting documentation available..."
                                className="min-h-[80px] resize-none border-amber-200"
                                value={data.residential_address_note || ""}
                                onChange={e => onChange("residential_address_note", e.target.value)}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
