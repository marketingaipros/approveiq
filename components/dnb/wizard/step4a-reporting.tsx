"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react"

interface CustomerAccount {
    id: string
    customer_duns: string
    high_credit: string
    current_balance: string
    amount_past_due: string
    terms_of_sale: string
    account_status: string
    ai_flag?: string
}

interface Props { data: any; onChange: (field: string, value: any) => void }

const EMPTY_ACCOUNT: Omit<CustomerAccount, "id"> = {
    customer_duns: "", high_credit: "", current_balance: "",
    amount_past_due: "", terms_of_sale: "", account_status: "", ai_flag: undefined,
}

export function DNBStep4AReporting({ data, onChange }: Props) {
    const accounts: CustomerAccount[] = data.customer_accounts || []

    const addAccount = () => {
        onChange("customer_accounts", [...accounts, { ...EMPTY_ACCOUNT, id: crypto.randomUUID() }])
    }

    const removeAccount = (id: string) => {
        onChange("customer_accounts", accounts.filter(a => a.id !== id))
    }

    const updateAccount = (id: string, field: string, value: string) => {
        onChange("customer_accounts", accounts.map(a => a.id === id ? { ...a, [field]: value } : a))
    }

    const totalAccounts = accounts.length
    const meetsMinimum = totalAccounts >= 20
    const meetsMaximum = totalAccounts <= 50

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-black text-slate-900">Step 4: Customer Account Data</h2>
                <p className="text-sm text-slate-500 mt-1">
                    Capture your B2B customer accounts. D&B requires 20–50 active accounts per monthly submission.
                </p>
            </div>

            {/* Volume indicator */}
            <div className={`flex items-center justify-between p-4 rounded-xl border ${
                meetsMinimum && meetsMaximum ? "bg-emerald-50 border-emerald-200" :
                totalAccounts > 0 ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-200"
            }`}>
                <div className="space-y-0.5">
                    <p className="text-sm font-bold text-slate-800">
                        {totalAccounts} account{totalAccounts !== 1 ? "s" : ""} entered
                    </p>
                    <p className="text-xs text-slate-500">D&B requires 20–50 active accounts per monthly cycle</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge className={`text-[10px] font-mono ${meetsMinimum && meetsMaximum ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {meetsMinimum && meetsMaximum ? "✓ Eligible" : `Need ${Math.max(0, 20 - totalAccounts)} more`}
                    </Badge>
                    <Badge className="text-[10px] font-mono bg-blue-100 text-blue-700">DNB_REPORTING</Badge>
                    <Badge className="text-[10px] font-mono bg-violet-100 text-violet-700">MONTHLY_CONTRIBUTION</Badge>
                </div>
            </div>

            {/* Account rows */}
            <div className="space-y-3">
                {accounts.map((acct, idx) => (
                    <div key={acct.id} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Account #{idx + 1}</span>
                            <div className="flex items-center gap-2">
                                {acct.customer_duns
                                    ? <span className="flex items-center gap-1 text-[10px] text-emerald-600"><CheckCircle2 className="h-3 w-3" /> DUNS captured</span>
                                    : <span className="flex items-center gap-1 text-[10px] text-amber-500"><AlertTriangle className="h-3 w-3" /> DUNS missing — will queue for manual match</span>
                                }
                                <button type="button" aria-label="Remove account" onClick={() => removeAccount(acct.id)} className="text-slate-300 hover:text-red-400 transition-colors">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-3">
                            <div className="space-y-1">
                                <Label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Customer D-U-N-S</Label>
                                <Input placeholder="9-digit DUNS" value={acct.customer_duns} onChange={e => updateAccount(acct.id, "customer_duns", e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">High Credit ($)</Label>
                                <Input type="number" placeholder="0.00" value={acct.high_credit} onChange={e => updateAccount(acct.id, "high_credit", e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Current Balance ($)</Label>
                                <Input type="number" placeholder="0.00" value={acct.current_balance} onChange={e => updateAccount(acct.id, "current_balance", e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Amount Past Due ($)</Label>
                                <Input type="number" placeholder="0.00" value={acct.amount_past_due} onChange={e => updateAccount(acct.id, "amount_past_due", e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Terms of Sale</Label>
                                <Select value={acct.terms_of_sale} onValueChange={v => updateAccount(acct.id, "terms_of_sale", v)}>
                                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent>
                                        {["Net 30", "Net 60", "Net 90", "Due on Receipt", "2/10 Net 30", "COD", "Other"].map(t =>
                                            <SelectItem key={t} value={t}>{t}</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Account Status</Label>
                                <Select value={acct.account_status} onValueChange={v => updateAccount(acct.id, "account_status", v)}>
                                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="current">Current</SelectItem>
                                        <SelectItem value="30_dpd">30 Days Past Due</SelectItem>
                                        <SelectItem value="60_dpd">60 Days Past Due</SelectItem>
                                        <SelectItem value="90_dpd">90+ Days Past Due</SelectItem>
                                        <SelectItem value="charge_off">Charge-Off</SelectItem>
                                        <SelectItem value="closed">Closed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Button
                type="button"
                variant="outline"
                className="w-full gap-2 border-dashed"
                onClick={addAccount}
                disabled={totalAccounts >= 50}
            >
                <PlusCircle className="h-4 w-4" />
                Add Customer Account {totalAccounts >= 50 ? "(Max 50 reached)" : `(${totalAccounts}/20 minimum)`}
            </Button>

            <p className="text-xs text-center text-slate-400">
                Accounts missing Customer D-U-N-S will be queued for D&B manual match. All accounts must be B2B — consumer accounts will be excluded.
            </p>
        </div>
    )
}
