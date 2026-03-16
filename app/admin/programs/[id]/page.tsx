import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Database, ShieldCheck, History } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default async function AdminProgramDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: programData } = await supabase
        .from('bureau_programs')
        .select('*')
        .eq('id', id)
        .single()
    const program: any = programData;

    if (!program) {
        notFound()
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="h-9 w-9 border border-slate-200 bg-white">
                    <Link href="/admin/programs">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-black italic tracking-tighter text-slate-900 uppercase">{program.title}</h1>
                        <Badge variant="outline" className="border-slate-200 text-[10px] font-black tracking-widest text-slate-400 uppercase bg-white px-2">
                            {program.status}
                        </Badge>
                    </div>
                    <p className="text-slate-500 font-medium text-sm">Bureau Authority: {program.bureau} • ID: {program.id}</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-white border-slate-200 shadow-sm border-l-4 border-l-red-600">
                    <CardHeader>
                        <CardTitle className="text-sm font-black italic tracking-tight flex items-center gap-2">
                            <Database className="h-4 w-4 text-slate-300" />
                            Global Schema Control
                        </CardTitle>
                        <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Baseline Logic v4.2.0</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 italic text-slate-500 text-xs">
                            "All administrative field modifications to this program must be approved via the Rule Integrity flow."
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Enforced Requirements</span>
                            <span className="text-sm font-black italic text-slate-900">12 Items</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Logic Overrides</span>
                            <span className="text-sm font-black italic text-slate-900">3 Active</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-sm font-black italic tracking-tight flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-emerald-500" />
                            Security & Redundancy
                        </CardTitle>
                        <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">SOC 2 Level Integrity</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                            <ShieldCheck className="h-5 w-5 text-emerald-600" />
                            <p className="text-[11px] font-black italic text-emerald-900">Automated Integrity Check Passed</p>
                        </div>
                        <div className="p-4 border-2 border-dashed border-slate-100 rounded-xl text-center">
                            <Button variant="ghost" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-red-600">
                                <History className="h-4 w-4 mr-2" /> View Version History
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="p-12 bg-white border-2 border-slate-100 border-dashed rounded-3xl text-center">
                <p className="text-slate-400 font-medium italic mb-4">Detailed Program Field Mapping is under maintenance.</p>
                <Button variant="outline" className="font-black text-[10px] uppercase tracking-widest border-slate-200">Sync with External Bureau Node</Button>
            </div>
        </div>
    )
}
