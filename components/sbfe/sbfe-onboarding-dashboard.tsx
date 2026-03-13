"use client"

import { useState, useCallback } from "react"
import { Loader2, CheckCircle2, ChevronLeft, ChevronRight, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { debounce } from "lodash"
import { updateSBFEData, submitSBFEApplication } from "@/lib/sbfe-actions"
import { StepIndicator } from "@/components/equifax/wizard/step-indicator"
import { SBFEStep1Requirements } from "./wizard/step1-requirements"
import { ExperianStep2Profile } from "@/components/experian/wizard/step2-profile"
import { SBFEStep3Questionnaire } from "./wizard/step3-questionnaire"
import { SBFEStep4DataMapping } from "./wizard/step4-data-mapping"
import { ExperianStep5Signature } from "@/components/experian/wizard/step5-signature"

interface Props {
    initialData: any
    applicationId: string
    status: string
    org: any
    profile: any
}

export function SBFEOnboardingDashboard({ initialData, applicationId, status, org, profile }: Props) {
    const [data, setData] = useState(initialData)
    const [currentStep, setCurrentStep] = useState(status === 'submitted' ? 6 : 1)
    const [isSaving, setIsSaving] = useState(false)

    const saveToDb = useCallback(
        debounce(async (newData: any) => {
            setIsSaving(true)
            try { await updateSBFEData(applicationId, newData) }
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

    const isSubmitted = status === 'submitted' || currentStep === 6

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-violet-50 rounded-full blur-3xl opacity-60 -mr-16 -mt-16 pointer-events-none" />
                <div className="z-10 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200 font-bold uppercase tracking-widest text-[10px]">
                            <Database className="w-3 h-3 mr-1" /> SBFE Commercial
                        </Badge>
                        <Badge variant="outline" className="font-mono text-[10px] bg-blue-50 text-blue-600 border-blue-200">LENDER_VERIFICATION</Badge>
                        <Badge variant="outline" className="font-mono text-[10px] bg-violet-50 text-violet-600 border-violet-200">SBFE_GOVERNANCE</Badge>
                    </div>
                    <h1 className="text-2xl font-black italic tracking-tighter text-slate-900">SBFE Membership Application</h1>
                    <p className="text-xs text-slate-500 font-medium">Small Business Financial Exchange — Commercial Data Contributor Onboarding</p>
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
                {currentStep === 1 && <SBFEStep1Requirements />}
                {currentStep === 2 && <ExperianStep2Profile org={org} profile={profile} />}
                {currentStep === 3 && <SBFEStep3Questionnaire data={data} onChange={handleChange} />}
                {currentStep === 4 && <SBFEStep4DataMapping data={data} onChange={handleChange} />}
                {currentStep === 5 && (
                    <ExperianStep5Signature
                        data={data}
                        org={org}
                        profile={profile}
                        applicationId={applicationId}
                        onChange={handleChange}
                        onSubmitted={() => setCurrentStep(6)}
                        submitAction={submitSBFEApplication}
                        bureauLabel="SBFE"
                        requirementTag="LENDER_VERIFICATION · SBFE_GOVERNANCE"
                    />
                )}
                {currentStep === 6 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                        <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center">
                            <CheckCircle2 className="h-8 w-8 text-violet-600" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900">Application Submitted</h2>
                        <p className="text-slate-500 max-w-sm text-sm">Your SBFE membership application is under review. We'll be in touch within 3–5 business days.</p>
                        <Badge className="bg-violet-100 text-violet-700 border-violet-200">Under Review</Badge>
                    </div>
                )}
            </div>

            {currentStep <= 5 && !isSubmitted && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <Button variant="outline" size="sm" className="gap-1" disabled={currentStep === 1} onClick={() => setCurrentStep(s => s - 1)}>
                        <ChevronLeft className="h-4 w-4" /> Back
                    </Button>
                    {currentStep < 5 && (
                        <Button size="sm" className="gap-1 bg-violet-600 hover:bg-violet-700 text-white" onClick={() => setCurrentStep(s => s + 1)}>
                            Next <ChevronRight className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            )}
        </div>
    )
}
