"use client"

import { useState } from "react"
import { verifyEquifaxApplication } from "@/lib/equifax-admin-actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle2, ShieldX, CheckSquare, Loader2 } from "lucide-react"

export function ReviewLayout({ application, onBack }: { application: any, onBack: () => void }) {
    const data = application.equifax_onboarding_data?.[0]
    
    const [memberNumber, setMemberNumber] = useState("")
    const [isVerifying, setIsVerifying] = useState(false)
    const [isRejecting, setIsRejecting] = useState(false)

    if (!data) return <div>Data not found</div>

    const handleVerify = async (approved: boolean) => {
        if (approved) setIsVerifying(true)
        else setIsRejecting(true)
        
        try {
            await verifyEquifaxApplication(application.id, memberNumber, approved)
            // In a real flow, the dashboard would refetch. We'll simulate by returning to queue
            setTimeout(() => {
                onBack()
            }, 600)
        } catch (e) {
            console.error(e)
            setIsVerifying(false)
            setIsRejecting(false)
        }
    }

    return (
        <div className="space-y-6 animate-in slide-in-from-right-4">
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full bg-slate-50 hover:bg-slate-100">
                        <ArrowLeft className="h-4 w-4 text-slate-600" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            {application.status === 'manual_review_required' ? (
                                <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 uppercase tracking-widest text-[10px] font-bold">Requires Manual Review</Badge>
                            ) : (
                                <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 uppercase tracking-widest text-[10px] font-bold">Awaiting Verification</Badge>
                            )}
                        </div>
                        <h2 className="text-xl font-black text-slate-900">{application.organizations?.name || "Unknown Organization"}</h2>
                    </div>
                </div>
            </div>

            {/* Side-by-Side Content */}
            <div className="grid lg:grid-cols-2 gap-6">
                
                {/* Left Side: Document Viewing */}
                <Card className="bg-white border-slate-200 shadow-sm overflow-hidden flex flex-col h-[700px]">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4 shrink-0">
                        <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-600">Dispute Procedures Review</CardTitle>
                        <CardDescription className="text-xs">Confirm internal dispute policy matches regulatory standards.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 relative bg-slate-200 flex items-center justify-center">
                        {data.dispute_procedures_completed && data.dispute_procedures_pdf_url ? (
                            <iframe 
                                src={data.dispute_procedures_pdf_url} 
                                className="w-full h-full border-none" 
                                title="Dispute Procedures PDF"
                            />
                        ) : (
                            <p className="text-slate-500 font-medium text-sm">No document provided.</p>
                        )}
                        
                        {/* Overlay to simulate real-world iframe interaction without actual files */}
                        <div className="absolute inset-0 z-10 bg-slate-800/50 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-none p-12 text-center text-white">
                            <CheckSquare className="h-12 w-12 mb-4 opacity-50" />
                            <h3 className="font-bold text-lg mb-2">Simulated Document Viewer</h3>
                            <p className="text-sm opacity-80 max-w-sm">In production, the PDF uploaded to Supabase Storage would render here via temporary signed URLs.</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Right Side: Data Mapping & Verification */}
                <div className="space-y-6">
                    {/* Metrics Summary */}
                    <Card className="bg-white border-slate-200 shadow-sm relative overflow-hidden">
                        <CardHeader className="pb-4 border-b border-slate-100">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-600">Data Mapping & Eligibility</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                                <div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Repayment Form</p>
                                    <p className="text-sm font-medium text-slate-900">{data.repayment_method} - {data.repayment_duration || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Expected Vol.</p>
                                    <p className="text-sm font-medium text-slate-900 flex items-center gap-2">
                                        {data.estimated_records} Records 
                                        {data.estimated_records < 500 && <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-bold">WARNING</span>}
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Lending License</p>
                                    <p className="text-sm font-medium text-slate-900">
                                        {data.lending_license_number ? <span className="font-mono bg-slate-100 px-2 rounded">{data.lending_license_number}</span> : "Not Provided"}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Verification Controls */}
                    <Card className="bg-slate-50 border-emerald-100 shadow-sm border-2">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-black italic text-emerald-800">Final Verification</CardTitle>
                            <CardDescription className="text-xs text-emerald-600 font-medium">Assign a Member Number to approve and unlock Data Transmission Phase.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="memberNumber" className="font-bold text-slate-700">Equifax Member Number</Label>
                                <Input 
                                    id="memberNumber"
                                    placeholder="e.g. 100-XXXX-X"
                                    value={memberNumber}
                                    onChange={(e) => setMemberNumber(e.target.value)}
                                    className="bg-white border-emerald-200 focus-visible:ring-emerald-500 font-mono"
                                />
                            </div>

                            <div className="flex gap-4 pt-2">
                                <Button 
                                    variant="outline" 
                                    className="flex-1 bg-white border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold"
                                    onClick={() => handleVerify(false)}
                                    disabled={isVerifying || isRejecting}
                                >
                                    {isRejecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldX className="h-4 w-4 mr-2" />}
                                    Reject
                                </Button>
                                <Button 
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                    onClick={() => handleVerify(true)}
                                    disabled={isVerifying || isRejecting}
                                >
                                    {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                                    Approve & Assign
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
