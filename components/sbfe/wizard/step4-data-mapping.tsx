"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { DollarSign, ShieldCheck, AlertCircle } from "lucide-react"

interface Props { data: any; onChange: (field: string, value: any) => void }

function Field({ label, required, hint, tag, children }: { label: string; required?: boolean; hint?: string; tag?: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <div className="flex items-center gap-2">
                <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    {label}{required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {tag && <span className="text-[9px] font-mono bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded">{tag}</span>}
            </div>
            {hint && <p className="text-xs text-slate-400">{hint}</p>}
            {children}
        </div>
    )
}

export function SBFEStep4DataMapping({ data, onChange }: Props) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-black text-slate-900">Step 4: Product Data Mapping</h2>
                <p className="text-sm text-slate-500 mt-1">
                    SBFE requires specific data points on your loan products, collateral practices, and charge-off procedures for Metro 2® reporting compliance.
                </p>
            </div>

            {/* ── Loan Product Details ── */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                    <DollarSign className="h-4 w-4 text-slate-400" />
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Loan Product Details</h3>
                    <Badge className="ml-auto text-[10px] font-mono bg-violet-100 text-violet-700 border-violet-200">SBFE_GOVERNANCE</Badge>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Primary Loan Product Type" required tag="SBFE_GOVERNANCE">
                        <Select value={data.sbfe_product_type || ""} onValueChange={v => onChange("sbfe_product_type", v)}>
                            <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                            <SelectContent>
                                {[
                                    "Term Loan",
                                    "Revolving Line of Credit",
                                    "SBA 7(a) Loan",
                                    "SBA 504 Loan",
                                    "Equipment Financing",
                                    "Commercial Real Estate Loan",
                                    "Merchant Cash Advance",
                                    "Invoice Factoring",
                                    "Microfinance Loan",
                                    "Other",
                                ].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </Field>

                    <Field label="Typical Loan Term" required>
                        <Select value={data.sbfe_loan_term || ""} onValueChange={v => onChange("sbfe_loan_term", v)}>
                            <SelectTrigger><SelectValue placeholder="Select term" /></SelectTrigger>
                            <SelectContent>
                                {["< 12 months", "12–24 months", "25–60 months", "61–120 months", "> 120 months", "Revolving / No Fixed Term"].map(t =>
                                    <SelectItem key={t} value={t}>{t}</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </Field>

                    <Field label="Minimum Loan Amount ($)">
                        <Input type="number" placeholder="e.g. 5000" value={data.sbfe_loan_min || ""} onChange={e => onChange("sbfe_loan_min", e.target.value)} />
                    </Field>
                    <Field label="Maximum Loan Amount ($)">
                        <Input type="number" placeholder="e.g. 500000" value={data.sbfe_loan_max || ""} onChange={e => onChange("sbfe_loan_max", e.target.value)} />
                    </Field>

                    <Field label="Average Loan Amount ($)">
                        <Input type="number" placeholder="e.g. 75000" value={data.sbfe_loan_avg || ""} onChange={e => onChange("sbfe_loan_avg", e.target.value)} />
                    </Field>

                    <Field label="Interest Rate Type">
                        <Select value={data.sbfe_rate_type || ""} onValueChange={v => onChange("sbfe_rate_type", v)}>
                            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="fixed">Fixed Rate</SelectItem>
                                <SelectItem value="variable">Variable Rate</SelectItem>
                                <SelectItem value="mixed">Mixed</SelectItem>
                                <SelectItem value="factor">Factor Rate (MCA)</SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>
                </div>
            </div>

            {/* ── Collateral Information ── SBFE Required */}
            <div className="bg-white border border-blue-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-blue-100 pb-2">
                    <ShieldCheck className="h-4 w-4 text-blue-500" />
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Collateral Information</h3>
                    <Badge className="ml-auto text-[10px] font-mono bg-blue-100 text-blue-700 border-blue-200">LENDER_VERIFICATION</Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Field
                        label="Collateral Requirements"
                        required
                        hint="Specify whether loans require collateral — SBFE uses this for Metro 2® account type classification."
                    >
                        <Select value={data.collateral_requirement || ""} onValueChange={v => onChange("collateral_requirement", v)}>
                            <SelectTrigger><SelectValue placeholder="Select policy" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="always_required">Always Required</SelectItem>
                                <SelectItem value="risk_based">Risk-Based (Case by Case)</SelectItem>
                                <SelectItem value="unsecured">Unsecured Only</SelectItem>
                                <SelectItem value="mixed">Mixed Portfolio</SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>

                    <Field label="Primary Collateral Type" hint="Most common collateral accepted">
                        <Select value={data.collateral_type || ""} onValueChange={v => onChange("collateral_type", v)}>
                            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                            <SelectContent>
                                {[
                                    "Real Estate",
                                    "Equipment / Machinery",
                                    "Accounts Receivable",
                                    "Inventory",
                                    "Personal Guarantee",
                                    "UCC Blanket Lien",
                                    "SBA Guarantee",
                                    "N/A — Unsecured",
                                ].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </Field>
                </div>

                <Field label="Collateral Valuation Method" hint="How do you determine the value of collateral at loan origination?">
                    <Select value={data.collateral_valuation_method || ""} onValueChange={v => onChange("collateral_valuation_method", v)}>
                        <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="third_party_appraisal">3rd Party Appraisal</SelectItem>
                            <SelectItem value="internal">Internal Assessment</SelectItem>
                            <SelectItem value="automated">Automated Valuation Model (AVM)</SelectItem>
                            <SelectItem value="market_value">Market Value / Invoice</SelectItem>
                            <SelectItem value="na">N/A — Unsecured</SelectItem>
                        </SelectContent>
                    </Select>
                </Field>

                <Field label="Personal Guarantee Required?">
                    <div className="flex items-center gap-3 mt-1">
                        <Switch
                            checked={data.personal_guarantee_required ?? false}
                            onCheckedChange={v => onChange("personal_guarantee_required", v)}
                        />
                        <span className="text-sm text-slate-600">
                            {data.personal_guarantee_required ? "Yes — personal guarantee is required" : "No personal guarantee required"}
                        </span>
                    </div>
                </Field>
            </div>

            {/* ── Charge-Off Procedures ── SBFE Required */}
            <div className="bg-white border border-red-100 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-red-100 pb-2">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Charge-Off Procedures</h3>
                    <Badge className="ml-auto text-[10px] font-mono bg-violet-100 text-violet-700 border-violet-200">SBFE_GOVERNANCE</Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Field
                        label="Charge-Off Policy (Days Past Due)"
                        required
                        hint="At what point (days past due) does your institution charge off a delinquent small business loan?"
                        tag="SBFE_GOVERNANCE"
                    >
                        <Select value={data.charge_off_days_policy || ""} onValueChange={v => onChange("charge_off_days_policy", v)}>
                            <SelectTrigger><SelectValue placeholder="Select threshold" /></SelectTrigger>
                            <SelectContent>
                                {["90 days", "120 days", "150 days", "180 days", "270 days", "360 days", "Custom / Policy-Based"].map(d =>
                                    <SelectItem key={d} value={d}>{d}</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </Field>

                    <Field
                        label="Charge-Off Recovery Reporting"
                        hint="Do you report recoveries after charge-off back to credit bureaus?"
                    >
                        <Select value={data.charge_off_recovery_reporting || ""} onValueChange={v => onChange("charge_off_recovery_reporting", v)}>
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="yes_monthly">Yes — reported monthly</SelectItem>
                                <SelectItem value="yes_on_receipt">Yes — reported on receipt</SelectItem>
                                <SelectItem value="no">No — not reported</SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>

                    <Field label="Typical Charge-Off Rate (Annual %)" hint="Approximate annual charge-off rate for your small business portfolio">
                        <Input type="number" placeholder="e.g. 2.5" value={data.charge_off_rate_pct || ""} onChange={e => onChange("charge_off_rate_pct", e.target.value)} />
                    </Field>

                    <Field label="Average Recovery Rate (%)" hint="What percentage of charged-off balances are typically recovered?">
                        <Input type="number" placeholder="e.g. 15" value={data.charge_off_recovery_rate_pct || ""} onChange={e => onChange("charge_off_recovery_rate_pct", e.target.value)} />
                    </Field>
                </div>

                <Field
                    label="Charge-Off Notes / Exceptions"
                    hint="Describe any exceptions to your standard charge-off policy (e.g. SBA guaranteed loans, litigation holds)"
                >
                    <Textarea
                        placeholder="e.g. SBA guaranteed loans are charged off at 365 days per SBA SOP 50 57. Loans in active litigation are placed on hold pending resolution."
                        className="resize-none min-h-[90px]"
                        value={data.charge_off_notes || ""}
                        onChange={e => onChange("charge_off_notes", e.target.value)}
                    />
                </Field>
            </div>
        </div>
    )
}
