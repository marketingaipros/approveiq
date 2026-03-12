"use client"

import { useState } from "react"
import { CheckCircle2, Circle, Clock, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { updateChecklistItemStatus } from "@/lib/actions"
import { KnowledgeDrawer } from "./knowledge-drawer"
import { Sparkles, ArrowUpRight } from "lucide-react"

export type ChecklistItemStatus = 'missing' | 'pending_review' | 'needs_action' | 'approved'

// Map our internal statuses to a user-friendly 3-state system
type SimpleStatus = 'ready' | 'done' | 'needs_changes'

function toSimpleStatus(s: ChecklistItemStatus): SimpleStatus {
    if (s === 'approved') return 'done'
    if (s === 'needs_action') return 'needs_changes'
    return 'ready'
}

function fromSimpleStatus(s: SimpleStatus): ChecklistItemStatus {
    if (s === 'done') return 'approved'
    if (s === 'needs_changes') return 'needs_action'
    return 'missing'
}

interface ChecklistItemProps {
    id: string
    title: string
    description: string
    status: ChecklistItemStatus
    rejectionReason?: string
    isRequired: boolean
    dataCache?: Record<string, string>
    requirementTag?: string
}

export function ChecklistItem({ id, title, description, status: initialStatus, isRequired, dataCache = {}, requirementTag }: ChecklistItemProps) {
    const [simpleStatus, setSimpleStatus] = useState<SimpleStatus>(toSimpleStatus(initialStatus))
    const [isExpanded, setIsExpanded] = useState(initialStatus === 'needs_action' || initialStatus === 'missing')
    const [isSaving, setIsSaving] = useState(false)

    // AI Data Reuse suggestion
    const cacheKey = requirementTag === 'TAX_ID_VERIFICATION' ? 'ein' :
        requirementTag === 'SERVICE_AGREEMENT' ? 'agreement_signed' :
        requirementTag === 'SECURITY_AUDIT' ? 'soc2_status' : null
    const suggestedValue = cacheKey ? dataCache[cacheKey] : null

    const handleStatusChange = async (next: SimpleStatus) => {
        setIsSaving(true)
        setSimpleStatus(next)
        try {
            await updateChecklistItemStatus(id, fromSimpleStatus(next), undefined, requirementTag)
        } finally {
            setIsSaving(false)
        }
    }

    const getStatusIcon = () => {
        switch (simpleStatus) {
            case 'done': return <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            case 'needs_changes': return <AlertTriangle className="h-6 w-6 text-amber-500" />
            default: return <Circle className="h-6 w-6 text-muted-foreground" />
        }
    }

    const getStatusBadge = () => {
        switch (simpleStatus) {
            case 'done': return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Done</Badge>
            case 'needs_changes': return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Needs Changes</Badge>
            default: return <Badge variant="secondary">Ready</Badge>
        }
    }

    return (
        <Card className={`mb-4 transition-all duration-200 ${simpleStatus === 'needs_changes' ? 'border-amber-200 dark:border-amber-800' : simpleStatus === 'done' ? 'border-emerald-200 dark:border-emerald-800' : ''}`}>
            <div
                className="flex items-center p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="mr-4">{getStatusIcon()}</div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-lg">{title}</h3>
                        {isRequired && <span className="text-xs text-red-500 font-medium">*Required</span>}
                        {getStatusBadge()}
                        <div className="ml-2" onClick={(e) => e.stopPropagation()}>
                            <KnowledgeDrawer topic={title} />
                        </div>
                    </div>
                </div>
                <Button variant="ghost" size="sm">
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
            </div>

            {isExpanded && (
                <CardContent className="pt-0 pb-4 pl-[4.5rem] pr-4">
                    <p className="text-muted-foreground mb-4">{description}</p>

                    {/* AI Data Reuse Suggestion */}
                    {suggestedValue && simpleStatus === 'ready' && (
                        <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium">Found from another application: <span className="font-mono text-xs underline decoration-dotted">{suggestedValue}</span></span>
                            </div>
                            <Button size="sm" variant="secondary" onClick={() => handleStatusChange('done')} disabled={isSaving} className="gap-1 h-7 text-xs">
                                Mark Done <ArrowUpRight className="h-3 w-3" />
                            </Button>
                        </div>
                    )}

                    {/* Status Picker */}
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground font-medium mr-1">Mark as:</span>

                        <Button
                            size="sm"
                            variant={simpleStatus === 'ready' ? 'secondary' : 'outline'}
                            className={`gap-1.5 h-8 text-xs ${simpleStatus === 'ready' ? 'ring-1 ring-slate-400' : ''}`}
                            disabled={isSaving}
                            onClick={(e) => { e.stopPropagation(); handleStatusChange('ready') }}
                        >
                            <Circle className="h-3 w-3" /> Ready
                        </Button>

                        <Button
                            size="sm"
                            variant={simpleStatus === 'done' ? 'default' : 'outline'}
                            className={`gap-1.5 h-8 text-xs ${simpleStatus === 'done' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
                            disabled={isSaving}
                            onClick={(e) => { e.stopPropagation(); handleStatusChange('done') }}
                        >
                            <CheckCircle2 className="h-3 w-3" /> Done
                        </Button>

                        <Button
                            size="sm"
                            variant={simpleStatus === 'needs_changes' ? 'default' : 'outline'}
                            className={`gap-1.5 h-8 text-xs ${simpleStatus === 'needs_changes' ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}`}
                            disabled={isSaving}
                            onClick={(e) => { e.stopPropagation(); handleStatusChange('needs_changes') }}
                        >
                            <AlertTriangle className="h-3 w-3" /> Needs Changes
                        </Button>

                        {isSaving && <Clock className="h-3.5 w-3.5 text-muted-foreground animate-spin ml-1" />}
                    </div>
                </CardContent>
            )}
        </Card>
    )
}
