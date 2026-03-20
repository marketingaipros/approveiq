
import { Sidebar } from "@/components/layout/sidebar"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { HeaderWrapper } from "@/components/layout/header-wrapper"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
        redirect("/login")
    }

    // 4. Fetch Profile & Org Context
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_system_admin, org_id')
        .eq('id', session?.user?.id || '')
        .maybeSingle()

    const { data: org } = await (supabase as any)
        .from('organizations')
        .select('subscription_tier')
        .eq('id', (profile as any)?.org_id || '')
        .maybeSingle()

    // Hardcoded bypass for the primary developer ID to ensure zero-lock visibility
    const isSuperAdmin = session?.user?.id === 'a1c8f199-63b0-43a8-b82d-12c21c59187e' || (profile as any)?.is_system_admin

    // If super admin, force enterprise to unlock all features for testing
    const tier = isSuperAdmin ? 'enterprise' : ((org as any)?.subscription_tier || 'starter')

    const hasFullName = !!(profile as any)?.full_name
    const hasCompanyName = !!(org as any)?.name
    const hasEin = !!(org as any)?.data_cache?.ein
    const isProfileComplete = hasFullName && hasCompanyName && hasEin

    const { data: bureauApps } = await supabase
        .from('bureau_applications')
        .select('bureau_name, status')
        .eq('org_id', (profile as any)?.org_id || '')

    const bureauStatusMap = {
        experian: (bureauApps as any[])?.find((a: any) => a.bureau_name.toLowerCase() === 'experian')?.status === 'active',
        equifax: (bureauApps as any[])?.find((a: any) => a.bureau_name.toLowerCase() === 'equifax')?.status === 'active',
    }

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <Sidebar tier={tier} isAdmin={isSuperAdmin} bureauStatuses={bureauStatusMap} isProfileComplete={isProfileComplete} />
            <div className="flex flex-col">
                <HeaderWrapper userId={session?.user?.id} />
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
