"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Trash2, AlertTriangle, Brain, CheckCircle2, ShieldAlert } from "lucide-react"
import { NON_B2B_KEYWORDS } from "@/lib/dnb-constants"

interface TradeRef {
    id: string
    vendor_name: string
    contact_name: string
    phone: string
    email: string
    credit_limit: string
    account_type: string
    ai_flag?: string
}

interface Props { data: any; onChange: (field: string, value: any) => void }

function detectNonB2B(vendorName: string, accountType: string): string | null {
    const combined = `${vendorName} ${accountType}`.toLowerCase()
    const matched = NON_B2B_KEYWORDS.find(kw => combined.includes(kw))
    return matched ? matched : null
}

const EMPTY_REF: Omit<TradeRef, "id"> = {
    vendor_name: "", contact_name: "", phone: "", email: "",
    credit_limit: "", account_type: "", ai_flag: undefined,
}

const INELIGIBLE_TYPES = ["Personal Credit Card", "Consumer Account", "Utility (Personal Name)", "Residential Rent", "Personal Cell Phone"]

export function DNBStep4BBuilding({ data, onChange }: Props) {
    const refs: TradeRef[] = data.trade_references || []

    const addRef = () => {
        onChange("trade_references", [...refs, { ...EMPTY_REF, id: crypto.randomUUID() }])
    }

    const removeRef = (id: string) => {
        onChange("trade_references", refs.filter(r => r.id !== id))
    }

    const updateRef = (id: string, field: string, value: string) => {
        const updated = refs.map(r => {
            if (r.id !== id) return r
            const next = { ...r, [field]: value }
            const flaggedKw = detectNonB2B(
                field === "vendor_name" ? value : next.vendor_name,
                field === "account_type" ? value : next.account_type
            )
            const isIneligibleType = INELIGIBLE_TYPES.includes(field === "account_type" ? value : next.account_type)
            next.ai_flag = (flaggedKw || isIneligibleType)
                ? `Non-B2B reference detected${flaggedKw ? ` (keyword: "${flaggedKw}")` : ""}`
                : undefined
            return next
        })
        onChange("trade_references", updated)
    }

    const validRefs = refs.filter(r => !r.ai_flag)
    const meetsMinimum = validRefs.length >= 3

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-black text-slate-900">Step 4: Trade References</h2>
                <p className="text-sm text-slate-500 mt-1">
                    Provide 3–4 B2B trade references for manual verification. These establish your D&B Paydex score.
                </p>
            </div>

            {/* Status bar */}
            <div className={`flex items-center justify-between p-4 rounded-xl border ${meetsMinimum ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"}`}>
                <div>
                    <p className="text-sm font-bold text-slate-800">
                        {validRefs.length} valid B2B reference{validRefs.length !== 1 ? "s" : ""}
                        {refs.length > validRefs.length ? ` (${refs.length - validRefs.length} flagged)` : ""}
                    </p>
                    <p className="text-xs text-slate-500">D&B requires 3–4 B2B references with $500–$1,000 credit limits</p>
                </div>
                <div className="flex gap-1.5">
                    {meetsMinimum
                        ? <Badge className="text-[10px] bg-emerald-100 text-emerald-700">✓ Minimum Met</Badge>
                        : <Badge className="text-[10px] bg-amber-100 text-amber-700">Need {3 - validRefs.length} more</Badge>
                    }
                    <Badge className="text-[10px] font-mono bg-violet-100 text-violet-700">DNB_CREDIT_BUILDING</Badge>
                </div>
            </div>

            {/* AI Auditor notice */}
            <div className="flex items-start gap-2 p-3 bg-slate-900 rounded-xl">
                <Brain className="h-4 w-4 text-violet-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300 leading-relaxed">
                    <span className="font-bold text-white">AI Auditor: </span>
                    Non-B2B references (personal credit cards, utilities, residential rent) will be automatically flagged as ineligible. Only B2B vendor accounts with $500–$1,000 credit limits qualify.
                </p>
            </div>

            {/* Reference rows */}
            <div className="space-y-4">
                {refs.map((ref, idx) => (
                    <div key={ref.id} className={`rounded-xl border p-4 space-y-3 ${ref.ai_flag ? "border-amber-300 bg-amber-50" : "bg-white border-slate-200"}`}>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reference #{idx + 1}</span>
                            <div className="flex items-center gap-2">
                                {ref.ai_flag
                                    ? <span className="flex items-center gap-1 text-[10px] text-amber-600 font-semibold"><AlertTriangle className="h-3 w-3" /> Flagged — {ref.ai_flag}</span>
                                    : ref.vendor_name
                                    ? <span className="flex items-center gap-1 text-[10px] text-emerald-600"><CheckCircle2 className="h-3 w-3" /> Valid B2B reference</span>
                                    : null
                                }
                                <button type="button" aria-label="Remove reference" onClick={() => removeRef(ref.id)} className="text-slate-300 hover:text-red-400 transition-colors">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {ref.ai_flag && (
                            <div className="flex items-start gap-2 p-2.5 bg-amber-100 border border-amber-300 rounded-lg animate-in fade-in">
                                <ShieldAlert className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-700">
                                    <span className="font-bold">AI Auditor: Non-B2B Reference</span> — {ref.ai_flag}. This reference will be excluded from your D&B credit file. Replace with a qualifying B2B vendor account.
                                </p>
                            </div>
                        )}

                        <div className="grid gap-3 md:grid-cols-2">
                            <div className="space-y-1">
                                <Label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Vendor / Supplier Name <span className="text-red-500">*</span></Label>
                                <Input placeholder="Acme Supply Co." value={ref.vendor_name} onChange={e => updateRef(ref.id, "vendor_name", e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Account Type <span className="text-red-500">*</span></Label>
                                <Select value={ref.account_type} onValueChange={v => updateRef(ref.id, "account_type", v)}>
                                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Net-30 Vendor">Net-30 Vendor Account</SelectItem>
                                        <SelectItem value="Supplier Credit">Supplier Credit Line</SelectItem>
                                        <SelectItem value="Wholesale Trade">Wholesale Trade Account</SelectItem>
                                        <SelectItem value="B2B Services">B2B Services Account</SelectItem>
                                        <SelectItem value="Equipment Vendor">Equipment Vendor</SelectItem>
                                        <SelectItem value="Personal Credit Card" className="text-red-500">Personal Credit Card ⚠</SelectItem>
                                        <SelectItem value="Consumer Account" className="text-red-500">Consumer Account ⚠</SelectItem>
                                        <SelectItem value="Utility (Personal Name)" className="text-red-500">Utility (Personal Name) ⚠</SelectItem>
                                        <SelectItem value="Residential Rent" className="text-red-500">Residential Rent ⚠</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Contact Name</Label>
                                <Input placeholder="Jane Smith" value={ref.contact_name} onChange={e => updateRef(ref.id, "contact_name", e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Contact Phone</Label>
                                <Input placeholder="(555) 000-0000" value={ref.phone} onChange={e => updateRef(ref.id, "phone", e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Contact Email</Label>
                                <Input type="email" placeholder="contact@vendor.com" value={ref.email} onChange={e => updateRef(ref.id, "email", e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Credit Limit ($) <span className="text-red-500">*</span></Label>
                                <Input type="number" placeholder="500–1000" value={ref.credit_limit} onChange={e => updateRef(ref.id, "credit_limit", e.target.value)} />
                                {Number(ref.credit_limit) > 0 && (Number(ref.credit_limit) < 500 || Number(ref.credit_limit) > 1000) && (
                                    <p className="text-[10px] text-amber-600">D&B recommends $500–$1,000 for new credit file establishment</p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Button
                type="button"
                variant="outline"
                className="w-full gap-2 border-dashed"
                onClick={addRef}
                disabled={refs.length >= 4}
            >
                <PlusCircle className="h-4 w-4" />
                Add Trade Reference {refs.length >= 4 ? "(Maximum 4 reached)" : `(${refs.length}/3 minimum)`}
            </Button>
        </div>
    )
}
