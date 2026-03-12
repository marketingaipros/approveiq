"use client"

import { useState } from "react"
import { VerificationQueue } from "./verification-queue"
import { ReviewLayout } from "./review-layout"
import { updateTransmissionSetup } from "@/lib/equifax-admin-actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Server, ArrowLeft, CheckCircle2 } from "lucide-react"

export function VerificationDashboard({ initialApplications }: { initialApplications: any[] }) {
    // Determine the active view based on selection
    const [selectedApp, setSelectedApp] = useState<any | null>(null)
    
    // For handling post-approval transmission setup
    const [transmissionType, setTransmissionType] = useState<'metro_2' | 'cfn' | ''>('')
    const [isSavingTransmission, setIsSavingTransmission] = useState(false)

    // Handle view transitions
    const handleView = (app: any) => setSelectedApp(app)
    const handleBack = () => setSelectedApp(null)

    // Handle Transmission Setup submission
    const handleTransmissionToggle = async () => {
        if (!selectedApp || !transmissionType) return
        
        setIsSavingTransmission(true)
        try {
            await updateTransmissionSetup(selectedApp.id, transmissionType as 'metro_2' | 'cfn')
            // Optimistic update locally to return to queue
            setSelectedApp(null)
            // In a real app we'd refresh the server data here
        } catch(e) {
            console.error(e)
            setIsSavingTransmission(false)
        }
    }

    // Render Logic
    if (!selectedApp) {
        return <VerificationQueue applications={initialApplications} onView={handleView} />
    }

    // Task Group 2: Transmission Setup (Triggered immediately after verify/approve)
    if (selectedApp.status === 'approved' && !selectedApp.transmission_setup_completed) {
        return (
            <div className="space-y-6 animate-in slide-in-from-bottom-4">
                <div className="flex items-center gap-4 bg-white p-6 rounded-2xl border border-emerald-200 shadow-sm">
                    <Button variant="ghost" size="icon" onClick={handleBack} className="rounded-full bg-slate-50 hover:bg-slate-100">
                        <ArrowLeft className="h-4 w-4 text-slate-600" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2 mb-1 text-emerald-600 font-bold uppercase tracking-widest text-[10px]">
                            <CheckCircle2 className="h-3 w-3" /> Application Approved
                        </div>
                        <h2 className="text-xl font-black text-slate-900">Task Group 2: Data & Transmission Setup</h2>
                    </div>
                </div>

                <Card className="bg-white border-slate-200 shadow-sm max-w-2xl mx-auto">
                    <CardHeader className="bg-slate-50 border-b border-slate-100">
                        <CardTitle className="flex items-center gap-2 text-lg font-black tracking-tight text-blue-900">
                            <Server className="h-5 w-5" />
                            Configure Transmission Profile
                        </CardTitle>
                        <CardDescription className="text-xs font-medium text-slate-500">
                            This setting is hidden from the client. Determine the data ingestion routing profile.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        <div className="space-y-2">
                            <Label className="font-bold text-slate-700">Transmission Format standard</Label>
                            <Select value={transmissionType} onValueChange={(val: any) => setTransmissionType(val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select ingestion format..." />
                                </SelectTrigger>
                                <SelectContent className="bg-white text-slate-900">
                                    <SelectItem value="metro_2">Metro 2® Format</SelectItem>
                                    <SelectItem value="cfn">Commercial Financial Network (CFN)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <Button 
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
                            onClick={handleTransmissionToggle}
                            disabled={!transmissionType || isSavingTransmission}
                        >
                            {isSavingTransmission ? "Saving..." : "Finalize Setup & Close"}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Default: Side-by-side Review
    return <ReviewLayout application={selectedApp} onBack={handleBack} />
}
