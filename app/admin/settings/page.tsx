import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Settings,
    Zap,
    Globe,
    ShieldCheck,
    Server,
    Cpu,
    Save,
    RefreshCcw,
    AlertCircle
} from "lucide-react"

export default function AdminSettingsPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black italic tracking-tighter text-slate-900 uppercase">System Core Control</h1>
                    <p className="text-slate-500 font-medium">Environment-level toggles, integration keys, and global feature logic.</p>
                </div>
                <Button className="bg-red-600 hover:bg-red-700 text-white font-black h-9 uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-red-500/10 px-6">
                    <Save className="h-4 w-4" /> Save Master Config
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="bg-white border-slate-200 text-slate-900 shadow-sm border-l-4 border-l-blue-600">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Server className="h-4 w-4 text-blue-600" />
                            Production Instance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-black tracking-widest text-[9px] px-2 py-0.5">STABLE_PRODUCTION</Badge>
                        <p className="text-[10px] text-slate-400 mt-2 font-black uppercase tracking-widest italic">Node Cluster: AWS_EAST_PRIMARY</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 text-slate-900 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Cpu className="h-4 w-4 text-purple-600" />
                            Runtime Maturity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black italic tracking-tighter text-slate-900">v24.11.0_LTS</div>
                        <p className="text-[10px] text-slate-400 mt-1.5 uppercase font-black tracking-widest italic leading-none">Next.js 15.0 Architecture</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 text-slate-900 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 text-emerald-600">
                            <ShieldCheck className="h-4 w-4" />
                            Security Integrity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black italic tracking-tighter text-emerald-600 uppercase">Hardened</div>
                        <p className="text-[10px] text-slate-400 mt-1.5 uppercase font-black tracking-widest italic leading-none">RLS Enforcement Active (12 Sectors)</p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Zap className="h-4 w-4 text-slate-300" />
                    Global Logic Flags
                </h2>

                <div className="grid gap-3">
                    {[
                        { name: "Bureau Template Engine v2", status: "ENABLED", env: "GLOBAL", description: "Atomic Experian/Equifax/D&B automated template logic." },
                        { name: "AI Insight OCR", status: "ENABLED", env: "GLOBAL", description: "Smart metadata extraction via high-precision LLM vectors." },
                        { name: "Multi-Tenant Evidence Exports", status: "ENABLED", env: "GLOBAL", description: "SOC 2 compliant client-level audit report generation." },
                        { name: "Real-time Telemetry Bridge", status: "DISABLED", env: "STAGING", description: "Low-latency WebSocket sync for admin state updates." }
                    ].map((flag, i) => (
                        <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-white border border-slate-100 group hover:border-slate-300 transition-all shadow-sm">
                            <div className="flex items-center gap-5">
                                <div className={`h-2.5 w-2.5 rounded-full shadow-inner ${flag.status === 'ENABLED' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-slate-200'}`} />
                                <div>
                                    <h3 className="font-black italic tracking-tight text-slate-900 text-sm leading-none mb-1.5">{flag.name}</h3>
                                    <p className="text-[10px] text-slate-500 font-medium">{flag.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <Badge variant="outline" className="border-slate-100 text-[9px] font-black text-slate-300 tracking-widest px-2 group-hover:text-slate-900 transition-colors uppercase">{flag.env}</Badge>
                                <Button variant="ghost" size="sm" className="h-8 text-[9px] font-black text-slate-400 hover:text-red-600 hover:bg-red-50 uppercase tracking-widest transition-all px-4">Toggle</Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-8 bg-white border-2 border-slate-100 border-dashed rounded-3xl mt-12">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner">
                            <RefreshCcw className="h-6 w-6 text-slate-300" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black italic tracking-tight text-slate-900 leading-none mb-1">Redeploy Sequence Required</h4>
                            <p className="text-[10px] text-slate-500 font-medium">Critical changes (Runtime/Cluster) require a production reload for persistence.</p>
                        </div>
                    </div>
                    <Button variant="outline" className="border-slate-200 text-slate-400 hover:text-slate-900 font-black h-9 text-[10px] uppercase tracking-widest px-8 hover:bg-slate-50 shadow-sm transition-all italic tracking-tighter">Trigger Build Protocol</Button>
                </div>
            </div>
        </div>
    )
}
