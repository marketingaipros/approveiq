"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { CheckCircle2, FileText, UploadCloud, Loader2 } from "lucide-react"

export function LegalUploadsCard({ data, onChange }: { data: any, onChange: (field: string, value: any) => void }) {
    // File Integrity: Must actually have the URL to be complete
    const disputeComplete = !!data.dispute_procedures_pdf_url;
    // Lending license requires either the PDF or the number dependent on their choice, but let's just use the boolean for simplicity
    const isCompleted = disputeComplete && data.lending_license_completed;

    const [uploadingDispute, setUploadingDispute] = useState(false)
    const [uploadingLicense, setUploadingLicense] = useState(false)

    // Mock upload function that just sets a fake URL and completed status
    const handleUpload = async (type: 'dispute' | 'license', file: File) => {
        if (type === 'dispute') setUploadingDispute(true)
        if (type === 'license') setUploadingLicense(true)
        
        try {
            // Simulate network delay
            await new Promise(res => setTimeout(res, 1500))
            
            const fakeUrl = `https://supabase.com/storage/v1/object/public/documents/equifax/${Date.now()}_${file.name}`
            
            if (type === 'dispute') {
                onChange('dispute_procedures_pdf_url', fakeUrl)
                onChange('dispute_procedures_completed', true)
            } else {
                onChange('lending_license_pdf_url', fakeUrl)
                onChange('lending_license_completed', true)
            }
        } finally {
            if (type === 'dispute') setUploadingDispute(false)
            if (type === 'license') setUploadingLicense(false)
        }
    }

    return (
        <Card className="bg-white border-slate-200 text-slate-900 shadow-sm relative overflow-hidden">
            {isCompleted && (
                <div className="absolute top-4 right-4 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3" /> Completed
                </div>
            )}
            <CardHeader className="pb-4 border-b border-slate-100">
                <CardTitle className="flex items-center gap-2 text-lg font-black italic tracking-tight">
                    <FileText className="h-5 w-5 text-red-500" />
                    Legal Uploads
                </CardTitle>
                <CardDescription className="text-xs font-medium text-slate-500">
                    Required compliance and licensing documents.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                
                {/* Dispute Procedures */}
                <div className="grid gap-2">
                    <Label className="text-sm font-bold">Documented Dispute Procedures</Label>
                    <p className="text-[10px] text-slate-500 italic">Upload your internal policy for handling consumer credit disputes.</p>
                    
                    <div className="mt-2 border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors relative">
                        {disputeComplete ? (
                            <div className="flex flex-col items-center gap-2 text-emerald-600">
                                <CheckCircle2 className="h-6 w-6" />
                                <span className="text-sm font-bold">Uploaded Successfully</span>
                                <span className="text-xs text-slate-400 break-all">{data.dispute_procedures_pdf_url?.split('/').pop()}</span>
                            </div>
                        ) : uploadingDispute ? (
                            <div className="flex flex-col items-center gap-2 text-slate-400">
                                <Loader2 className="h-6 w-6 animate-spin" />
                                <span className="text-sm font-medium">Uploading...</span>
                            </div>
                        ) : (
                            <>
                                <input 
                                    id="dispute_file" 
                                    type="file" 
                                    accept=".pdf" 
                                    className="hidden" 
                                    title="Upload Dispute Procedures"
                                    onChange={(e) => e.target.files?.[0] && handleUpload('dispute', e.target.files[0])}
                                />
                                <Label htmlFor="dispute_file" className="cursor-pointer flex flex-col items-center gap-3">
                                    <div className="p-3 bg-red-50 text-red-600 rounded-full">
                                        <UploadCloud className="h-5 w-5" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-700">Click to upload PDF</span>
                                </Label>
                            </>
                        )}
                    </div>
                </div>

                {/* Lending License */}
                <div className="grid gap-2 pt-4 border-t border-slate-100">
                    <Label className="text-sm font-bold">Lending License (If Applicable)</Label>
                    <p className="text-[10px] text-slate-500 italic mb-1">State or federal licensing validation.</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="lending_license_number">License Number</Label>
                            <Input 
                                id="lending_license_number"
                                value={data.lending_license_number || ""}
                                onChange={(e) => {
                                    onChange('lending_license_number', e.target.value);
                                    if(e.target.value.trim() !== '') onChange('lending_license_completed', true);
                                }}
                                placeholder="e.g. LND-123456"
                            />
                        </div>

                        <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:bg-slate-50 transition-colors relative flex items-center justify-center">
                            {data.lending_license_pdf_url ? (
                                <div className="flex flex-col items-center gap-1 text-emerald-600">
                                    <CheckCircle2 className="h-5 w-5" />
                                    <span className="text-xs text-slate-400 break-all w-24 truncate">{data.lending_license_pdf_url?.split('/').pop()}</span>
                                </div>
                            ) : uploadingLicense ? (
                                <div className="flex flex-col items-center gap-2 text-slate-400">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                </div>
                            ) : (
                                <>
                                    <input 
                                        id="license_file" 
                                        type="file" 
                                        accept=".pdf" 
                                        className="hidden" 
                                        title="Upload Lending License"
                                        onChange={(e) => e.target.files?.[0] && handleUpload('license', e.target.files[0])}
                                    />
                                    <Label htmlFor="license_file" className="cursor-pointer flex flex-col items-center gap-1">
                                        <UploadCloud className="h-4 w-4 text-slate-400" />
                                        <span className="text-[10px] font-medium text-slate-500">Upload PDF</span>
                                    </Label>
                                </>
                            )}
                        </div>
                    </div>
                </div>

            </CardContent>
        </Card>
    )
}
