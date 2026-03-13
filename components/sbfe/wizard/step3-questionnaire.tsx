"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertTriangle } from "lucide-react"

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

export function SBFEStep3Questionnaire({ data, onChange }: Props) {
    const otherBureaus: string[] = data.other_bureaus_reporting || []

    const toggleBureau = (val: string) => {
        const next = otherBureaus.includes(val)
            ? otherBureaus.filter(v => v !== val)
            : [...otherBureaus, val]
        onChange("other_bureaus_reporting", next)
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-black text-slate-900">Step 3: SBFE-Specific Questionnaire</h2>
                <p className="text-sm text-slate-500 mt-1">
                    Complete the following questions specific to SBFE membership eligibility and governance.
                </p>
            </div>

            {/* Primary Reason for Joining — new intake field */}
            <div className="bg-white border border-violet-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-violet-100 pb-2">
                    <span className="text-xs font-mono bg-violet-100 text-violet-700 px-2 py-0.5 rounded">SBFE_GOVERNANCE</span>
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Primary Reason for Joining SBFE</h3>
                </div>
                <Field label="Primary Reason for Joining SBFE" required hint="Select the primary business objective driving your SBFE membership application.">
                    <Select value={data.primary_reason_for_joining || ""} onValueChange={v => onChange("primary_reason_for_joining", v)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select primary reason" />
                        </SelectTrigger>
                        <SelectContent>
                            {[
                                "Improve underwriting accuracy for small business loans",
                                "Reduce default risk and portfolio losses",
                                "Fulfill regulatory or investor reporting requirements",
                                "Benchmark portfolio performance against industry peers",
                                "Expand access to small business credit data",
                                "Support SBA lending program requirements",
                                "Other",
                            ].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </Field>
            </div>

            {/* Eligibility Verification */}
            <div className="bg-white border border-blue-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-blue-100 pb-2">
                    <span className="text-xs font-mono bg-blue-100 text-blue-700 px-2 py-0.5 rounded">LENDER_VERIFICATION</span>
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Eligibility Verification</h3>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                        <div>
                            <p className="text-sm font-semibold text-slate-800">
                                We are a small-business credit originator or processor <span className="text-red-500">*</span>
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">Banks, credit unions, non-bank lenders, SBA lenders, commercial finance companies</p>
                        </div>
                        <Switch checked={data.is_small_business_originator ?? false} onCheckedChange={v => onChange("is_small_business_originator", v)} />
                    </div>

                    {data.is_small_business_originator === false && (
                        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg animate-in fade-in">
                            <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-red-700">SBFE membership requires being an originator or processor of small-business credit. This application may not qualify.</p>
                        </div>
                    )}

                    <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                        <div>
                            <p className="text-sm font-semibold text-slate-800">Our company provides trade credit</p>
                            <p className="text-xs text-slate-500 mt-0.5">e.g. net-30 accounts between businesses for goods or services</p>
                        </div>
                        <Switch checked={data.does_trade_credit ?? false} onCheckedChange={v => onChange("does_trade_credit", v)} />
                    </div>

                    {data.does_trade_credit && (
                        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg animate-in fade-in">
                            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-700">Trade credit providers are excluded from SBFE membership. If trade credit is your primary business, this application will require manual review.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Volume & Dues */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                    <span className="text-xs font-mono bg-violet-100 text-violet-700 px-2 py-0.5 rounded">SBFE_GOVERNANCE</span>
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Account Volume & Dues</h3>
                </div>

                <Field label="Estimated Annual Small-Business Account Volume" required hint="Used to determine your annual dues tier">
                    <Select value={data.annual_account_volume || ""} onValueChange={v => onChange("annual_account_volume", v)}>
                        <SelectTrigger><SelectValue placeholder="Select volume tier" /></SelectTrigger>
                        <SelectContent>
                            {[
                                "Less than 1,000 accounts",
                                "1,000 – 10,000 accounts",
                                "10,001 – 50,000 accounts",
                                "50,001 – 250,000 accounts",
                                "More than 250,000 accounts",
                            ].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </Field>

                <Field label="Currently Reporting to Other Bureaus">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
                        {["Equifax", "Experian", "TransUnion", "D&B", "Creditsafe", "None"].map(b => (
                            <label key={b} className="flex items-center gap-2 text-sm cursor-pointer">
                                <Checkbox checked={otherBureaus.includes(b)} onCheckedChange={() => toggleBureau(b)} />
                                {b}
                            </label>
                        ))}
                    </div>
                </Field>
            </div>

            {/* Data Transmission */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b pb-2">Data Transmission</h3>
                <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Transmission Method" required>
                        <Select value={data.data_transmission_method || ""} onValueChange={v => onChange("data_transmission_method", v)}>
                            <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="sftp">SFTP (Direct)</SelectItem>
                                <SelectItem value="third_party">3rd Party Processor</SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>
                    {data.data_transmission_method === "third_party" && (
                        <Field label="Processor Name">
                            <Input placeholder="Processor company name" value={data.third_party_processor_name || ""} onChange={e => onChange("third_party_processor_name", e.target.value)} />
                        </Field>
                    )}
                </div>

                {/* Data Use Certification */}
                <div className="mt-2">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <Checkbox
                            className="mt-0.5"
                            checked={data.data_use_certification ?? false}
                            onCheckedChange={v => onChange("data_use_certification", Boolean(v))}
                        />
                        <span className="text-sm text-slate-600 leading-relaxed">
                            <span className="font-semibold text-slate-800">Data Use Certification: </span>
                            I confirm that SBFE data will be used exclusively for credit underwriting, risk management, and portfolio monitoring — not for marketing, solicitation, or any non-credit purpose.{" "}
                            <span className="font-mono text-[10px] text-violet-500">SBFE_GOVERNANCE</span>
                        </span>
                    </label>
                    {data.data_use_certification === false && (
                        <p className="text-xs text-red-600 mt-2 pl-6">This certification is required to proceed.</p>
                    )}
                </div>
            </div>
        </div>
    )
}
