"use client"

import { useState, useCallback } from "react"
import { Loader2, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck } from "lucide-react"
import { debounce } from "lodash"
import { updateEquifaxData } from "@/lib/equifax-actions"
import { StepIndicator } from "./wizard/step-indicator"
import { Step1Requirements } from "./wizard/step1-requirements"
import { Step2CompanyInfo } from "./wizard/step2-company-info"
import { Step3BusinessModel } from "./wizard/step3-business-model"
import { Step4Products } from "./wizard/step4-products"
import { Step5Submit } from "./wizard/step5-submit"

interface Props {
    initialData: any
    applicationId: string
    status: string
}

export function OnboardingDashboard({ initialData, applicationId, status }: Props) {
    const [data, setData] = useState(initialData)
    const [currentStep, setCurrentStep] = useState(status === 'submitted' ? 5 : 1)
    const [isSaving, setIsSaving] = useState(false)

    const saveToDb = useCallback(
        debounce(async (newData: any) => {
            setIsSaving(true)
            try {
                await updateEquifaxData(applicationId, newData)
            } catch (err) {
                console.error("Auto-save failed", err)
            } finally {
                setIsSaving(false)
            }
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

    const isSubmitted = status === 'submitted'

    const statusLabel = isSubmitted ? "Submitted — Under Review"
        : status === 'approved' ? "Approved"
        : status === 'rejected' ? "Rejected"
        : "Draft"

    const statusColor = isSubmitted ? "bg-blue-50 text-blue-600 border-blue-200"
        : status === 'approved' ? "bg-emerald-50 text-emerald-600 border-emerald-200"
        : status === 'rejected' ? "bg-red-50 text-red-600 border-red-200"
        : "bg-slate-50 text-slate-500 border-slate-200"

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-red-50 rounded-full blur-3xl opacity-60 -mr-16 -mt-16 pointer-events-none" />
                <div className="z-10 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 font-bold uppercase tracking-widest text-[10px]">
                            <ShieldCheck className="w-3 h-3 mr-1" /> Data Contributor Application
                        </Badge>
                        <Badge variant="outline" className={`font-bold uppercase tracking-widest text-[10px] ${statusColor}`}>
                            {statusLabel}
                        </Badge>
                    </div>
                    <h1 className="text-2xl font-black italic tracking-tighter text-slate-900">Equifax Commercial Onboarding</h1>
                    <p className="text-xs text-slate-500 font-medium">Complete all steps to submit your application for Equifax Data Contributor eligibility.</p>
                </div>
                <div className="z-10 flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {isSaving ? (
                        <><Loader2 className="w-3 h-3 animate-spin text-blue-500" /> Saving...</>
                    ) : (
                        <><CheckCircle2 className="w-3 h-3 text-emerald-500" /> All progress saved</>
                    )}
                </div>
            </div>

            {/* Step Indicator */}
            <StepIndicator currentStep={isSubmitted ? 6 : currentStep} />

            {/* Step Content */}
            <div className="min-h-[400px]">
                {currentStep === 1 && <Step1Requirements />}
                {currentStep === 2 && <Step2CompanyInfo data={data} onChange={handleChange} />}
                {currentStep === 3 && <Step3BusinessModel data={data} onChange={handleChange} />}
                {currentStep === 4 && <Step4Products data={data} onChange={handleChange} />}
                {currentStep === 5 && (
                    <Step5Submit
                        data={data}
                        applicationId={applicationId}
                        onSubmitted={() => setCurrentStep(6)}
                    />
                )}
                {currentStep === 6 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900">Application Submitted</h2>
                        <p className="text-slate-500 max-w-sm text-sm">Our compliance team will review and contact you within 3–5 business days.</p>
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200">Under Review</Badge>
                    </div>
                )}
            </div>

            {/* Navigation Buttons */}
            {currentStep <= 5 && !isSubmitted && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        disabled={currentStep === 1}
                        onClick={() => setCurrentStep(s => s - 1)}
                    >
                        <ChevronLeft className="h-4 w-4" /> Back
                    </Button>

                    {currentStep < 5 && (
                        <Button
                            size="sm"
                            className="gap-1 bg-red-600 hover:bg-red-700 text-white"
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
