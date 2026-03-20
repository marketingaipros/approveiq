import { createAdminClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, Search, Filter, ShieldCheck, ShieldAlert, MoreVertical } from "lucide-react"
import Link from "next/link"

export default async function AdminClientsPage() {
    const supabase = createAdminClient()

    let clients: any[] = []
    let error: any = null

    try {
        const { data, error: fetchError } = await (supabase as any)
            .from('organizations')
            .select('*')
            .order('name', { ascending: true })
        
        clients = data || []
        error = fetchError
    } catch (e: any) {
        console.error("Admin Fetch Error:", e)
        error = e
    }

    if (error) {
        return (
            <div className="p-8 text-center bg-red-50 border border-red-200 rounded-2xl">
                <ShieldAlert className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-red-900 mb-2">Platform Engine Failure</h2>
                <p className="text-red-600 max-w-md mx-auto mb-6">
                    Failed to fetch tenant data. This usually indicates the <code className="bg-red-100 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> is missing or invalid on the server.
                </p>
                <div className="text-left bg-slate-900 text-slate-300 p-4 rounded-lg font-mono text-xs overflow-x-auto">
                    {JSON.stringify(error, null, 2)}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Clients & Tenants</h1>
                    <p className="text-slate-500">Governance and lifecycle management for all businesses on the platform.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-50 shadow-sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                    </Button>
                    <Button className="bg-red-600 hover:bg-red-700 text-white font-bold shadow-md shadow-red-500/10">
                        Onboard New Client
                    </Button>
                </div>
            </div>

            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Search by client name, ID, or domain..."
                    className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/10 transition-all text-slate-900 shadow-sm placeholder:text-slate-400"
                />
            </div>

            <div className="grid gap-4">
                {clients?.map((client: any) => (
                    <Card key={client.id} className="bg-white border-slate-200 text-slate-900 hover:border-slate-300 transition-all shadow-sm group hover:shadow-md">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-white transition-colors">
                                        <Building2 className="h-6 w-6 text-slate-400" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Link href={`/admin/clients/${client.id}`} className="font-bold text-lg hover:text-red-600 transition-colors">
                                                {client.name}
                                            </Link>
                                            <Badge variant="outline" className={`text-[10px] h-4 font-bold tracking-wide ${client.subscription_status === 'active' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                client.subscription_status === 'suspended' ? 'bg-red-50 text-red-700 border-red-200' :
                                                    'bg-slate-100 text-slate-500 border-slate-200'
                                                }`}>
                                                {client.subscription_status?.toUpperCase()}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 mt-1">
                                            <p className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">{client.id}</p>
                                            <div className="h-1 w-1 rounded-full bg-slate-200" />
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{client.subscription_tier?.toUpperCase()} Tier</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-10">
                                    <div className="text-center hidden md:block">
                                        <p className="text-xl font-black italic tracking-tighter text-slate-900 leading-none">{client.bureau_readiness_score || 0}%</p>
                                        <p className="text-[9px] text-slate-400 uppercase tracking-widest font-black mt-1">Readiness</p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button asChild variant="ghost" size="sm" className="h-9 text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50">
                                            <Link href={`/admin/clients/${client.id}`}>View Details</Link>
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-300 hover:text-slate-900">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                        <ShieldCheck className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">Tenant Governance Active</h3>
                        <p className="text-sm text-slate-500">All administrative actions are logged and synced for enterprise audit readiness.</p>
                    </div>
                </div>
                <Button asChild variant="link" className="text-slate-400 hover:text-red-600 font-bold text-xs uppercase tracking-widest">
                    <Link href="/admin/audit">Audit Governance Console</Link>
                </Button>
            </div>
        </div>
    )
}
