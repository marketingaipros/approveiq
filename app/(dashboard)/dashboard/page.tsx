import {
    Activity,
    CreditCard,
    DollarSign,
    Users,
    AlertCircle,
    Shield,
    ArrowRight
} from "lucide-react"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export default async function Dashboard() {
    const supabase = await createClient()

    // 1. Get Org Context via Profile
    const { data: { session } } = await supabase.auth.getSession()
    const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('org_id')
        .eq('id', session?.user?.id || '')
        .maybeSingle()

    const isSuperAdmin = session?.user?.id === 'a1c8f199-63b0-43a8-b82d-12c21c59187e' || (profile as any)?.is_system_admin

    // Use maybeSingle to avoid error if null
    let { data: org } = await (supabase as any)
        .from('organizations')
        .select('id, name, bureau_readiness_score')
        .eq('id', profile?.org_id || '')
        .maybeSingle()

    // If SuperAdmin and org missing, use the default master org
    if (isSuperAdmin && !org) {
        const { data: masterOrg } = await (supabase as any)
            .from('organizations')
            .select('id, name, bureau_readiness_score')
            .eq('id', '00000000-0000-0000-0000-000000000000')
            .maybeSingle()
        org = masterOrg
    }

    const orgId = org?.id

    // 2. Fetch Metrics (Parallel)
    const programsQuery = supabase
        .from('bureau_programs')
        .select('*', { count: 'exact' })
        .eq('org_id', orgId || '')

    const pendingItemsQuery = supabase
        .from('checklist_items')
        .select('*, bureau_programs!inner(org_id)', { count: 'exact', head: true })
        .eq('status', 'pending_review')
        .eq('bureau_programs.org_id', orgId || '')

    const pendingProgramsQuery = supabase
        .from('bureau_programs')
        .select('*', { count: 'exact', head: true })
        .in('status', ['submitted', 'locked_for_review'])
        .eq('org_id', orgId || '')

    // Fetch Recent
    const recentQuery = supabase
        .from('bureau_programs')
        .select('*')
        .eq('org_id', orgId || '')
        .order('created_at', { ascending: false })
        .limit(5)

    const [
        { count: totalPrograms, data: allPrograms },
        { count: pendingItemsCount },
        { count: pendingProgramsCount },
        { data: recentPrograms }
    ] = await Promise.all([programsQuery, pendingItemsQuery, pendingProgramsQuery, recentQuery])

    const pendingReviews = (pendingItemsCount || 0) + (pendingProgramsCount || 0)

    // Calc active users (mock for now as we don't have user table fully populated)
    const activeUsers = 1;

    return (
        <>
            <div className="flex items-center">
                <h1 className="text-lg font-semibold md:text-2xl">Command Center</h1>
            </div>

            {/* Alert / Next Action Block */}
            {pendingReviews && pendingReviews > 0 ? (
                <Card className="border-l-4 border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                            <Users className="h-5 w-5" />
                            AI Review in Progress
                        </CardTitle>
                        <CardDescription>
                            {pendingReviews} action{pendingReviews > 1 ? 's' : ''} currently awaiting review.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4">
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/programs">View Programs</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card className="border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/10">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2 text-blue-700 dark:text-blue-400">
                            <Activity className="h-5 w-5" />
                            System Active
                        </CardTitle>
                        <CardDescription>No pending reviews. Ready for new submissions.</CardDescription>
                    </CardHeader>
                </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Active Credit Bureaus
                        </CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalPrograms || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Targeting 3 Bureaus
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Pending Actions
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingReviews || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Awaiting AI or Admin
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Credit Bureau Readiness</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{org?.bureau_readiness_score || 0}%</div>
                        <p className="text-xs text-muted-foreground">
                            Aggregate Score
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Authorized Users</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeUsers}</div>
                        <p className="text-xs text-muted-foreground">
                            Role: Owner
                        </p>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
                <Card className="xl:col-span-2">
                    <CardHeader className="flex flex-row items-center">
                        <div className="grid gap-2">
                            <CardTitle>Credit Bureaus</CardTitle>
                            <CardDescription>
                                Active applications for data furnishing.
                            </CardDescription>
                        </div>
                        <Button asChild size="sm" className="ml-auto gap-1">
                            <Link href="/programs">
                                View All
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentPrograms?.map((program: any) => (
                                <div key={program.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                    <div>
                                        <p className="font-medium">{program.title}</p>
                                        <p className="text-sm text-muted-foreground">{program.bureau}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm text-muted-foreground capitalize">{program.status.replace('_', ' ')}</span>
                                    </div>
                                </div>
                            ))}
                            {(!recentPrograms || recentPrograms.length === 0) && (
                                <p className="text-sm text-muted-foreground">No bureaus started.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-8">
                        <div className="space-y-4">
                            {/* Static Mock for now, could hook up to audit_logs */}
                            <div className="flex items-center gap-4">
                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                                <div className="grid gap-1">
                                    <p className="text-sm font-medium">System Initialization</p>
                                    <p className="text-xs text-muted-foreground">Today</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
