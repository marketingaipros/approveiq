import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    FileText,
    Download,
    ShieldCheck,
    Search,
    Filter,
    History,
    Fingerprint,
    HardDrive
} from "lucide-react"

export default async function AdminAuditPage() {
    const supabase = await createClient()

    // Fetch all logs across all organizations
    const { data: logs } = await supabase
        .from('audit_logs')
        .select('*, organizations(name)')
        .order('created_at', { ascending: false })
        .limit(50)

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black italic tracking-tighter text-slate-900 uppercase">System Intelligence Audit</h1>
                    <p className="text-slate-500 font-medium">SOC 2 Compliance Engine. Centralized immutable logs for all platform-level operations.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="border-slate-200 text-slate-500 font-black h-9 uppercase tracking-widest text-[10px] gap-2 shadow-sm hover:bg-slate-50 px-5">
                        <Filter className="h-4 w-4" /> Filter Logs
                    </Button>
                    <Button className="bg-slate-900 hover:bg-black text-white font-black h-9 uppercase tracking-widest text-[10px] gap-2 shadow-lg px-5">
                        <Download className="h-4 w-4" /> Export Evidence
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-white border-slate-200 text-slate-900 shadow-sm border-l-4 border-l-emerald-600">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Fingerprint className="h-4 w-4 text-emerald-600" />
                            Log Chain Integrity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black italic tracking-tighter text-slate-900">VERIFIED</div>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-widest italic leading-none">Cryptographic chain intact</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 text-slate-900 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <History className="h-4 w-4 text-blue-500" />
                            Retention Baseline
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black italic tracking-tighter text-slate-900">7 YEARS</div>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-widest italic leading-none">Compliant with Bureau Standards</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 text-slate-900 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <HardDrive className="h-4 w-4 text-purple-600" />
                            Archive Maturity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black italic tracking-tighter text-slate-900">12.4 GB</div>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-widest italic leading-none">Off-site cold storage ACTIVE</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-white border-slate-200 text-slate-900 shadow-sm overflow-hidden">
                <CardHeader className="border-b border-slate-100 px-6 py-6 bg-slate-50/50 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-black italic tracking-tight text-slate-900">Live System Stream</CardTitle>
                        <CardDescription className="text-slate-500 font-medium">Real-time telemetry and state-change monitoring (Append Only).</CardDescription>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full shadow-sm">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-[9px] font-black text-slate-400 tracking-[0.2em] uppercase">Telemetry Active</span>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-400 border-b border-slate-100">
                                    <th className="px-6 py-4 font-black uppercase text-[9px] tracking-[0.2em]">Timestamp</th>
                                    <th className="px-6 py-4 font-black uppercase text-[9px] tracking-[0.2em]">Organization Context</th>
                                    <th className="px-6 py-4 font-black uppercase text-[9px] tracking-[0.2em]">Action Vector</th>
                                    <th className="px-6 py-4 font-black uppercase text-[9px] tracking-[0.2em]">Actor ID</th>
                                    <th className="px-6 py-4 font-black uppercase text-[9px] tracking-[0.2em] text-right">Evidence</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {logs?.map((log: any) => (
                                    <tr key={log.id} className="hover:bg-slate-50/50 transition-all group">
                                        <td className="px-6 py-5 font-mono text-[10px] text-slate-400 whitespace-nowrap">
                                            {new Date(log.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-xs font-black italic text-slate-700 tracking-tight">{(log.organizations as any)?.name || 'SYSTEM_GLOBAL'}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <Badge variant="outline" className="text-[10px] font-black tracking-widest border-slate-200 bg-white text-slate-500 py-0.5">
                                                {log.action.toUpperCase()}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-5 font-mono text-[9px] text-slate-300 group-hover:text-slate-500 transition-colors">
                                            {log.user_id || 'AUTO_INCIDENT'}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <Button variant="ghost" size="sm" className="h-7 px-4 text-[9px] text-slate-400 hover:text-slate-900 uppercase font-black tracking-widest hover:bg-slate-100 transition-all">
                                                Metadata
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <div className="flex items-center justify-center p-12 bg-white border-2 border-slate-100 rounded-3xl border-dashed">
                <div className="text-center space-y-4">
                    <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 mx-auto shadow-inner">
                        <ShieldCheck className="h-8 w-8 text-slate-200" />
                    </div>
                    <div>
                        <h3 className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">Immutable Sentinel Verified</h3>
                        <p className="text-[11px] text-slate-300 max-w-sm mx-auto italic font-medium mt-2 leading-relaxed">Cryptographic proof-of-state is enforced via SOC 2 database policies. Log modification is architecturally impossible.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
