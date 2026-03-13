"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

export function Step4Products({ data, onChange }: Props) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-black text-slate-900">Step 4: Product & Service Information</h2>
                <p className="text-sm text-slate-500 mt-1">Describe the financial products or services your company offers to customers.</p>
            </div>

            {/* Product Type */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b pb-2">Product Details</h3>

                <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Product Type" required>
                        <Select value={data.product_type || ""} onValueChange={v => onChange("product_type", v)}>
                            <SelectTrigger><SelectValue placeholder="Select product type" /></SelectTrigger>
                            <SelectContent>
                                {["Revolving Credit", "Installment Loan", "Secured Loan", "Lease", "Line of Credit", "Other"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </Field>

                    <Field label="Repayment Terms" required>
                        <Select value={data.repayment_terms || ""} onValueChange={v => onChange("repayment_terms", v)}>
                            <SelectTrigger><SelectValue placeholder="Select terms" /></SelectTrigger>
                            <SelectContent>
                                {["Weekly", "Bi-Weekly", "Monthly", "Quarterly", "Annually", "Custom"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </Field>

                    <Field label="Duration (months)" required hint="Average account term length">
                        <Input
                            type="number"
                            placeholder="e.g. 24"
                            value={data.duration_months || ""}
                            onChange={e => onChange("duration_months", parseInt(e.target.value) || "")}
                        />
                    </Field>

                    <Field label="Method of Payment" required>
                        <Select value={data.payment_method || ""} onValueChange={v => onChange("payment_method", v)}>
                            <SelectTrigger><SelectValue placeholder="Select payment method" /></SelectTrigger>
                            <SelectContent>
                                {["ACH / Direct Debit", "Check", "Credit Card", "Debit Card", "Wire Transfer", "Mixed"].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Minimum Loan / Credit Limit" required>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                            <Input
                                type="number"
                                className="pl-7"
                                placeholder="500"
                                value={data.loan_amount_min || ""}
                                onChange={e => onChange("loan_amount_min", parseFloat(e.target.value) || "")}
                            />
                        </div>
                    </Field>
                    <Field label="Maximum Loan / Credit Limit" required>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                            <Input
                                type="number"
                                className="pl-7"
                                placeholder="50000"
                                value={data.loan_amount_max || ""}
                                onChange={e => onChange("loan_amount_max", parseFloat(e.target.value) || "")}
                            />
                        </div>
                    </Field>
                </div>

                {data.product_type === "Secured Loan" && (
                    <Field label="Collateral Description" hint="Describe the assets used as collateral">
                        <Textarea
                            placeholder="e.g. Business equipment, real property, vehicles..."
                            className="resize-none min-h-[80px]"
                            value={data.collateral_description || ""}
                            onChange={e => onChange("collateral_description", e.target.value)}
                        />
                    </Field>
                )}

                <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50">
                    <div>
                        <p className="text-sm font-semibold text-slate-800">Membership or Reporting Fees?</p>
                        <p className="text-xs text-slate-500">Do customers pay fees to access your product or service?</p>
                    </div>
                    <Switch
                        checked={data.has_membership_fees ?? false}
                        onCheckedChange={v => onChange("has_membership_fees", v)}
                    />
                </div>
            </div>

            {/* Volume Projections */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b pb-2">Volume Projections</h3>
                <p className="text-xs text-slate-500">
                    Equifax requires a minimum of 500 records for initial contribution. If below 500, a lending license is required.
                </p>
                <div className="grid gap-4 md:grid-cols-3">
                    <Field label="Estimated Initial Records" required hint="Number of accounts at first submission">
                        <Input
                            type="number"
                            placeholder="e.g. 750"
                            value={data.estimated_initial_records || ""}
                            onChange={e => onChange("estimated_initial_records", parseInt(e.target.value) || "")}
                        />
                    </Field>
                    <Field label="Expected at 12 Months" hint="Projected total accounts">
                        <Input
                            type="number"
                            placeholder="e.g. 1200"
                            value={data.growth_12_months || ""}
                            onChange={e => onChange("growth_12_months", parseInt(e.target.value) || "")}
                        />
                    </Field>
                    <Field label="Expected at 24 Months" hint="Projected total accounts">
                        <Input
                            type="number"
                            placeholder="e.g. 2000"
                            value={data.growth_24_months || ""}
                            onChange={e => onChange("growth_24_months", parseInt(e.target.value) || "")}
                        />
                    </Field>
                </div>

                {data.estimated_initial_records > 0 && data.estimated_initial_records < 500 && !data.lending_license_number && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 animate-in fade-in">
                        ⚠️ Your initial record count is below 500. A lending license number (entered in Step 2) will be required for your application to proceed.
                    </div>
                )}
            </div>
        </div>
    )
}
