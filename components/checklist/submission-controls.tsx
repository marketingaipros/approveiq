"use client"

import { useState, useTransition } from "react"
import { AttestationModal } from "./attestation-modal"
import { submitProgramForReview } from "@/lib/actions"
import { Badge } from "@/components/ui/badge"
import { Lock, FileCheck, ShieldCheck } from "lucide-react"

interface SubmissionControlsProps {
    programId: string
    status: string
    progressPercent: number
    missingCount: number
}

export function SubmissionControls({ programId, status, progressPercent, missingCount }: SubmissionControlsProps) {
    const [isPending, startTransition] = useTransition()
    const isLocked = status === 'locked_for_review' || status === 'submitted' || status === 'approved'

    const handleConfirm = async () => {
        startTransition(async () => {
            try {
                await submitProgramForReview(programId)
            } catch (error) {
                console.error("Submission failed:", error)
                alert(error instanceof Error ? error.message : "Failed to submit program")
            }
        })
    }

    if (isLocked) {
        return (
            <div className="flex items-center gap-3">
                <Badge variant="secondary" className="px-3 py-1 gap-1.5 flex items-center">
                    <Lock className="h-3.5 w-3.5" />
                    Locked for Review
                </Badge>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full border">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    Immutable Audit Trail Active
                </div>
            </div>
        )
    }

    const canSubmit = missingCount === 0 && progressPercent >= 100

    return (
        <div className="flex items-center gap-3">
            <AttestationModal
                programId={programId}
                onConfirm={handleConfirm}
                isSubmitting={isPending}
                canSubmit={canSubmit}
                missingCount={missingCount}
            />
            {!canSubmit && (
                <p className="text-xs text-muted-foreground italic hidden sm:block">
                    Complete all <strong>required</strong> items to submit.
                </p>
            )}
        </div>
    )
}
