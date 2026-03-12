"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle2, Building2 } from "lucide-react"

export function BusinessProfileCard({ data, onChange }: { data: any, onChange: (field: string, value: any) => void }) {
    const isCompleted = data.company_name_completed && data.company_address_completed && data.company_phone_completed && data.company_website_completed && data.industry_completed;

    const handleSelectChange = (value: string) => {
        onChange('industry', value);
        if (value !== 'Other') {
            onChange('industry_other', null);
            onChange('industry_completed', true);
        } else {
            onChange('industry_completed', false);
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
                    <Building2 className="h-5 w-5 text-blue-500" />
                    Business Profile
                </CardTitle>
                <CardDescription className="text-xs font-medium text-slate-500">
                    Basic identity details required by the bureau.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor="company_name">Company Legal Name</Label>
                    <Input 
                        id="company_name" 
                        value={data.company_name || ""} 
                        onChange={(e) => {
                            onChange('company_name', e.target.value);
                            onChange('company_name_completed', !!e.target.value.trim());
                        }} 
                        placeholder="e.g. Acme Corp LLC" 
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="company_address">Headquarters Address</Label>
                    <Input 
                        id="company_address" 
                        value={data.company_address || ""} 
                        onChange={(e) => {
                            onChange('company_address', e.target.value);
                            onChange('company_address_completed', !!e.target.value.trim());
                        }} 
                        placeholder="123 Main St, Suite 100, City, ST 12345" 
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="company_phone">Business Phone</Label>
                        <Input 
                            id="company_phone" 
                            value={data.company_phone || ""} 
                            onChange={(e) => {
                                onChange('company_phone', e.target.value);
                                onChange('company_phone_completed', !!e.target.value.trim());
                            }} 
                            placeholder="(555) 123-4567" 
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="company_website">Website URL</Label>
                        <Input 
                            id="company_website" 
                            value={data.company_website || ""} 
                            onChange={(e) => {
                                onChange('company_website', e.target.value);
                                onChange('company_website_completed', !!e.target.value.trim());
                            }} 
                            placeholder="https://acmecorp.com" 
                        />
                    </div>
                </div>
                <div className="grid gap-2 text-left">
                    <Label>Industry</Label>
                    <Select value={data.industry || ""} onValueChange={handleSelectChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select primary industry" />
                        </SelectTrigger>
                        <SelectContent className="bg-white text-slate-900 border-slate-200">
                            <SelectItem value="Financial Services">Financial Services</SelectItem>
                            <SelectItem value="Auto">Auto</SelectItem>
                            <SelectItem value="Consulting">Consulting</SelectItem>
                            <SelectItem value="Retail">Retail</SelectItem>
                            <SelectItem value="Healthcare">Healthcare</SelectItem>
                            <SelectItem value="Technology">Technology</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {data.industry === 'Other' && (
                    <div className="grid gap-2 animate-in fade-in slide-in-from-top-2">
                        <Label htmlFor="industry_other" className="text-blue-600">Please Specify Industry</Label>
                        <Input 
                            id="industry_other" 
                            value={data.industry_other || ""} 
                            onChange={(e) => {
                                onChange('industry_other', e.target.value);
                                onChange('industry_completed', !!e.target.value.trim());
                            }} 
                            placeholder="Enter custom industry..." 
                            className="border-blue-200 focus-visible:ring-blue-500"
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
