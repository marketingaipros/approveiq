"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Send, AlertCircle, ShieldCheck, Loader2 } from "lucide-react"

interface AttestationModalProps {
    programId: string
    onConfirm: () => Promise<void>
    isSubmitting: boolean
    canSubmit: boolean
    missingCount: number
}

export function AttestationModal({ programId, onConfirm, isSubmitting, canSubmit, missingCount }: AttestationModalProps) {
    const [attested, setAttested] = useState(false)
    const [open, setOpen] = useState(false)

    const handleConfirm = async () => {
        if (!attested) return
        await onConfirm()
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="default"
                    size="lg"
                    className="gap-2 shadow-lg"
                    disabled={!canSubmit || isSubmitting}
                >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Submit for Bureau Review
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        Final Bureau Attestation
                    </DialogTitle>
                    <DialogDescription>
                        Please confirm your submission for bureau-level auditing.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {!canSubmit ? (
                        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-destructive">Requirements Incomplete</p>
                                <p className="text-xs text-destructive/80">
                                    You have {missingCount} mandatory items remaining. Bureau auditing requires all items to be uploaded or passed before submission.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 rounded-lg bg-muted border space-y-3">
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                By submitting this application, I attest that the information provided is accurate and that all uploaded documents are true copies of the originals. I understand that this submission will <strong>lock the program</strong> for review and that further edits will require explicit reopening by an administrator.
                            </p>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="attest"
                                    checked={attested}
                                    onCheckedChange={(checked: any) => setAttested(checked as boolean)}
                                />
                                <Label htmlFor="attest" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    I attest and agree to the terms above.
                                </Label>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={!attested || isSubmitting || !canSubmit}
                        className="gap-2"
                    >
                        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                        Confirm & Lock Submission
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
