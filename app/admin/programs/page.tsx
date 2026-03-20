import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Database, Plus, Settings2, ShieldCheck, ChevronRight, Globe, Lock } from "lucide-react"
import Link from "next/link"
import { UploadTemplateButton } from "./upload-template-button"
import { BUREAU_TEMPLATES } from "@/lib/templates"

export default async function AdminProgramsPage() {
    const supabase = await createClient()

    // Fetch from bureau_templates
    const { data: dbTemplates } = await supabase
        .from('bureau_templates')
        .select('*')
        .order('created_at', { ascending: false })

    // Combine DB templates with offline defaults
    const combinedTemplates = [
        ...(dbTemplates || []).map((t: any) => ({
            id: t.id,
            title: t.name,
            bureau: t.bureau,
            description: t.description,
            isCustom: true
        })),
        ...BUREAU_TEMPLATES.map(t => ({
            id: t.id,
            title: t.name,
            bureau: t.bureau,
            description: t.description,
            isCustom: false
        }))
    ]

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black italic tracking-tighter text-slate-900">Bureau Repository</h1>
                    <p className="text-slate-500">Control global compliance requirements, AI-generated templates, and validation rules.</p>
                </div>
                <UploadTemplateButton />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-white border-slate-200 text-slate-900 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                            <Globe className="h-3.5 w-3.5 text-blue-500" />
                            Connected Bureaus
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black italic tracking-tighter text-slate-900">4</div>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-widest italic leading-none">Experian, Equifax, D&B, TransUnion</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 text-slate-900 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                            <Settings2 className="h-3.5 w-3.5 text-emerald-500" />
                            Rules Infrastructure
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black italic tracking-tighter text-slate-900">{combinedTemplates.length}</div>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-widest italic leading-none">Total Active Templates</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 text-slate-900 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                            <ShieldCheck className="h-3.5 w-3.5 text-purple-500" />
                            AI Integration
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black italic tracking-tighter text-emerald-600">Active</div>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-widest italic leading-none">PDF processing & template generation</p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Database className="h-4 w-4 text-slate-300" />
                    Global Rule Repository
                </h2>

                <div className="grid gap-4">
                    {combinedTemplates.map((template: any) => (
                        <Card key={template.id} className="bg-white border-slate-200 text-slate-900 hover:border-slate-300 transition-all shadow-sm group cursor-pointer border-l-4 border-l-transparent hover:border-l-red-500">
                            <CardContent className="p-0">
                                <div className="flex items-center justify-between p-6">
                                    <div className="flex items-center gap-6">
                                        <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0 shadow-inner group-hover:bg-white transition-colors">
                                            <span className="text-xl font-black text-slate-300 italic tracking-tighter group-hover:text-slate-900 transition-colors">{template.bureau?.slice(0, 2).toUpperCase()}</span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-black text-xl italic tracking-tight text-slate-900 group-hover:text-red-600 transition-colors leading-tight">{template.title}</h3>
                                                {template.isCustom && <Badge variant="outline" className="border-emerald-200 text-[10px] font-black tracking-widest text-emerald-600 uppercase bg-emerald-50">AI Generated</Badge>}
                                                {!template.isCustom && <Badge variant="outline" className="border-slate-200 text-[10px] font-black tracking-widest text-slate-400 uppercase bg-slate-50">System Template</Badge>}
                                            </div>
                                            <div className="flex items-center gap-5 mt-2">
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5 line-clamp-1 max-w-sm">
                                                    {template.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-10">
                                        <div className="flex flex-col items-end hidden sm:flex">
                                            <div className="flex -space-x-2">
                                                {template.isCustom && <div className="h-7 w-7 rounded-full border-2 border-white bg-blue-50 text-blue-500 flex items-center justify-center text-[8px] font-black tracking-tighter shadow-sm">AI</div>}
                                                <div className="h-7 w-7 rounded-full border-2 border-white bg-slate-50 text-slate-400 flex items-center justify-center text-[8px] font-black tracking-tighter shadow-sm">MFA</div>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <div className="p-8 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm border-l-4 border-l-red-600">
                <div className="flex items-center gap-6">
                    <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center border border-red-100">
                        <Lock className="h-6 w-6 text-red-600 shadow-sm" />
                    </div>
                    <div>
                        <h4 className="font-black italic tracking-tight text-slate-900 leading-none mb-1">Bureau Rule Hardlocking Enabled</h4>
                        <p className="text-xs text-slate-500 font-medium">Version 4.2.0 is currently frozen. Atomic changes require a new version draft for non-destructive deployment.</p>
                    </div>
                </div>
                <Button variant="outline" className="border-slate-200 text-slate-400 hover:text-red-600 font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-all px-6">Initialize v4.3.0 Draft</Button>
            </div>
        </div>
    )
}
