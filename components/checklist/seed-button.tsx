"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react"
import { seedProgramRequirements } from "@/lib/actions"
import { useRouter } from "next/navigation"

interface SeedButtonProps {
    programId: string
}

export function SeedButton({ programId }: SeedButtonProps) {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleSeed = () => {
        setError(null)
        startTransition(async () => {
            try {
                console.log("Starting seed process for:", programId)
                await seedProgramRequirements(programId)
                console.log("Seed complete, refreshing...")
                router.refresh()
            } catch (err: any) {
                console.error("Seeding error:", err)
                setError(err.message || "Failed to generate requirements. Check your connection.")
            }
        })
    }

    return (
        <div className="flex flex-col items-center gap-3">
            <Button
                variant="outline"
                size="sm"
                onClick={handleSeed}
                disabled={isPending}
            >
                {isPending ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                    </>
                ) : (
                    <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Generate Default Requirements
                    </>
                )}
            </Button>

            {error && (
                <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 px-3 py-1.5 rounded-md">
                    <AlertCircle className="h-3 w-3" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    )
}
