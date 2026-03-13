"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, ShieldAlert, CheckCircle2, Brain } from "lucide-react"
import { PO_BOX_PATTERNS } from "@/lib/dnb-constants"

interface Props { data: any; org: any; onChange: (field: string, value: any) => void }

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

function detectAddressIssue(address: string): null | "po_box" | "residential" {
    if (PO_BOX_PATTERNS.some(p => p.test(address))) return "po_box"
    const residentialKeywords = /\b(apt|apartment|unit|suite\s*\d|#\d|floor\s*\d|\bflr\b|\b\d+(st|nd|rd|th)\s+fl\b|residence|home)\b/i
    if (residentialKeywords.test(address)) return "residential"
    return null
}

export function DNBStep2CompanyData({ data, org, onChange }: Props) {
    const address = data.business_address || org.address || ""
    const addressIssue = address ? detectAddressIssue(address) : null

    const handleAddressChange = (val: string) => {
        const issue = detectAddressIssue(val)
        onChange("business_address", val)
        onChange("address_ai_flag", issue === "po_box" ? "po_box_blocked" : issue === "residential" ? "residential_high_risk" : null)
        onChange("address_type", issue === "po_box" ? "po_box" : issue === "residential" ? "residential" : "commercial")
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-black text-slate-900">Step 2: Company Identity</h2>
                <p className="text-sm text-slate-500 mt-1">
                    Confirm your business details. Shared fields are pre-populated from your organization profile.
                </p>
            </div>

            {/* Pre-populated read-only org info */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Organization Profile (Read-Only)</h3>
                    <Badge className="ml-auto text-[10px] font-mono bg-slate-200 text-slate-600">auto-populated</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    {[
                        ["Company Name", org.name],
                        ["Website", org.website],
                        ["Primary Phone", org.phone],
                    ].map(([label, val]) => (
                        <div key={label}>
                            <p className="text-xs text-slate-400 font-medium">{label}</p>
                            <p className="text-slate-700 font-medium">{val || <span className="text-slate-300 italic">—</span>}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Entity Type + EIN */}
            <div className="bg-white border border-blue-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-blue-100 pb-2">
                    <Badge className="text-[10px] font-mono bg-blue-100 text-blue-700 border-blue-200">DNB_ELIGIBILITY</Badge>
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Entity & Tax ID</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Legal Entity Type" required hint="Sole proprietorships are ineligible">
                        <Select value={data.legal_entity_type || ""} onValueChange={v => onChange("legal_entity_type", v)}>
                            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="llc">LLC</SelectItem>
                                <SelectItem value="corporation">Corporation (C-Corp)</SelectItem>
                                <SelectItem value="s_corp">S-Corporation</SelectItem>
                                <SelectItem value="lp">Limited Partnership (LP)</SelectItem>
                                <SelectItem value="sole_prop">Sole Proprietorship ⚠</SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>

                    {data.legal_entity_type === "sole_prop" && (
                        <div className="md:col-span-2 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg animate-in fade-in">
                            <ShieldAlert className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs text-red-700 font-semibold">AI Auditor: Ineligible Entity Type</p>
                                <p className="text-xs text-red-600 mt-0.5">Sole proprietorships are not eligible for D&B business credit file establishment. Rule: <span className="font-mono">DNB_ELIGIBILITY</span>. Please restructure as an LLC or Corporation before proceeding.</p>
                            </div>
                        </div>
                    )}

                    <Field label="EIN (Employer Identification Number)" required hint="Do not enter an SSN">
                        <Input placeholder="XX-XXXXXXX" value={data.ein || org.ein || ""} onChange={e => onChange("ein", e.target.value)} />
                    </Field>

                    <Field label="Existing DUNS Number" hint="Leave blank if unknown — D&B will assign one">
                        <Input placeholder="9-digit DUNS" value={data.duns_number || ""} onChange={e => onChange("duns_number", e.target.value)} />
                    </Field>
                </div>
            </div>

            {/* Business Phone */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                    <Badge className="text-[10px] font-mono bg-violet-100 text-violet-700 border-violet-200">LENDER_VERIFICATION</Badge>
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Business Phone</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Business Phone Number" required>
                        <Input placeholder="(555) 000-0000" value={data.business_phone || org.phone || ""} onChange={e => onChange("business_phone", e.target.value)} />
                    </Field>
                    <Field label="Phone Type" required hint="Personal cell phones are not accepted">
                        <Select value={data.business_phone_type || ""} onValueChange={v => onChange("business_phone_type", v)}>
                            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="landline">Business Landline</SelectItem>
                                <SelectItem value="voip">Business VoIP</SelectItem>
                                <SelectItem value="cell">Cell Phone ⚠</SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>
                </div>
                {data.business_phone_type === "cell" && (
                    <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg animate-in fade-in">
                        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-700">Personal cell phones are not accepted by D&B. Please provide a business landline or VoIP number.</p>
                    </div>
                )}
            </div>

            {/* Commercial Address — AI Auditor Active */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                    <Badge className="text-[10px] font-mono bg-blue-100 text-blue-700 border-blue-200">DNB_ELIGIBILITY</Badge>
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Business Address</h3>
                    <div className="ml-auto flex items-center gap-1 text-[10px] text-violet-600 font-mono">
                        <Brain className="h-3 w-3" /> AI Auditor Active
                    </div>
                </div>

                <Field label="Street Address" required hint="Must be a commercial address — no PO Boxes">
                    <Input
                        placeholder="123 Commerce St"
                        value={data.business_address || org.address || ""}
                        onChange={e => handleAddressChange(e.target.value)}
                        className={addressIssue === "po_box" ? "border-red-400 bg-red-50" : addressIssue === "residential" ? "border-amber-400 bg-amber-50" : ""}
                    />
                </Field>

                {addressIssue === "po_box" && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-300 rounded-lg animate-in fade-in">
                        <ShieldAlert className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs text-red-700 font-bold">AI Auditor: PO Box Blocked</p>
                            <p className="text-xs text-red-600 mt-0.5">PO Boxes are not accepted as a primary business address. Rule: <span className="font-mono">DNB_ELIGIBILITY</span>. Enter a commercial street address to continue.</p>
                        </div>
                    </div>
                )}

                {addressIssue === "residential" && (
                    <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg animate-in fade-in">
                        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs text-amber-800 font-bold">AI Auditor: Residential Address — High Risk</p>
                            <p className="text-xs text-amber-700 mt-0.5">This address may be residential. D&B requires a commercial address. This application will require manual compliance review before submission.</p>
                        </div>
                    </div>
                )}

                {!addressIssue && address && (
                    <div className="flex items-center gap-2 text-xs text-emerald-600">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Address looks commercial — no flags detected.
                    </div>
                )}

                <div className="grid gap-4 md:grid-cols-3">
                    <Field label="City" required>
                        <Input placeholder="City" value={data.business_city || org.city || ""} onChange={e => onChange("business_city", e.target.value)} />
                    </Field>
                    <Field label="State" required>
                        <Input placeholder="State" value={data.business_state || org.state || ""} onChange={e => onChange("business_state", e.target.value)} />
                    </Field>
                    <Field label="ZIP" required>
                        <Input placeholder="ZIP" value={data.business_zip || org.zip || ""} onChange={e => onChange("business_zip", e.target.value)} />
                    </Field>
                </div>
            </div>
        </div>
    )
}
