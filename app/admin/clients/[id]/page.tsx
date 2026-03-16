import { createAdminClient } from "@/lib/supabase/server"
import { AlertCircle } from "lucide-react"

export default async function ClientPage({ params }: { params: { id: string } }) {
    const supabase = createAdminClient()
    const id = params.id

    // 1. Fetch Client Organization
    const { data: clientData, error: clientError } = await (supabase as any)
        .from('organizations')
        .select('*')
        .eq('id', id)
        .single()
        
    console.log("CLIENT PAGE FETCH:", { id, clientData, clientError });
    const client: any = clientData

    if (!client) return <div className="flex items-center justify-center min-h-screen"><AlertCircle className="h-8 w-8 text-red-500"/><p className="ml-2">Client not found - Check Server Console</p></div>

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
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Client Detail: {client.name}</h1>
                <p className="text-muted-foreground">Manage {client.name}'s subscription and access to your platform.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border bg-card text-card-foreground shadow space-y-1.5 p-6">
                    <p className="text-sm font-medium leading-none">Subscription</p>
                    <p className="text-2xl font-bold capitalize">{client.subscription_tier || 'Starter'}</p>
                    <p className="text-xs text-muted-foreground capitalize">Status: {client.subscription_status || 'Active'}</p>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow space-y-1.5 p-6">
                    <p className="text-sm font-medium leading-none">Bureau Readiness</p>
                    <p className="text-2xl font-bold">{client.bureau_readiness_score || 0}%</p>
                </div>
            </div>

            {/* Audit Logs */}
            {logs && logs.length > 0 && (
                <div>
                    <h2 className="text-xl font-bold tracking-tight mb-4">Recent Activity</h2>
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-sm font-medium">Time</th>
                                    <th className="px-4 py-2 text-left text-sm font-medium">User</th>
                                    <th className="px-4 py-2 text-left text-sm font-medium">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {logs.map((log: any) => (
                                    <tr key={log.id}>
                                        <td className="px-4 py-2 text-sm text-muted-foreground whitespace-nowrap">
                                            {new Date(log.created_at).toISOString()}
                                        </td>
                                        <td className="px-4 py-2 text-sm">
                                            {log.user_id ? `User ID: ${log.user_id}` : 'System'}
                                        </td>
                                        <td className="px-4 py-2 text-sm">{log.action}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
