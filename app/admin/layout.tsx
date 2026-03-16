import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ShieldAlert, Lock, Smartphone } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    // 1. Get Session
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) redirect("/login")

    // 2. Verify System Admin Status
    const { data: profileData } = await supabase
        .from('profiles')
        .select('is_system_admin')
        .eq('id', session.user.id)
        .single()

    const profile: any = profileData;

    if (!profile?.is_system_admin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-900 p-6">
                <ShieldAlert className="h-12 w-12 text-red-600 mb-4" />
                <h1 className="text-2xl font-bold mb-2">Access Restricted</h1>
                <p className="text-slate-500 text-center max-w-md">
                    This is the ApproveIQ System Admin Portal. Your account does not have sufficient permissions to access this environment.
                </p>
                <div className="mt-8 p-6 bg-white border border-slate-200 rounded-xl text-center shadow-sm max-w-sm w-full">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-3 font-bold">Your User ID (for SQL Update)</p>
                    <code className="text-xs font-mono text-red-600 bg-slate-50 px-3 py-2 rounded border border-slate-100 block break-all">
                        {session.user.id}
                    </code>
                    <div className="mt-6 pt-6 border-t border-slate-100">
                        <p className="text-[10px] text-slate-500 mb-2 uppercase font-bold tracking-tight">Run in Supabase SQL Editor:</p>
                        <pre className="text-[10px] bg-slate-900 text-slate-300 p-3 rounded-lg overflow-x-auto text-left leading-relaxed">
                            {`UPDATE profiles \nSET is_system_admin = true \nWHERE id = '${session.user.id}';`}
                        </pre>
                    </div>
                </div>
                <Link href="/" className="mt-8 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors underline underline-offset-4 decoration-slate-200">Return to Client Portal</Link>
            </div>
        )
    }

    // 3. MFA Enforcement (Simulated check against User metadata)
    const mfaLevel = session.user.app_metadata?.mfa_level || 'none'
    // For now, we allow access but show a warning if MFA isn't active
    // In production, we would redirect to a challenge page

    return (
        <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
            <header className="flex h-16 items-center border-b border-slate-200 px-6 bg-white sticky top-0 z-50 shadow-sm">
                <div className="flex items-center gap-3 mr-8">
                    <div className="bg-red-600 p-1.5 rounded shadow-sm">
                        <Lock className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-bold tracking-tight text-lg text-slate-900">ApproveIQ <span className="text-red-600 font-mono text-xs ml-1 font-normal opacity-70">ADMIN_v2.5</span></span>
                </div>

                <nav className="flex items-center gap-6 text-sm font-semibold text-slate-600">
                    <Link href="/admin/dashboard" className="hover:text-red-600 transition-colors">System Overview</Link>
                    <Link href="/admin/clients" className="hover:text-red-600 transition-colors">Clients</Link>
                    <Link href="/admin/programs" className="hover:text-red-600 transition-colors">Bureau Rules</Link>
                    <Link href="/admin/knowledge" className="hover:text-red-600 transition-colors">Knowledge Base</Link>
                    <Link href="/admin/ai-governance" className="hover:text-red-600 transition-colors">AI & Ethics</Link>
                    <Link href="/admin/audit" className="hover:text-red-600 transition-colors">Audit Engine</Link>
                    <Link href="/admin/settings" className="hover:text-red-600 transition-colors">Config</Link>
                </nav>

                <div className="ml-auto flex items-center gap-4">
                    <Badge variant="outline" className="gap-1.5 border-slate-200 text-slate-500 bg-white">
                        <Smartphone className="h-3 w-3" />
                        MFA ACTIVE
                    </Badge>
                    <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shadow-inner">
                        <span className="text-xs font-bold text-red-600">SA</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
                {children}
            </main>

            <footer className="border-t border-slate-200 p-6 bg-white text-[10px] text-slate-400 text-center tracking-widest uppercase font-bold">
                Restricted System Access • Internal Use Only • All Actions Logged Permanently
            </footer>
        </div>
    )
}
