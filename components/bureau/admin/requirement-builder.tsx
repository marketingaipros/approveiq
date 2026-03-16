"use client"

import { useState } from "react"
import { createBureau } from "@/lib/bureau-admin-actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { PlusCircle, Search, Settings, Save, Loader2, Trash2, Globe, Building2 } from "lucide-react"
import {Badge} from "@/components/ui/badge"

// Type definition matching the schema
export type DynamicRequirement = {
    id?: string;
    bureau_name: string;
    field_key: string;
    field_label: string;
    field_type: 'text' | 'number' | 'select' | 'file';
    options?: string[] | null;
    is_required: boolean;
    validation_rules?: any;
    display_order?: number;
}

export function RequirementBuilder({ 
    initialRequirements, 
    availableBureaus,
    onSave 
}: { 
    initialRequirements: DynamicRequirement[], 
    availableBureaus: any[],
    onSave: (req: DynamicRequirement) => Promise<void> 
}) {
    const [requirements, setRequirements] = useState<DynamicRequirement[]>(initialRequirements)
    const [isCreating, setIsCreating] = useState(false)
    const [isCreatingBureau, setIsCreatingBureau] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [newBureauName, setNewBureauName] = useState("")
    const [newBureauDescription, setNewBureauDescription] = useState("")

    // Form state for new requirement
    const [newReq, setNewReq] = useState<Partial<DynamicRequirement>>({
        bureau_name: 'Global',
        field_type: 'text',
        is_required: true,
        options: []
    })

    const [optionInput, setOptionInput] = useState("")

    const handleAddOption = () => {
        if (!optionInput.trim()) return;
        setNewReq(prev => ({
            ...prev,
            options: [...(prev.options || []), optionInput.trim()]
        }))
        setOptionInput("")
    }

    const handleRemoveOption = (opt: string) => {
        setNewReq(prev => ({
            ...prev,
            options: (prev.options || []).filter(o => o !== opt)
        }))
    }

    const handleSaveNew = async () => {
        if (!newReq.field_key || !newReq.field_label || !newReq.bureau_name) return;
        
        setIsSaving(true)
        try {
            const reqToSave = newReq as DynamicRequirement;
            // Clean up options if not a select
            if (reqToSave.field_type !== 'select') {
                reqToSave.options = null;
            }

            // Simulated backend save
            await onSave(reqToSave)
            
            // Update local state optimistic (mocking ID generation)
            setRequirements([...requirements, { ...reqToSave, id: crypto.randomUUID() }])
            setIsCreating(false)
            setNewReq({ bureau_name: 'Global', field_type: 'text', is_required: true, options: [] })
        } catch(e) {
            console.error(e)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <Settings className="h-5 w-5 text-indigo-500" />
                        Dynamic Requirement Manager
                    </h2>
                    <p className="text-sm text-slate-500 font-medium">Add questions or fields across specific bureaus without writing code.</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => { setIsCreatingBureau(true); setIsCreating(false); }} variant="outline" className="text-indigo-600 border-indigo-200">
                        <Globe className="h-4 w-4 mr-2" /> Add New Bureau
                    </Button>
                    <Button onClick={() => { setIsCreating(true); setIsCreatingBureau(false); }} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                        <PlusCircle className="h-4 w-4 mr-2" /> Add New Task
                    </Button>
                </div>
            </div>

            {/* Bureau Creation Form */}
            {isCreatingBureau && (
                <Card className="bg-white border-2 border-slate-200 shadow-sm animate-in fade-in">
                    <CardHeader className="pb-4 border-b">
                        <CardTitle className="text-lg font-bold">Add a New Bureau</CardTitle>
                        <CardDescription>Register a new data contributor to start collecting requirements.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Bureau Name</Label>
                                <Input value={newBureauName} onChange={e => setNewBureauName(e.target.value)} placeholder="e.g. TransUnion" />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input value={newBureauDescription} onChange={e => setNewBureauDescription(e.target.value)} placeholder="Short description" />
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 border rounded-lg space-y-3">
                            <Label className="font-bold flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-slate-500" />
                                Link Existing Universal Questions (Master Profile)
                            </Label>
                            <p className="text-sm text-slate-500">
                                The Master Profile automatically links these core data points to every bureau application. These are standard for all bureaus.
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                                {['Company Name', 'Physical Address', 'Website & Phone', 'Primary Contact', 'Industry', 'Repayment Terms', 'Volume Declaration'].map(field => (
                                    <div key={field} className="flex items-center gap-2 bg-white p-2 border rounded shadow-sm opacity-70">
                                        <Checkbox checked disabled />
                                        <span className="text-xs font-medium">{field}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 border-t pt-4">
                            <Button variant="ghost" onClick={() => setIsCreatingBureau(false)}>Cancel</Button>
                            <Button 
                                className="bg-indigo-600 hover:bg-indigo-700"
                                disabled={!newBureauName || isSaving}
                                onClick={async () => {
                                    setIsSaving(true)
                                    try {
                                        await createBureau(newBureauName, newBureauDescription)
                                        // Once created, we close this form and open the requirement form pre-filled
                                        setIsCreatingBureau(false)
                                        setIsCreating(true)
                                        setNewReq({...newReq, bureau_name: newBureauName})
                                        setNewBureauName("")
                                        setNewBureauDescription("")
                                    } catch(e) { console.error(e) }
                                    finally { setIsSaving(false) }
                                }}
                            >
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                Save Bureau & Add Unique Tasks
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Creation Form */}
            {isCreating && (
                <Card className="bg-indigo-50 border-indigo-200 border-2 shadow-sm animate-in fade-in slide-in-from-top-4">
                    <CardHeader className="pb-4 border-b border-indigo-100">
                        <CardTitle className="text-lg font-bold text-indigo-900">Configure New Field</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Target Bureau</Label>
                                <Select 
                                    value={newReq.bureau_name} 
                                    onValueChange={(v) => setNewReq({...newReq, bureau_name: v})}
                                >
                                    <SelectTrigger className="bg-white">
                                        <SelectValue placeholder="Select Bureau" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Global">Global (All Bureaus)</SelectItem>
                                        {availableBureaus.map(b => (
                                            <SelectItem key={b.name} value={b.name}>{b.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Field Type</Label>
                                <Select 
                                    value={newReq.field_type} 
                                    onValueChange={(v: any) => setNewReq({...newReq, field_type: v})}
                                >
                                    <SelectTrigger className="bg-white">
                                        <SelectValue placeholder="Select Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="text">Short Text</SelectItem>
                                        <SelectItem value="number">Number</SelectItem>
                                        <SelectItem value="select">Dropdown</SelectItem>
                                        <SelectItem value="file">File Upload (.pdf)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Frontend Label (e.g., 'Estimated Records')</Label>
                                <Input 
                                    className="bg-white"
                                    value={newReq.field_label || ""} 
                                    onChange={(e) => {
                                        const label = e.target.value;
                                        // Auto-generate key from label
                                        const key = label.toLowerCase().replace(/[^a-z0-9]/g, '_');
                                        setNewReq({...newReq, field_label: label, field_key: key})
                                    }} 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Database Key (Auto-generated)</Label>
                                <Input className="bg-white font-mono text-slate-500" value={newReq.field_key || ""} disabled />
                            </div>
                        </div>

                        {newReq.field_type === 'select' && (
                            <div className="p-4 bg-white rounded-xl border border-indigo-100 space-y-3">
                                <Label className="text-indigo-900 font-bold">Dropdown Options</Label>
                                <div className="flex gap-2">
                                    <Input 
                                        placeholder="Add option (e.g. 'Consulting')" 
                                        value={optionInput} 
                                        onChange={(e) => setOptionInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddOption()}
                                    />
                                    <Button variant="secondary" onClick={handleAddOption}>Add</Button>
                                    {/* Automatic "Other" protocol hint */}
                                    <Button variant="outline" className="text-purple-600 border-purple-200 hover:bg-purple-50" onClick={() => {
                                        if(!newReq.options?.includes("Other")) {
                                            setNewReq(prev => ({...prev, options: [...(prev.options || []), "Other"]}))
                                        }
                                    }}>
                                        + Include "Other"
                                    </Button>
                                </div>
                                {newReq.options && newReq.options.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {newReq.options.map(opt => (
                                            <Badge key={opt} variant="secondary" className="pl-3 pr-1 py-1 flex items-center gap-1 bg-indigo-100 text-indigo-800">
                                                {opt}
                                                <button onClick={() => handleRemoveOption(opt)} className="hover:bg-indigo-200 rounded-full p-0.5">
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                                <p className="text-[10px] text-purple-600 font-medium italic mt-2">
                                    * Note: Including an "Other" option automatically enables the standard text-specification protocol globally.
                                </p>
                            </div>
                        )}

                        <div className="flex items-center gap-2 pt-2">
                            <Checkbox 
                                id="isRequired" 
                                checked={newReq.is_required} 
                                onCheckedChange={(checked) => setNewReq({...newReq, is_required: !!checked})} 
                            />
                            <Label htmlFor="isRequired" className="font-medium">Mandatory Field</Label>
                        </div>

                        <div className="flex gap-3 justify-end pt-4 border-t border-indigo-100">
                            <Button variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
                            <Button 
                                onClick={handleSaveNew} 
                                disabled={!newReq.field_label || isSaving}
                                className="bg-indigo-600 hover:bg-indigo-700 font-bold"
                            >
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                Save Requirement
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* List Existing Requirements */}
            <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 bg-slate-50 border-b flex items-center justify-between">
                    <div className="relative w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                        <Input placeholder="Search defined keys..." className="pl-8 bg-white" />
                    </div>
                </div>
                <div className="divide-y">
                    {requirements.map(req => (
                        <div key={req.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                            <div>
                                <div className="flex items-center gap-2 pb-1">
                                    <span className="font-bold text-slate-900 text-sm">{req.field_label}</span>
                                    {req.is_required && <span className="text-[10px] text-red-500 font-bold">*</span>}
                                    <Badge variant="outline" className="text-[10px] uppercase tracking-widest bg-slate-100">{req.bureau_name}</Badge>
                                    <Badge variant="secondary" className="text-[10px] text-slate-500 font-mono">{req.field_type}</Badge>
                                </div>
                                <p className="text-xs text-slate-500 font-mono">{req.field_key}</p>
                            </div>
                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-red-600">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    {requirements.length === 0 && (
                        <div className="p-8 text-center text-slate-500">No dynamic requirements configured yet.</div>
                    )}
                </div>
            </div>
        </div>
    )
}
