

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, CheckCircle2, Lock, AlertCircle } from "lucide-react"
import Link from "next/link"
import { ChecklistItem, ChecklistItemStatus } from "@/components/checklist/checklist-item"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

export default async function ProgramDetailsPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()

    // 1. Fetch Program
    const { data: program, error: programError } = await supabase
        .from('bureau_programs')
        .select('*')
        .eq('id', params.id)
        .single()

    const safeProgram = program as any


    if (programError || !safeProgram) {
        notFound()
    }

    // 2. Fetch Checklist Items
    const { data: items, error: itemsError } = await supabase
        .from('checklist_items')
        .select('*')
        .eq('program_id', params.id)
        .order('created_at', { ascending: true }) // Procedural order

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
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
                <h2 className="text-lg font-semibold">Bureau Requirements</h2>
                <div>
                    {!items || items.length === 0 ? (
                        <p className="text-muted-foreground italic">No requirements configured for this program.</p>
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
