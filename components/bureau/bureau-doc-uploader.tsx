"use client"

import { useState, useRef } from "react"
import { uploadBureauDocument } from "@/lib/bureau-document-actions"
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ExistingDoc {
    id: string
    file_name: string
    file_url: string
    label: string
    created_at: string
}

interface BureauDocUploaderProps {
    bureau: string
    existingDocs?: ExistingDoc[]
}

export function BureauDocUploader({ bureau, existingDocs = [] }: BureauDocUploaderProps) {
    const [isUploading, setIsUploading] = useState(false)
    const [result, setResult] = useState<{ success: boolean; fileName?: string; error?: string } | null>(null)
    const [docs, setDocs] = useState<ExistingDoc[]>(existingDocs)
    const fileRef = useRef<HTMLInputElement>(null)

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        setResult(null)

        try {
            const formData = new FormData()
            formData.set("file", file)
            formData.set("bureau", bureau)
            formData.set("label", file.name)

            await uploadBureauDocument(formData)

            setResult({ success: true, fileName: file.name })
            // Optimistically add to list
            setDocs(prev => [{
                id: Date.now().toString(),
                file_name: file.name,
                file_url: "#",
                label: file.name,
                created_at: new Date().toISOString()
            }, ...prev])
        } catch (err: any) {
            setResult({ success: false, error: err.message || "Upload failed" })
        } finally {
            setIsUploading(false)
            if (fileRef.current) fileRef.current.value = ""
        }
    }

    return (
        <div className="space-y-3">
            {/* Upload Zone */}
            <div className="relative border-2 border-dashed border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleUpload}
                    aria-label={`Upload document for ${bureau}`}
                    title={`Upload document for ${bureau}`}
                    disabled={isUploading}
                />
                <div className="flex items-center gap-3 pointer-events-none">
                    {isUploading ? (
                        <Loader2 className="h-5 w-5 text-indigo-400 animate-spin" />
                    ) : (
                        <UploadCloud className="h-5 w-5 text-slate-400" />
                    )}
                    <div>
                        <p className="text-sm font-medium text-slate-700">
                            {isUploading ? "Uploading..." : "Click to upload a document"}
                        </p>
                        <p className="text-xs text-slate-400">PDF, DOC, DOCX, PNG, JPG · Max 10MB</p>
                    </div>
                </div>
            </div>

            {/* Status message */}
            {result && (
                <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-md ${result.success ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                    {result.success ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                    {result.success ? `"${result.fileName}" uploaded successfully` : result.error}
                </div>
            )}

            {/* Existing documents list */}
            {docs.length > 0 && (
                <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Uploaded ({docs.length})</p>
                    {docs.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between gap-2 px-3 py-2 bg-white border border-slate-100 rounded-lg">
                            <div className="flex items-center gap-2 min-w-0">
                                <FileText className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                                <span className="text-xs text-slate-700 truncate">{doc.label || doc.file_name}</span>
                            </div>
                            {doc.file_url !== "#" && (
                                <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                        <ExternalLink className="h-3 w-3 text-slate-400" />
                                    </Button>
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
