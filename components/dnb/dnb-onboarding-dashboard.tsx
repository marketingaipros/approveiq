"use client"

import { useState, useCallback } from "react"
import { Loader2, CheckCircle2, ChevronLeft, ChevronRight, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { debounce } from "lodash"
import { updateDNBData, submitDNBApplication } from "@/lib/dnb-actions"
import { StepIndicator } from "@/components/equifax/wizard/step-indicator"
import { DNBStep1Requirements } from "./wizard/step1-requirements"
import { DNBStep2CompanyData } from "./wizard/step2-company"
import { DNBStep3Intent } from "./wizard/step3-intent"
import { DNBStep4AReporting } from "./wizard/step4a-reporting"
import { DNBStep4BBuilding } from "./wizard/step4b-building"
import { ExperianStep5Signature } from "@/components/experian/wizard/step5-signature"

interface Props {
    initialData: any
    applicationId: string
    status: string
    org: any
    profile: any
}

export function DNBOnboardingDashboard({ initialData, applicationId, status, org, profile }: Props) {
    const [data, setData] = useState(initialData)
    const [currentStep, setCurrentStep] = useState(status === "submitted" ? 6 : 1)
    const [isSaving, setIsSaving] = useState(false)

    const saveToDb = useCallback(
        debounce(async (newData: any) => {
            setIsSaving(true)
            try { await updateDNBData(applicationId, newData) }
            catch (err) { console.error("Auto-save failed", err) }
            finally { setIsSaving(false) }
        }, 1200),
        [applicationId]
    )

    const handleChange = (field: string, value: any) => {
        setData((prev: any) => {
            const next = { ...prev, [field]: value }
            saveToDb(next)
            return next
        })
    }

    const intent: string = data.intent || ""
    const isSubmitted = status === "submitted" || currentStep === 6
    const canProceedStep3 = currentStep !== 3 || !!intent

    const canProceedStep4 = currentStep !== 4 || (
        intent === "reporting_customers"
            ? (data.customer_accounts || []).length >= 1
            : (data.trade_references || []).filter((r: any) => !r.ai_flag).length >= 3
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-orange-50 rounded-full blur-3xl opacity-60 -mr-16 -mt-16 pointer-events-none" />
                <div className="z-10 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 font-bold uppercase tracking-widest text-[10px]">
                            <Database className="w-3 h-3 mr-1" /> D&B Commercial
                        </Badge>
                        <Badge variant="outline" className="font-mono text-[10px] bg-blue-50 text-blue-600 border-blue-200">DNB_ELIGIBILITY</Badge>
                        {intent === "reporting_customers" && (
                            <Badge variant="outline" className="font-mono text-[10px] bg-violet-50 text-violet-600 border-violet-200">DNB_REPORTING</Badge>
                        )}
                        {intent === "building_credit" && (
                            <Badge variant="outline" className="font-mono text-[10px] bg-violet-50 text-violet-600 border-violet-200">DNB_CREDIT_BUILDING</Badge>
                        )}
                    </div>
                    <h1 className="text-2xl font-black italic tracking-tighter text-slate-900">D&B Onboarding Application</h1>
                    <p className="text-xs text-slate-500 font-medium">
                        Dun & Bradstreet Commercial Credit — {intent === "reporting_customers" ? "Customer Reporting Track" : intent === "building_credit" ? "Credit Building Track" : "Onboarding Workflow"}
                    </p>
                </div>
                <div className="z-10 flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {isSaving
                        ? <><Loader2 className="w-3 h-3 animate-spin text-blue-500" /> Saving...</>
                        : <><CheckCircle2 className="w-3 h-3 text-emerald-500" /> All progress saved</>
                    }
                </div>
            </div>

            <StepIndicator currentStep={isSubmitted ? 6 : currentStep} />

            <div className="min-h-[400px]">
                {currentStep === 1 && <DNBStep1Requirements />}
                {currentStep === 2 && <DNBStep2CompanyData data={data} org={org} onChange={handleChange} />}
                {currentStep === 3 && <DNBStep3Intent data={data} onChange={handleChange} />}
                {currentStep === 4 && intent === "reporting_customers" && <DNBStep4AReporting data={data} onChange={handleChange} />}
                {currentStep === 4 && intent === "building_credit" && <DNBStep4BBuilding data={data} onChange={handleChange} />}
                {currentStep === 4 && !intent && (
                    <div className="p-8 text-center text-slate-500 text-sm">
                        Please return to Step 3 and select your intent before continuing.
                    </div>
                )}
                {currentStep === 5 && (
                    <ExperianStep5Signature
                        data={data}
                        org={org}
                        profile={profile}
                        applicationId={applicationId}
                        onChange={handleChange}
                        onSubmitted={() => setCurrentStep(6)}
                        submitAction={submitDNBApplication}
                        bureauLabel="D&B"
                        requirementTag="DNB_ELIGIBILITY · DNB_REPORTING · DNB_CREDIT_BUILDING"
                    />
                )}
                {currentStep === 6 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                        <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                            <CheckCircle2 className="h-8 w-8 text-orange-600" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900">Application Submitted</h2>
                        <p className="text-slate-500 max-w-sm text-sm">Your D&B onboarding application is under review. We'll be in touch within 3–5 business days.</p>
                        <Badge className="bg-orange-100 text-orange-700 border-orange-200">Under Review</Badge>
                    </div>
                )}
            </div>

            {currentStep <= 5 && !isSubmitted && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <Button variant="outline" size="sm" className="gap-1" disabled={currentStep === 1} onClick={() => setCurrentStep(s => s - 1)}>
                        <ChevronLeft className="h-4 w-4" /> Back
                    </Button>
                    {currentStep < 5 && (
                        <Button
                            size="sm"
                            className="gap-1 bg-orange-600 hover:bg-orange-700 text-white"
                            disabled={!canProceedStep3 || !canProceedStep4}
                            onClick={() => setCurrentStep(s => s + 1)}
                        >
                            Next <ChevronRight className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            )}
        </div>
    )
}
