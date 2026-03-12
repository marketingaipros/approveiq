import dynamic from "next/dynamic"
import { Sidebar } from "@/components/layout/sidebar"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

// Skip SSR for Header — Radix UI's useId() generates different IDs on
// server vs client causing hydration mismatches. Dynamic import with
// ssr:false ensures IDs are only ever generated once, on the client.
const Header = dynamic(
    () => import("@/components/layout/header").then(m => m.Header),
    {
        ssr: false,
        loading: () => <div className="flex h-14 shrink-0 items-center border-b px-4 lg:px-6" />
    }
)

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
        .single()

    const { data: org } = await (supabase as any)
        .from('organizations')
        .select('subscription_tier')
        .eq('id', (profile as any)?.org_id || '')
        .single()

    // Hardcoded bypass for the primary developer ID to ensure zero-lock visibility
    const isSuperAdmin = session?.user?.id === 'a1c8f199-63b0-43a8-b82d-12c21c59187e' || (profile as any)?.is_system_admin

    // If super admin, force enterprise to unlock all features for testing
    const tier = isSuperAdmin ? 'enterprise' : ((org as any)?.subscription_tier || 'starter')

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <Sidebar tier={tier} />
            <div className="flex flex-col">
                <Header userId={session?.user?.id} />
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
