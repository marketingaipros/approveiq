"use client"

import { useState, useEffect, useCallback } from "react"
import { ProgressRing } from "./progress-ring"
import { BusinessProfileCard } from "./business-profile-card"
import { ProductDetailsCard } from "./product-details-card"
import { LegalUploadsCard } from "./legal-uploads-card"
import { updateEquifaxData } from "@/lib/equifax-actions"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, Info, Loader2, CheckCircle2 } from "lucide-react"
// Use lodash debounce to avoid spamming the database
import { debounce } from "lodash" 

export function OnboardingDashboard({ initialData, applicationId, status }: { initialData: any, applicationId: string, status: string }) {
    const [data, setData] = useState(initialData)
    const [isSaving, setIsSaving] = useState(false)

    // Calculate progress percentage
    const completionFields = [
        'company_name_completed', 'company_address_completed', 'company_phone_completed', 
        'company_website_completed', 'industry_completed', 'repayment_terms_completed', 
        'loan_ranges_completed', 'estimated_records_completed', 
        'dispute_procedures_completed', 'lending_license_completed'
    ]
    
    // We count lending license as complete by default if they have > 500 records.
    // However, the trigger will flag manual review if it's missing and < 500.
    // For simple UI calc:
    const totalFields = completionFields.length
    const completedCount = completionFields.filter(field => data[field] === true).length
    const progress = (completedCount / totalFields) * 100

    // Debounced save function
    const saveToDb = useCallback(
        debounce(async (newData: any) => {
            setIsSaving(true);
            try {
                await updateEquifaxData(applicationId, newData)
            } catch (err) {
                console.error("Save failed", err)
            } finally {
                setIsSaving(false);
            }
        }, 1000),
        [applicationId]
    )

    // Handle field changes and trigger auto-save
    const handleChange = (field: string, value: any) => {
        setData((prev: any) => {
            const next = { ...prev, [field]: value }
            saveToDb(next)
            return next
        })
    }

    // Determine the display status
    let displayStatus = status;
    let badgeColor = "bg-slate-50 text-slate-500 border-slate-200";
    
    if (status === 'manual_review_required') {
        displayStatus = 'Manual Review Required';
        badgeColor = "bg-amber-50 text-amber-600 border-amber-200";
    } else if (progress === 100 && status === 'draft') {
        displayStatus = 'Ready for Admin Review';
        badgeColor = "bg-emerald-50 text-emerald-600 border-emerald-200";
    } else if (status === 'draft') {
        displayStatus = 'Draft';
    }


    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-3xl opacity-50 -mr-20 -mt-20 pointer-events-none" />
                
                <div className="flex-1 space-y-3 z-10">
                    <div className="flex items-center gap-3">
                        <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 font-bold uppercase tracking-widest text-[10px] px-3">
                            <ShieldCheck className="w-3 h-3 mr-1" />
                            Data Contributor Application
                        </Badge>
                        <Badge variant="outline" className={`font-bold uppercase tracking-widest text-[10px] ${badgeColor}`}>
                            {displayStatus}
                        </Badge>
                    </div>
                    <h1 className="text-3xl font-black italic tracking-tighter text-slate-900">Equifax Onboarding</h1>
                    <p className="text-sm font-medium text-slate-500 max-w-xl">
                        Complete the required business and product compliance information to activate direct data transmission via Metro 2® format.
                    </p>
                    
                    <div className="flex items-center gap-2 mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {isSaving ? (
                            <><Loader2 className="w-3 h-3 animate-spin text-blue-500" /> Auto-saving...</>
                        ) : (
                            <><CheckCircle2 className="w-3 h-3 text-emerald-500" /> All progress saved</>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm z-10">
                    <ProgressRing progress={progress} />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                    <BusinessProfileCard data={data} onChange={handleChange} />
                    <ProductDetailsCard data={data} onChange={handleChange} />
                </div>
                <div className="space-y-6">
                    <LegalUploadsCard data={data} onChange={handleChange} />
                    
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex items-start gap-4">
                        <Info className="w-6 h-6 text-slate-400 shrink-0 mt-1" />
                        <div>
                            <h4 className="font-bold text-slate-900 text-sm mb-1 uppercase tracking-widest">Security & Compliance</h4>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                All documents are encrypted at rest using AES-256 and transmitted via TLS 1.3. Your application will be subject to a manual risk review if your estimated monthly volume is below 500 records and no valid lending license is provided.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
