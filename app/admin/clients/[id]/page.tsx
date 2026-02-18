import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    ArrowLeft,
    Building2,
    Users,
    ShieldAlert,
    ShieldCheck,
    History,
    Lock,
    Unlock,
    AlertCircle,
    Activity
} from "lucide-react"
import Link from "next/link"
import { toggleClientAccess } from "@/lib/admin-actions"

export default async function AdminClientDetailsPage({ params }: { params: { id: string } }) {
    const { id } = await params
    const supabase = await createClient()

    // 1. Fetch Client
    const { data: client } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', id)
        .single()

    if (!client) return <div>Client not found</div>

    // 2. Fetch Client Users
    const { data: users } = await supabase
        .from('profiles')
        .select('*')
        .eq('org_id', id)

    // 3. Fetch Recent Audit Logs for this Org
    const { data: logs } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('org_id', id)
        .order('created_at', { ascending: false })
        .limit(10)

    const isSuspended = client.subscription_status === 'suspended'

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <Link href="/admin/clients" className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Clients
                </Link>
                <div className="flex gap-3">
                    <form action={async () => {
                        "use server"
                        await toggleClientAccess(id, !isSuspended)
                    }}>
                        <Button
                            variant={isSuspended ? "default" : "destructive"}
                            className={isSuspended ? "bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md" : "bg-red-600 hover:bg-red-700 text-white font-bold shadow-md shadow-red-500/10"}
                        >
                            {isSuspended ? (
                                <><Unlock className="h-4 w-4 mr-2" /> Reactivate Client</>
                            ) : (
                                <><Lock className="h-4 w-4 mr-2" /> Suspend Client Access</>
                            )}
                        </Button>
                    </form>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2 bg-white border-slate-200 text-slate-900 shadow-sm">
                    <CardHeader className="flex flex-row items-center gap-6">
                        <div className="h-20 w-20 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner">
                            <Building2 className="h-10 w-10 text-slate-300" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <CardTitle className="text-3xl font-black italic tracking-tighter text-slate-900">{client.name}</CardTitle>
                                <Badge className={`font-bold tracking-wide ${isSuspended ? "bg-red-100 text-red-700 border-red-200" : "bg-emerald-100 text-emerald-700 border-emerald-200"}`} variant="outline">
                                    {client.subscription_status?.toUpperCase()}
                                </Badge>
                            </div>
                            <CardDescription className="text-slate-400 flex items-center gap-2 mt-2 font-medium">
                                <Activity className="h-3 w-3" />
                                Onboarded {new Date(client.created_at).toLocaleDateString()} • <span className="font-mono text-[10px] uppercase">{client.id}</span>
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-8 border-t border-slate-100">
                        <div className="grid grid-cols-3 gap-12">
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-2">Subscription Tier</p>
                                <p className="text-xl font-black text-slate-900">{client.subscription_tier?.toUpperCase()}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-2">Bureau Readiness</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-black italic tracking-tighter text-emerald-600">{client.bureau_readiness_score || 0}%</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-2">Authorized Seats</p>
                                <p className="text-xl font-black text-slate-900">{users?.length || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200 text-slate-900 shadow-sm overflow-hidden border-l-4 border-l-red-500">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                        <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-widest text-slate-600">
                            <ShieldAlert className="h-4 w-4 text-red-600" />
                            Compliance Controls
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-red-200 transition-colors">
                            <p className="text-[10px] text-slate-400 uppercase font-black mb-1.5 tracking-widest">Internal Data Lock</p>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-slate-400">UNRESTRICTED</span>
                                <Button variant="outline" size="sm" className="h-7 px-3 bg-red-50 text-red-700 border-red-100 hover:bg-red-100 font-bold text-[10px] uppercase tracking-wider shadow-sm">Enable Lock</Button>
                            </div>
                        </div>
                        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-blue-200 transition-colors">
                            <p className="text-[10px] text-slate-400 uppercase font-black mb-1.5 tracking-widest">MFA Enforcement</p>
                            <div className="flex items-center justify-between">
                                <span className={`text-xs font-black ${client.mfa_enforced ? 'text-emerald-600' : 'text-slate-400'}`}>
                                    {client.mfa_enforced ? 'ACTIVE' : 'OPTIONAL'}
                                </span>
                                <Button variant="outline" size="sm" className="h-7 px-3 bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100 font-bold text-[10px] uppercase tracking-wider shadow-sm">Re-Evaluate</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-white border-slate-200 text-slate-900 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 pb-4">
                        <CardTitle className="text-lg font-black italic tracking-tight flex items-center gap-2">
                            <Users className="h-5 w-5 text-slate-300" />
                            Authorized Users
                        </CardTitle>
                        <Badge variant="outline" className="border-slate-200 text-slate-400 font-bold text-[9px] tracking-widest bg-slate-50">AUDIT_ONLY</Badge>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-3">
                            {users?.map((user: any) => (
                                <div key={user.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-slate-200 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-[10px] font-black text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                            {user.full_name?.split(' ').map((n: string) => n[0]).join('')}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-800 leading-tight">{user.full_name}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{user.role}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black text-slate-400 hover:text-red-600 uppercase tracking-widest">History</Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200 text-slate-900 shadow-sm">
                    <CardHeader className="border-b border-slate-50 pb-4">
                        <CardTitle className="text-lg font-black italic tracking-tight flex items-center gap-2">
                            <History className="h-5 w-5 text-slate-300" />
                            Governance Logs
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <div className="space-y-6">
                            {logs?.length === 0 && <p className="text-sm text-slate-400 italic">No recent activity logged for this client.</p>}
                            {logs?.map((log: any) => (
                                <div key={log.id} className="relative pl-8 pb-6 border-l border-slate-100 last:pb-0 group">
                                    <div className="absolute left-[-4.5px] top-0 h-2 w-2 rounded-full bg-slate-200 border border-white group-hover:bg-red-500 transition-colors" />
                                    <div className="bg-white group-hover:bg-slate-50 p-4 rounded-xl border border-slate-100 group-hover:border-slate-200 transition-all shadow-sm">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-[10px] font-black leading-none text-slate-900 uppercase tracking-widest">{log.action.replace(/_/g, ' ')}</p>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase">{new Date(log.created_at).toLocaleTimeString()}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed">System-level event recorded for compliance auditing.</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
