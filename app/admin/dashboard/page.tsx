import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Users,
    Building2,
    FileSpreadsheet,
    Activity,
    Zap,
    ShieldCheck,
    ArrowUpRight,
    TrendingUp,
    AlertTriangle
} from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">System Overview</h1>
                    <p className="text-slate-500">Master control for all tenant environments and bureau integrations.</p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-700 px-3 py-1 font-semibold">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 mr-2 inline-block animate-pulse" />
                        Systems Operational
                    </Badge>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-white border-slate-200 text-slate-900 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Active Tenants</CardTitle>
                        <Building2 className="h-4 w-4 text-slate-300" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold italic tracking-tighter">142</div>
                        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-emerald-500" />
                            <span className="font-bold text-emerald-600">+12%</span> this month
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 text-slate-900 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-slate-300" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold italic tracking-tighter">2,401</div>
                        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                            <Activity className="h-3 w-3 text-blue-500" />
                            <span className="font-bold text-blue-600">842</span> active now
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 text-slate-900 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Bureau Submissions</CardTitle>
                        <FileSpreadsheet className="h-4 w-4 text-slate-300" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold italic tracking-tighter">482</div>
                        <p className="text-xs text-slate-500 mt-2 font-medium">94% Technical approval rate</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 text-slate-900 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">AI Tokens / Cost</CardTitle>
                        <Zap className="h-4 w-4 text-slate-300" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold italic tracking-tighter text-red-600">$1,240.42</div>
                        <p className="text-xs text-slate-500 mt-2 font-medium">7.4M tokens processed</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 bg-white border-slate-200 text-slate-900 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl">Recent Admin Activity</CardTitle>
                        <CardDescription className="text-slate-500">Immutable log of system-wide governance actions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {[
                                { user: "System", action: "Equifax Rule Update", time: "2m ago", severity: "info" },
                                { user: "Admin_D", action: "Client Suspension: Acme Corp", time: "14m ago", severity: "warning" },
                                { user: "System", action: "AI Retraining Triggered", time: "1h ago", severity: "info" },
                                { user: "Admin_J", action: "New Bureau Program: SBA-Intake", time: "3h ago", severity: "success" }
                            ].map((log: any, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-2.5 w-2.5 rounded-full ${log.severity === 'warning' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]' :
                                            log.severity === 'success' ? 'bg-emerald-500 font-bold' : 'bg-blue-500'
                                            }`} />
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">{log.action}</p>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{log.user}</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase">{log.time}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3 bg-white border-slate-200 text-slate-900 shadow-sm overflow-hidden flex flex-col">
                    <CardHeader className="bg-red-50 border-b border-red-100">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            <CardTitle className="text-red-900">Critical System Alerts</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 flex-1">
                        <div className="divide-y divide-slate-100">
                            <div className="p-5 hover:bg-slate-50 transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                    <Badge variant="destructive" className="text-[9px] h-4 bg-red-600 font-bold tracking-widest">HIGH SEVERITY</Badge>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">4:12 AM</span>
                                </div>
                                <p className="text-sm font-bold text-slate-900 leading-tight">Experian SFTP Connection Failure</p>
                                <p className="text-xs text-slate-500 mt-2 leading-relaxed">Failed to push daily furnisher batch for organization #Q2-9981. Retrying in 12s.</p>
                            </div>
                            <div className="p-5 hover:bg-slate-50 transition-colors opacity-60">
                                <div className="flex items-center justify-between mb-2">
                                    <Badge variant="secondary" className="text-[9px] h-4 bg-slate-200 text-slate-600 border-none font-bold tracking-widest">RESOLVED</Badge>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Yesterday</span>
                                </div>
                                <p className="text-sm font-bold text-slate-900 leading-tight">Supabase Migration Completed</p>
                                <p className="text-xs text-slate-500 mt-2">Schema update for `is_system_admin` applied to all profiles. Cluster stable.</p>
                            </div>
                        </div>
                    </CardContent>
                    <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                        <Link href="/admin/audit" className="text-xs text-red-600 font-bold hover:underline flex items-center justify-center gap-1 mx-auto uppercase tracking-wider">
                            Explore Security Console <ArrowUpRight className="h-3 w-3" />
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    )
}
