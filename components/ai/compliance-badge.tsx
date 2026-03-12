"use client"

import { useState, useCallback } from "react"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

interface ComplianceBadgeProps {
    bureau: string
    field: string
    value: string | number | boolean
    /** Trigger validation on mount automatically? Default: false */
    autoValidate?: boolean
}

type ValidationState = "idle" | "loading" | "valid" | "invalid"

/**
 * ComplianceBadge — Real-time AI compliance validator.
 * Wrap any form field with this component to get inline bureau validation.
 *
 * Usage:
 *   <ComplianceBadge bureau="equifax" field="record_count" value={formValues.recordCount} />
 */
export function ComplianceBadge({ bureau, field, value, autoValidate = false }: ComplianceBadgeProps) {
    const [state, setState] = useState<ValidationState>(autoValidate ? "loading" : "idle")
    const [message, setMessage] = useState<string>("")

    const validate = useCallback(async () => {
        if (value === "" || value === undefined) return

        setState("loading")
        try {
            const res = await fetch("/api/ai/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bureau, field, value })
            })
            const data = await res.json()
            setState(data.valid ? "valid" : "invalid")
            setMessage(data.message || "")
        } catch {
            setState("idle")
        }
    }, [bureau, field, value])

    if (state === "idle") {
        return (
            <button
                type="button"
                onClick={validate}
                className="text-xs text-indigo-600 hover:underline mt-1"
            >
                Check compliance →
            </button>
        )
    }

    if (state === "loading") {
        return (
            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Validating against {bureau} rules...
            </div>
        )
    }

    if (state === "valid") {
        return (
            <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {message}
            </div>
        )
    }

    return (
        <div className="mt-1 text-xs text-red-600 font-medium space-y-0.5">
            <div className="flex items-start gap-1.5">
                <XCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>{message}</span>
            </div>
            <button type="button" onClick={validate} className="text-red-500 hover:underline ml-5">
                Re-check
            </button>
        </div>
    )
}
