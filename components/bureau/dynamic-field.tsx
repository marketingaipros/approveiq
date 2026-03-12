"use client"

import { useState } from "react"
import { DynamicRequirement } from "./admin/requirement-builder"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UploadCloud, FileText, CheckCircle2, Loader2 } from "lucide-react"

export function DynamicField({ 
    requirement, 
    value, 
    otherValue,
    onChange 
}: { 
    requirement: DynamicRequirement, 
    value: string | undefined, 
    otherValue: string | undefined,
    onChange: (key: string, val: string, otherVal?: string | null) => void 
}) {
    const [isUploading, setIsUploading] = useState(false)

    // THE "OTHER" PROTOCOL
    const isOtherSelected = value === 'Other'

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(requirement.field_key, e.target.value)
    }

    const handleSelectChange = (val: string) => {
        if (val === 'Other') {
            onChange(requirement.field_key, val, otherValue || "") // Keep existing other if swapping back and forth
        } else {
            onChange(requirement.field_key, val, null) // Clear other text
        }
    }

    const handleOtherTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(requirement.field_key, value || 'Other', e.target.value)
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return;

        setIsUploading(true)
        try {
            // Simulated fake upload
            await new Promise(res => setTimeout(res, 1500))
            const fakeUrl = `https://supabase.com/storage/v1/object/public/documents/bureau/${Date.now()}_${file.name}`
            onChange(requirement.field_key, fakeUrl)
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="space-y-3">
            <Label htmlFor={requirement.field_key} className="text-slate-900 font-bold flex items-center gap-1">
                {requirement.field_label}
                {requirement.is_required && <span className="text-red-500">*</span>}
            </Label>

            {requirement.field_type === 'text' && (
                <Input 
                    id={requirement.field_key} 
                    value={value || ""} 
                    onChange={handleTextChange} 
                    placeholder="Enter details..." 
                />
            )}

            {requirement.field_type === 'number' && (
                <Input 
                    id={requirement.field_key} 
                    type="number"
                    value={value || ""} 
                    onChange={handleTextChange} 
                    placeholder="Enter number..." 
                />
            )}

            {requirement.field_type === 'select' && (
                <div className="space-y-3">
                    <Select value={value || ""} onValueChange={handleSelectChange}>
                        <SelectTrigger id={requirement.field_key}>
                            <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                            {requirement.options?.map(opt => (
                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* ENFORCED CONDITIONAL INPUT */}
                    {isOtherSelected && (
                        <div className="animate-in fade-in slide-in-from-top-2 p-3 bg-purple-50 rounded-lg border border-purple-100">
                            <Label htmlFor={`${requirement.field_key}_other`} className="text-purple-700 text-xs font-bold uppercase tracking-widest mb-2 block">
                                Please Specify *
                            </Label>
                            <Input 
                                id={`${requirement.field_key}_other`}
                                value={otherValue || ""} 
                                onChange={handleOtherTextChange} 
                                placeholder="Describe specifically..." 
                                className="border-purple-200 focus-visible:ring-purple-500 bg-white"
                            />
                        </div>
                    )}
                </div>
            )}

            {requirement.field_type === 'file' && (
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors relative">
                    {value ? ( // If value exists, it's the URL
                        <div className="flex flex-col items-center gap-2 text-emerald-600">
                            <CheckCircle2 className="h-6 w-6" />
                            <span className="text-sm font-bold">Uploaded Successfully</span>
                            <span className="text-xs text-slate-400 break-all w-48 truncate">{value.split('/').pop()}</span>
                        </div>
                    ) : isUploading ? (
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span className="text-sm font-medium">Uploading securely...</span>
                        </div>
                    ) : (
                        <>
                            <input 
                                id={requirement.field_key} 
                                type="file" 
                                accept=".pdf" 
                                className="hidden" 
                                onChange={handleFileUpload}
                            />
                            <Label htmlFor={requirement.field_key} className="cursor-pointer flex flex-col items-center gap-3">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full">
                                    <UploadCloud className="h-5 w-5" />
                                </div>
                                <span className="text-sm font-medium text-slate-700">Click to upload Document</span>
                            </Label>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
