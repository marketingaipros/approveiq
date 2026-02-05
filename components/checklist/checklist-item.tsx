"use client"

import { useState } from "react"
import { CheckCircle2, Circle, Clock, AlertTriangle, FileText, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RejectionCard } from "./rejection-card"
import { DocumentUpload } from "./document-upload"
import { updateChecklistItemStatus } from "@/lib/actions"
import { createClient } from "@/lib/supabase/client"

export type ChecklistItemStatus = 'missing' | 'pending_review' | 'needs_action' | 'approved'

interface ChecklistItemProps {
    id: string
    title: string
    description: string
    status: ChecklistItemStatus
    rejectionReason?: string
    isRequired: boolean
}

export function ChecklistItem({ id, title, description, status: initialStatus, rejectionReason, isRequired }: ChecklistItemProps) {
    const [status, setStatus] = useState<ChecklistItemStatus>(initialStatus)
    const [isExpanded, setIsExpanded] = useState(initialStatus === 'needs_action' || initialStatus === 'missing')
    const [isUploading, setIsUploading] = useState(false)

    const getStatusIcon = () => {
        switch (status) {
            case 'approved': return <CheckCircle2 className="h-6 w-6 text-green-500" />
            case 'pending_review': return <Clock className="h-6 w-6 text-yellow-500" />
            case 'needs_action': return <AlertTriangle className="h-6 w-6 text-red-500" />
            default: return <Circle className="h-6 w-6 text-muted-foreground" />
        }
    }

    const getStatusBadge = () => {
        switch (status) {
            case 'approved': return <Badge variant="outline" className="border-green-500 text-green-500">Approved</Badge>
            case 'pending_review': return <Badge variant="outline" className="border-yellow-500 text-yellow-500 bg-yellow-50 dark:bg-yellow-900/10">Pending Review</Badge>
            case 'needs_action': return <Badge variant="destructive">Needs Action</Badge>
            default: return <Badge variant="secondary">To Do</Badge>
        }
    }

    return (
        <Card className={`mb-4 transition-all duration-200 ${status === 'needs_action' ? 'border-red-200 dark:border-red-800' : ''}`}>
            <div
                className="flex items-center p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="mr-4">
                    {getStatusIcon()}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{title}</h3>
                        {isRequired && <span className="text-xs text-red-500 font-medium">*Required</span>}
                        {getStatusBadge()}
                    </div>
                </div>
                <Button variant="ghost" size="sm">
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
            </div>

            {isExpanded && (
                <CardContent className="pt-0 pb-4 pl-[4.5rem] pr-4">
                    <p className="text-muted-foreground mb-4">{description}</p>

                    {/* State-specific Content */}
                    {status === 'missing' && (
                        <DocumentUpload
                            isUploading={isUploading}
                            onUploadComplete={async (file) => {
                                setIsUploading(true)
                                try {
                                    console.log("Uploading file:", file.name)
                                    const supabase = createClient()

                                    // 1. Upload to Supabase Storage
                                    const fileName = `${id}/${Date.now()}-${file.name}`
                                    const { data, error } = await supabase.storage
                                        .from('documents')
                                        .upload(fileName, file)

                                    if (error) {
                                        console.error("Upload failed:", error)
                                        alert("Upload failed. Please try again.")
                                        return
                                    }

                                    // 2. Get Public URL
                                    const { data: { publicUrl } } = supabase.storage
                                        .from('documents')
                                        .getPublicUrl(fileName)

                                    // 3. Update DB Status via Server Action
                                    await updateChecklistItemStatus(id, 'pending_review', publicUrl)
                                    setStatus('pending_review')
                                } finally {
                                    setIsUploading(false)
                                }
                            }}
                        />
                    )}

                    {status === 'needs_action' && rejectionReason && (
                        <RejectionCard
                            reason={rejectionReason}
                            solution="Please ensure the document is clearly visible and not expired."
                            onRetry={() => setStatus('pending_review')}
                        />
                    )}

                    {status === 'pending_review' && (
                        <div className="bg-muted/30 p-4 rounded-lg flex items-center gap-3">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                                AI is verifying your document... (This usually takes 30 seconds)
                            </p>
                        </div>
                    )}

                    {status === 'approved' && (
                        <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg flex items-center gap-3 text-green-700 dark:text-green-300">
                            <CheckCircle2 className="h-4 w-4" />
                            <p className="text-sm font-medium">
                                Document verified and approved.
                            </p>
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    )
}
