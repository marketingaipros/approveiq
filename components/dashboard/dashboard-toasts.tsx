"use client"

import { useEffect } from "react"
import { toast } from "sonner"
import { useSearchParams } from "next/navigation"

const SUCCESS_HOOKS: Record<string, string> = {
    experian: "We've pre-filled 70% of your Equifax application using this data. Start it now?",
    equifax: "You're halfway to the Big Three. Let's look at SBFE for small business depth.",
    sbfe: "Small Business Financial Exchange is active. Final step: D&B (Dun & Bradstreet).",
    dnb: "All major bureaus are pending. Let's set up your First Data Batch for reporting."
}

export function DashboardToasts() {
    const searchParams = useSearchParams()
    const success = searchParams.get('success')

    useEffect(() => {
        if (success && SUCCESS_HOOKS[success]) {
            // High-end Toast for Bureau Sync & Next Step Hook
            toast.success("Data synced!", {
                description: SUCCESS_HOOKS[success],
                duration: 8000,
            })
        }
    }, [success])

    return null
}
