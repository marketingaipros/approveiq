"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertTriangle, ShieldAlert, Brain } from "lucide-react"
import { Badge } from "@/components/ui/badge"

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

            {/* ── Primary Reason for Joining — MANDATORY TEXT FIELD ── */}
            <div className="bg-white border border-violet-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-violet-100 pb-2">
                    <span className="text-xs font-mono bg-violet-100 text-violet-700 px-2 py-0.5 rounded">SBFE_GOVERNANCE</span>
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Primary Reason for Joining SBFE</h3>
                </div>
                <Field
                    label="Primary Reason for Joining SBFE"
                    required
                    hint="Describe in your own words the primary business objective driving your SBFE membership application."
                >
                    <Textarea
                        placeholder="e.g. We originate SBA 7(a) loans and need access to small-business credit data to improve underwriting accuracy and reduce portfolio default risk."
                        className="resize-none min-h-[100px]"
                        value={data.primary_reason_for_joining || ""}
                        onChange={e => onChange("primary_reason_for_joining", e.target.value)}
                    />
                    {!data.primary_reason_for_joining && (
                        <p className="text-xs text-red-500 mt-1">This field is required before submission.</p>
                    )}
                </Field>
            </div>

            {/* ── AI Auditor: Trade Credit Verification ── */}
            <div className="bg-white border border-blue-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-blue-100 pb-2">
                    <Badge className="text-[10px] bg-blue-100 text-blue-700 border-blue-200 font-mono">LENDER_VERIFICATION</Badge>
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Eligibility Verification</h3>
                    <div className="ml-auto flex items-center gap-1 text-[10px] text-violet-600 font-mono">
                        <Brain className="h-3 w-3" /> AI Auditor Active
                    </div>
                </div>

                <div className="space-y-3">
                    {/* Originator toggle */}
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
                            <ShieldAlert className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs text-red-700 font-semibold">AI Auditor: Eligibility Failure</p>
                                <p className="text-xs text-red-600 mt-0.5">SBFE membership requires being an originator or processor of small-business credit. Rule: <span className="font-mono">LENDER_VERIFICATION</span>. This application will be flagged for manual review.</p>
                            </div>
                        </div>
                    )}

                    {/* Trade credit detection — AI Auditor checks this */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                        <div>
                            <p className="text-sm font-semibold text-slate-800">Our company provides trade credit</p>
                            <p className="text-xs text-slate-500 mt-0.5">e.g. net-30 accounts between businesses for goods or services (NOT financial lending)</p>
                        </div>
                        <Switch checked={data.does_trade_credit ?? false} onCheckedChange={v => onChange("does_trade_credit", v)} />
                    </div>

                    {data.does_trade_credit && (
                        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg animate-in fade-in">
                            <Brain className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs text-amber-800 font-semibold">AI Auditor: Trade Credit Detected</p>
                                <p className="text-xs text-amber-700 mt-0.5">
                                    Rule <span className="font-mono">LENDER_VERIFICATION</span>: SBFE excludes trade credit providers from membership. The AI Brain will flag this application and require your compliance team to certify that trade credit is not your primary business before submission is forwarded to SBFE.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* AI Auditor trade credit self-certification (only shown when trade credit is true) */}
                    {data.does_trade_credit && (
                        <div className="p-4 bg-white border border-amber-200 rounded-xl space-y-2 animate-in fade-in">
                            <Field
                                label="Trade Credit Context — AI Auditor Required"
                                required
                                hint="Describe what percentage of your portfolio is trade credit vs. financial lending, and confirm SBFE data will only be used for your lending book."
                            >
                                <Textarea
                                    placeholder="e.g. Trade credit represents ~10% of our portfolio. We primarily originate term loans and revolving credit lines. SBFE data will only be applied to our regulated lending portfolio."
                                    className="resize-none min-h-[90px] border-amber-200"
                                    value={data.trade_credit_context || ""}
                                    onChange={e => onChange("trade_credit_context", e.target.value)}
                                />
                            </Field>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Volume & Dues ── */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                    <Badge className="text-[10px] bg-violet-100 text-violet-700 border-violet-200 font-mono">MONTHLY_CONTRIBUTION</Badge>
                    <Badge className="text-[10px] bg-violet-100 text-violet-700 border-violet-200 font-mono">SBFE_GOVERNANCE</Badge>
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

            {/* ── Data Transmission ── */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                    <Badge className="text-[10px] bg-violet-100 text-violet-700 border-violet-200 font-mono">MONTHLY_CONTRIBUTION</Badge>
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Data Transmission</h3>
                </div>
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

                <label className="flex items-start gap-3 cursor-pointer">
                    <Checkbox
                        className="mt-0.5"
                        checked={data.data_use_certification ?? false}
                        onCheckedChange={v => onChange("data_use_certification", Boolean(v))}
                    />
                    <span className="text-sm text-slate-600 leading-relaxed">
                        <span className="font-semibold text-slate-800">Data Use Certification: </span>
                        I confirm that SBFE data will be used exclusively for credit underwriting, risk management, and portfolio monitoring.{" "}
                        <span className="font-mono text-[10px] text-violet-500">SBFE_GOVERNANCE</span>
                    </span>
                </label>
            </div>
        </div>
    )
}
