"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Camera, FileText, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface DocumentUploadProps {
    onUploadComplete: (file: File) => void
    isUploading?: boolean
}

export function DocumentUpload({ onUploadComplete, isUploading = false }: DocumentUploadProps) {
    const [preview, setPreview] = useState<string | null>(null)
    const [file, setFile] = useState<File | null>(null)

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const selectedFile = acceptedFiles[0]
        if (selectedFile) {
            setFile(selectedFile)
            // Create preview URL
            const objectUrl = URL.createObjectURL(selectedFile)
            setPreview(objectUrl)
        }
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg'],
            'application/pdf': ['.pdf']
        },
        maxFiles: 1
    })

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation()
        setFile(null)
        if (preview) URL.revokeObjectURL(preview)
        setPreview(null)
    }

    const handleUpload = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (file) {
            onUploadComplete(file)
        }
    }

    // Camera capture handler (mobile optimized)
    // NOTE: The `capture` attribute on input type='file' handles native camera on mobile.
    // We don't need a separate button for logic, but we can style the dropzone trigger.

    if (file) {
        return (
            <div className="border rounded-lg p-4 bg-background">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                        {file.type.startsWith('image/') && preview ? (
                            <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                        ) : (
                            <FileText className="h-6 w-6 text-muted-foreground" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleRemove} disabled={isUploading}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {isUploading && (
                    <div className="mt-4 space-y-2">
                        <Progress value={45} className="h-2" />
                        <p className="text-xs text-muted-foreground text-center">Uploading & Scanning...</p>
                    </div>
                )}

                {!isUploading && (
                    <div className="mt-4 flex gap-2">
                        <Button className="w-full" onClick={handleUpload}>Confirm Upload</Button>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div
            {...getRootProps()}
            className={cn(
                "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-muted/5 hover:bg-muted/10",
                isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
            )}
        >
            <input {...getInputProps()} />
            <div className="p-3 rounded-full bg-muted mb-4">
                <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-1">Upload Document</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                Drag & drop or click to browse. Supports PDF, JPG, PNG.
            </p>
            <Button variant="outline" size="sm" className="gap-2">
                <Camera className="h-4 w-4" />
                Scan with Camera
            </Button>
        </div>
    )
}
