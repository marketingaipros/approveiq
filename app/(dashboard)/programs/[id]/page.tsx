import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, CheckCircle2, Lock, AlertCircle } from "lucide-react"
import Link from "next/link"
import { ChecklistItem, ChecklistItemStatus } from "@/components/checklist/checklist-item"
import { createClient } from "@/lib/supabase/server"
import { SeedButton } from "@/components/checklist/seed-button"
import { notFound } from "next/navigation"

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ProgramDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    // 1. Fetch Program
    const { data: program, error: programError } = await supabase
        .from('bureau_programs')
        .select('*')
        .eq('id', id)
        .single()

    const safeProgram = program as any

    if (programError || !safeProgram) {
        notFound()
    }

    // 2. Fetch Checklist Items
    const { data: items, error: itemsError } = await supabase
        .from('checklist_items')
        .select('*')
        .eq('program_id', id)
        .order('updated_at', { ascending: true }) // Fixed column name

    if (itemsError) {
        console.error("Fetch items error:", itemsError)
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto" suppressHydrationWarning>
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/programs">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold tracking-tight">{safeProgram.title}</h1>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="text-sm">Program ID: {safeProgram.id} • {safeProgram.bureau}</span>
                    </div>
                </div>
                <Button variant="secondary" disabled>
                    <Lock className="mr-2 h-4 w-4" /> Locked Until Complete
                </Button>
            </div>

            {/* Progress Section */}
            <div className="bg-card border rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Contextual Readiness</span>
                    <span className="text-sm text-muted-foreground">{safeProgram.progress_percent}% Ready</span>
                </div>
                <Progress value={safeProgram.progress_percent} className="h-2" />
            </div>

            {/* Checklist */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Bureau Requirements</h2>
                    {itemsError && (
                        <div className="text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Failed to sync latest requirements.
                        </div>
                    )}
                </div>
                <div className="space-y-4">
                    {!items || items.length === 0 ? (
                        <div className="text-center py-12 space-y-4 border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground italic">No requirements configured for this program.</p>
                            <SeedButton programId={safeProgram.id} />
                        </div>
                    ) : (
                        items.map((item: any) => (
                            <div key={item.id} className="relative group">
                                <ChecklistItem
                                    id={item.id}
                                    title={item.title}
                                    description={item.description || ''}
                                    status={item.status as ChecklistItemStatus}
                                    rejectionReason={item.rejection_reason || undefined}
                                    isRequired={item.required || false}
                                />
                                {item.source_attribution && (
                                    <div className="absolute top-2 right-14 text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded opacity-50 group-hover:opacity-100 transition-opacity">
                                        {item.source_attribution}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
