import { createClient } from "@/lib/supabase/server"
import { SecuritySettings } from "@/components/security/security-settings"
import { AlertCircle } from "lucide-react"

export default async function SecurityPage() {
    const supabase = await createClient()

    // 1. Fetch Profile & Org Context
    const { data: { session } } = await supabase.auth.getSession()
    const { data: profileData } = await supabase
        .from('profiles')
        .select('is_system_admin, org_id')
        .eq('id', session?.user?.id || '')
        .maybeSingle()
    const profile: any = profileData

    const isSuperAdmin = session?.user?.id === 'a1c8f199-63b0-43a8-b82d-12c21c59187e' || profile?.is_system_admin

    // Fetch Org Data
    let { data: orgData } = await supabase.from('organizations').select('*').eq('id', profile?.org_id || '').maybeSingle()
    let org: any = orgData

    // Fallback for SuperAdmin
    if (isSuperAdmin && !org) {
        const { data: masterOrg } = await supabase.from('organizations').select('*').eq('id', '00000000-0000-0000-0000-000000000000').maybeSingle()
        org = masterOrg
    }

    if (!org) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] border rounded-lg border-dashed">
                <AlertCircle className="h-8 w-8 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold">Organization Not Found</h2>
                <p className="text-muted-foreground">Please ensure your database is seeded correctly.</p>
                <div className="mt-4 p-4 bg-muted/50 rounded text-xs font-mono">
                    User: {session?.user?.id}
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Security Settings</h1>
                <p className="text-muted-foreground">Manage your organization's security configuration and bureau compliance status.</p>
            </div>

            <SecuritySettings
                orgName={org.name}
                initialMfaEnforced={org.mfa_enforced || false}
            />
        </div>
    )
}