"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle2, BriefcaseBusiness } from "lucide-react"

export function ProductDetailsCard({ data, onChange }: { data: any, onChange: (field: string, value: any) => void }) {
    // Smart Defaults: Auto or Consulting means Repayment Terms are strictly mandatory
    const requiresRepayment = data.industry === 'Auto' || data.industry === 'Consulting';
    
    // Repayment Terms logic
    const hasRepaymentDuration = !!(data.repayment_duration && data.repayment_duration.trim());
    const hasRepaymentMethod = !!data.repayment_method && (data.repayment_method !== 'Other' || !!(data.business_model_other && data.business_model_other.trim()));
    
    // If not required by industry, it can be empty and still pass. If required, both must be filled.
    const repaymentValid = requiresRepayment 
        ? (hasRepaymentDuration && hasRepaymentMethod)
        : ( (!hasRepaymentDuration && !hasRepaymentMethod && !data.repayment_method) || (hasRepaymentDuration && hasRepaymentMethod) );
    
    const isCompleted = repaymentValid && data.loan_ranges_completed && data.estimated_records_completed;

    const handleModelChange = (value: string) => {
        onChange('repayment_method', value);
        if (value !== 'Other') {
            onChange('business_model_other', null);
            const valid = requiresRepayment ? (!!data.repayment_duration) : (!data.repayment_duration && !value) || (!!data.repayment_duration);
            onChange('repayment_terms_completed', valid);
        } else {
            onChange('repayment_terms_completed', false); // Requires "other" text to be filled
        }
    }

    return (
        <Card className="bg-white border-slate-200 text-slate-900 shadow-sm relative overflow-hidden">
            {isCompleted && (
                <div className="absolute top-4 right-4 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3" /> Completed
                </div>
            )}
            <CardHeader className="pb-4 border-b border-slate-100">
                <CardTitle className="flex items-center gap-2 text-lg font-black italic tracking-tight">
                    <BriefcaseBusiness className="h-5 w-5 text-purple-500" />
                    Product Details & Scope
                </CardTitle>
                <CardDescription className="text-xs font-medium text-slate-500">
                    Define the financial products being reported.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="repayment_duration">
                            Repayment Duration 
                            {requiresRepayment && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <Input 
                            id="repayment_duration" 
                            value={data.repayment_duration || ""} 
                            onChange={(e) => {
                                onChange('repayment_duration', e.target.value);
                                const MethodVal = data.repayment_method && (data.repayment_method !== 'Other' || !!data.business_model_other);
                                const valid = requiresRepayment ? (!!e.target.value.trim() && MethodVal) : ( (!e.target.value.trim() && !MethodVal) || (!!e.target.value.trim() && MethodVal) );
                                onChange('repayment_terms_completed', !!valid);
                            }} 
                            placeholder="e.g. 12-36 Months" 
                        />
                    </div>
                    <div className="grid gap-2 text-left">
                        <Label>
                            Repayment Method
                            {requiresRepayment && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <Select value={data.repayment_method || ""} onValueChange={handleModelChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                            <SelectContent className="bg-white text-slate-900 border-slate-200">
                                <SelectItem value="Installment">Installment</SelectItem>
                                <SelectItem value="Revolving">Revolving</SelectItem>
                                <SelectItem value="Open">Open</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {data.repayment_method === 'Other' && (
                    <div className="grid gap-2 animate-in fade-in slide-in-from-top-2">
                        <Label htmlFor="business_model_other" className="text-purple-600">Please Specify Methodology *</Label>
                        <Input 
                            id="business_model_other" 
                            value={data.business_model_other || ""} 
                            onChange={(e) => {
                                onChange('business_model_other', e.target.value);
                                const valid = requiresRepayment ? (!!e.target.value.trim() && !!data.repayment_duration) : (!!e.target.value.trim() && !!data.repayment_duration);
                                onChange('repayment_terms_completed', !!valid);
                            }} 
                            placeholder="Describe custom terms..." 
                            className="border-purple-200 focus-visible:ring-purple-500"
                        />
                    </div>
                )}

                <div className="grid gap-2">
                    <Label htmlFor="loan_ranges">Typical Loan Amounts</Label>
                    <Input 
                        id="loan_ranges" 
                        value={data.loan_ranges || ""} 
                        onChange={(e) => {
                            onChange('loan_ranges', e.target.value);
                            onChange('loan_ranges_completed', !!e.target.value.trim());
                        }} 
                        placeholder="e.g. $500 - $5,000" 
                    />
                </div>

                <div className="grid gap-2 pt-2 border-t border-slate-100">
                    <Label htmlFor="estimated_records" className="text-slate-900 font-bold">Estimated Monthly Trade Lines (Records)</Label>
                    <p className="text-[10px] text-slate-500 italic mb-1">Used to determine submission eligibility and manual review.</p>
                    <Input 
                        id="estimated_records" 
                        type="number"
                        value={data.estimated_records || ""} 
                        onChange={(e) => {
                            onChange('estimated_records', parseInt(e.target.value) || 0);
                            onChange('estimated_records_completed', !!e.target.value.trim());
                        }} 
                        placeholder="Enter average monthly volume" 
                    />
                    {data.estimated_records !== null && data.estimated_records > 0 && data.estimated_records < 500 && !data.lending_license_number && (
                        <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200 mt-1 font-medium animate-in fade-in">
                            ⚠️ Low Volume Warning: Automation threshold is 500 lines. Please provide a Lending License Number in the Legal Uploads section to bypass Manual Review.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
