"use client"

import { useState } from "react"
import { DynamicField } from "./dynamic-field"
import { DynamicRequirement } from "./admin/requirement-builder"
import { saveDynamicAnswer, saveMasterProfile, addBureau } from "@/lib/bureau-dynamic-actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, Save, Send, Globe, Plus, Server, FileText } from "lucide-react"

export function MultiBureauDashboard({ 
    masterProfile, 
    activeBureaus, 
    requirements,
    allDynamicBureaus
}: { 
    masterProfile: any, 
    activeBureaus: any[], 
    requirements: DynamicRequirement[],
    allDynamicBureaus: any[]
}) {
    // 1. Master Profile State
    const [profileData, setProfileData] = useState({
        company_name: masterProfile?.company_name || "",
        company_address: masterProfile?.company_address || "",
        company_website: masterProfile?.company_website || "",
        company_phone: masterProfile?.company_phone || "",
        primary_contact_name: masterProfile?.primary_contact_name || "",
        primary_contact_email: masterProfile?.primary_contact_email || "",
        primary_contact_phone: masterProfile?.primary_contact_phone || "",
        years_in_business: masterProfile?.years_in_business || "",
        customer_acquisition: masterProfile?.customer_acquisition || ""
    })

    // 2. Dynamic Answers State (Flattened for easy lookup)
    const initialAnswers: Record<string, { value: string, other: string | null }> = {}
    activeBureaus.forEach(b => {
        if(b.dynamic_answers) {
            b.dynamic_answers.forEach((ans: any) => {
                initialAnswers[ans.requirement_id] = { value: ans.answer_value, other: ans.answer_other }
            })
        }
    })
    const [answers, setAnswers] = useState(initialAnswers)

    const [isSavingProfile, setIsSavingProfile] = useState(false)
    const [isAddingBureau, setIsAddingBureau] = useState(false)

    // Handlers
    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfileData({ ...profileData, [e.target.id]: e.target.value })
    }

    const handleSaveProfile = async () => {
        setIsSavingProfile(true)
        await saveMasterProfile(profileData)
        setIsSavingProfile(false)
    }

    const handleDynamicFieldChange = async (reqId: string, value: string, otherOption?: string | null) => {
        setAnswers(prev => ({ ...prev, [reqId]: { value, other: otherOption || null } }))
        await saveDynamicAnswer(reqId, value, otherOption)
    }

    // Filter dynamic bureaus that haven't been opted-in yet
    const availableBureaus = allDynamicBureaus
        .map(b => b.name)
        .filter(name => !activeBureaus.some(b => b.bureau_name === name))

    const handleOptIn = async (name: string) => {
        setIsAddingBureau(true)
        try {
            await addBureau(name)
            window.location.reload() 
        } finally {
            setIsAddingBureau(false)
        }
    }

    const globalReqs = requirements.filter(r => r.bureau_name === 'Global')
    const bureauReqs = activeBureaus.map(b => ({
        bureau: b.bureau_name, 
        reqs: requirements.filter(r => r.bureau_name === b.bureau_name)
    }))

    // Calculate overall progress
    const totalSelectedReqs = globalReqs.length + bureauReqs.reduce((acc, br) => acc + br.reqs.length, 0);
    const answeredReqs = Object.values(answers).filter(a => a.value && a.value.trim() !== "").length;
    const progressPercent = totalSelectedReqs === 0 ? 0 : Math.round((answeredReqs / totalSelectedReqs) * 100);

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4">
            {/* Header / Progress Hub */}
            <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
                    <div>
                        <Badge variant="outline" className="bg-indigo-950/50 text-indigo-300 border-indigo-700/50 uppercase tracking-widest text-[10px] font-bold mb-3">Master Dashboard</Badge>
                        <h1 className="text-3xl font-black tracking-tight mb-2">Multi-Bureau Onboarding</h1>
                        <p className="text-indigo-200 font-medium max-w-md text-sm">
                            Connect your business to multiple data contributors simultaneously. Universal tasks are shared across all active pipelines.
                        </p>
                    </div>
                    
                    {/* Progress Hub */}
                    <div className="bg-black/20 backdrop-blur-md rounded-xl p-6 border border-white/10 flex flex-col items-center justify-center text-center">
                        <div className="text-4xl font-black tracking-tighter mb-1">{progressPercent}%</div>
                        <div className="text-xs uppercase tracking-widest font-bold text-indigo-300">Overall Completion</div>
                        <div className="w-full bg-black/30 rounded-full h-2 mt-4 overflow-hidden">
                            <div className="bg-indigo-400 h-2 rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-6">
                
                {/* LEFT COL: Bureau Cards */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-700 flex items-center gap-2">
                            <Server className="h-4 w-4" /> Active Pipelines
                        </h2>
                    </div>

                    {/* Available / Active Bureau Cards */}
                    <div className="space-y-4">
                        {allDynamicBureaus.map(bureauData => {
                            const name = bureauData.name;
                            const isActive = activeBureaus.some(b => b.bureau_name === name);
                            
                            // Calculate progress for this specific bureau
                            const bReqs = requirements.filter(r => r.bureau_name === name);
                            const bAnswered = bReqs.filter(r => answers[r.id!]?.value && answers[r.id!]?.value.trim() !== "").length;
                            const bTotal = bReqs.length;
                            const isBureauComplete = bTotal > 0 && bAnswered === bTotal;
                            const bPct = bTotal === 0 ? 0 : Math.round((bAnswered / bTotal) * 100);

                            return (
                                <Card key={name} className={`relative overflow-hidden transition-all duration-200 ${isActive ? 'border-indigo-500 shadow-md ring-1 ring-indigo-500/20' : 'bg-slate-50 border-slate-200 hover:border-indigo-300'}`}>
                                    {isActive && <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>}
                                    <CardContent className="p-5 flex flex-col gap-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>
                                                    <Building2 className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900">{name}</h3>
                                                    {isActive && (
                                                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-full">
                                                            {isBureauComplete ? "Tasks Complete" : `${bPct}% Complete`}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {!isActive ? (
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    onClick={() => handleOptIn(name)}
                                                    disabled={isAddingBureau || !masterProfile?.company_name}
                                                    className="h-8 max-w-[80px]"
                                                >
                                                    <Plus className="h-4 w-4 mr-1" /> Add
                                                </Button>
                                            ) : (
                                                <Badge variant="secondary" className="bg-slate-100 text-slate-500">Active</Badge>
                                            )}
                                        </div>

                                        {/* Bureau Progress Bar */}
                                        {isActive && bTotal > 0 && (
                                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                <div className="bg-indigo-500 h-1.5 transition-all duration-500 ease-out" style={{ width: `${bPct}%` }}></div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </div>

                {/* RIGHT COL: Master Profile & Dynamic Renderings */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Master Profile Input Summary */}
                    <Card className="bg-white border-slate-200 shadow-sm border-t-4 border-t-slate-800">
                        <CardHeader className="pb-4 relative">
                            <div className="absolute top-4 right-4">
                                <Badge variant="outline" className="bg-indigo-50 border-indigo-200 text-indigo-700 font-bold uppercase tracking-widest text-[10px]">
                                    Synced: 242FZ00693 (Eqfx)
                                </Badge>
                            </div>
                            <CardTitle className="flex items-center gap-2 text-lg font-black text-slate-900">
                                <Globe className="h-5 w-5 text-indigo-500" /> Master Profile
                            </CardTitle>
                            <CardDescription className="text-xs">Mapped universally to all applications.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-1">Legal Identity</h3>
                                <div className="space-y-1"><Label htmlFor="company_name">Company Name</Label><Input id="company_name" value={profileData.company_name} onChange={handleProfileChange} /></div>
                                <div className="space-y-1"><Label htmlFor="company_address">Address</Label><Input id="company_address" value={profileData.company_address} onChange={handleProfileChange} /></div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1"><Label htmlFor="company_phone">Phone</Label><Input id="company_phone" value={profileData.company_phone} onChange={handleProfileChange} /></div>
                                    <div className="space-y-1"><Label htmlFor="company_website">Website</Label><Input id="company_website" value={profileData.company_website} onChange={handleProfileChange} /></div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-1">Leadership</h3>
                                <div className="space-y-1"><Label htmlFor="primary_contact_name">Primary Contact Name</Label><Input id="primary_contact_name" value={profileData.primary_contact_name} onChange={handleProfileChange} /></div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1"><Label htmlFor="primary_contact_email">Email</Label><Input id="primary_contact_email" value={profileData.primary_contact_email} onChange={handleProfileChange} type="email" /></div>
                                    <div className="space-y-1"><Label htmlFor="primary_contact_phone">Phone</Label><Input id="primary_contact_phone" value={profileData.primary_contact_phone} onChange={handleProfileChange} /></div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-1">History</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1"><Label htmlFor="years_in_business">Years in Business</Label><Input id="years_in_business" value={profileData.years_in_business} onChange={handleProfileChange} /></div>
                                    <div className="space-y-1"><Label htmlFor="customer_acquisition">Acquisition Method</Label><Input id="customer_acquisition" value={profileData.customer_acquisition} onChange={handleProfileChange} placeholder="e.g. Online, Ads" /></div>
                                </div>
                            </div>

                            <Button 
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold mt-2"
                                onClick={handleSaveProfile}
                                disabled={isSavingProfile || !profileData.company_name}
                            >
                                <Save className="h-4 w-4 mr-2" /> {isSavingProfile ? "Saving..." : "Save Master Profile"}
                            </Button>
                        </CardContent>
                    </Card>

                    {activeBureaus.length === 0 ? (
                        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center h-full flex flex-col items-center justify-center">
                            <Building2 className="h-12 w-12 text-slate-300 mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Ready to expand?</h3>
                            <p className="text-slate-500 max-w-sm">Opt-in to a bureau on the left to instantly load their dynamically injected onboarding requirements.</p>
                        </div>
                    ) : (
                        <Card className="bg-white border-slate-200 shadow-sm">
                            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                                <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-indigo-500" />
                                    Dynamic Task Injection
                                </CardTitle>
                                <CardDescription className="text-xs font-medium text-slate-500">
                                    These fields are injected based on your active pipelines.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-10">
                                
                                {/* GLOBAL QUESTIONS */}
                                {globalReqs.length > 0 && (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-600">Universal Tasks</h3>
                                            {globalReqs.every(r => answers[r.id!]?.value && answers[r.id!]?.value !== "") ? (
                                                <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">✓ Completed Once</Badge>
                                            ) : (
                                                <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">Pending</Badge>
                                            )}
                                        </div>
                                        {globalReqs.map(req => (
                                            <DynamicField 
                                                key={req.id} 
                                                requirement={req} 
                                                value={answers[req.id!]?.value} 
                                                otherValue={answers[req.id!]?.other || undefined}
                                                onChange={(key, val, other) => handleDynamicFieldChange(req.id!, val, other)}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* BUREAU SPECIFIC */}
                                {bureauReqs.map(({bureau, reqs}) => {
                                    if(reqs.length === 0) return null;
                                    const allComplete = reqs.every(r => answers[r.id!]?.value && answers[r.id!]?.value !== "");
                                    
                                    return (
                                        <div key={bureau} className="space-y-6 bg-slate-50/50 -mx-6 px-6 py-6 border-y border-slate-100 first:border-t-0">
                                            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-700 flex items-center gap-2">
                                                    <Building2 className="h-4 w-4" /> {bureau} Tasks
                                                </h3>
                                                {allComplete ? (
                                                    <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">✓ Bureau Complete</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">{bureau} Tasks Open</Badge>
                                                )}
                                            </div>
                                            {reqs.map(req => (
                                                <DynamicField 
                                                    key={req.id} 
                                                    requirement={req} 
                                                    value={answers[req.id!]?.value} 
                                                    otherValue={answers[req.id!]?.other || undefined}
                                                    onChange={(key, val, other) => handleDynamicFieldChange(req.id!, val, other)}
                                                />
                                            ))}
                                        </div>
                                    )
                                })}

                                <div className="pt-6 border-t border-slate-100 flex justify-end">
                                    <Button className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-8">
                                        <Send className="h-4 w-4 mr-2" /> Submit Pipelines for Review
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

            </div>
        </div>
    )
}
