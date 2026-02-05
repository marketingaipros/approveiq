import { createClient } from "@/lib/supabase/server"
import { SecuritySettings } from "@/components/security/security-settings"
import { AlertCircle } from "lucide-react"

export default async function SecurityPage() {
    const supabase = await createClient()

    // 1. Fetch Org Data
    const { data: orgs } = await supabase.from('organizations').select('*').limit(1)
    const org = orgs?.[0] as any

    if (!org) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] border rounded-lg border-dashed">
                <AlertCircle className="h-8 w-8 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold">Organization Not Found</h2>
                <p className="text-muted-foreground">Please ensure your database is seeded correctly.</p>
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
