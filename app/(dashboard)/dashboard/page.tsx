import {
    Activity,
    CreditCard,
    DollarSign,
    Users,
    AlertCircle,
    Shield,
    ArrowRight,
    CheckCircle2,
    Clock,
    Circle,
    Sparkles,
    MessageCircle
} from "lucide-react"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
    // Fetch Membership Applications Status
    const bureauAppsQuery = supabase
        .from('bureau_applications')
        .select('*')
        .eq('org_id', orgId || '')

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

    const [
        { data: bureauApps },
        { count: totalPrograms },
        { count: pendingItemsCount },
        { count: pendingProgramsCount }
    ] = await Promise.all([bureauAppsQuery, programsQuery, pendingItemsQuery, pendingProgramsQuery])

    const pendingReviews = (pendingItemsCount || 0) + (pendingProgramsCount || 0)

    // Bureau Status Mapping
    const bureaus = [
        { name: 'Experian', path: '/experian-onboarding' },
        { name: 'Equifax', path: '/equifax-onboarding' },
        { name: 'SBFE', path: '/sbfe-onboarding' },
        { name: 'D&B', path: '/dnb-onboarding' }
    ]

    const bureauStatuses = bureaus.map(b => {
        const app = (bureauApps as any[])?.find(a => a.bureau_name.toLowerCase() === b.name.toLowerCase() || a.bureau_name === b.name)
        let status = 'Not Started'
        let variant: "outline" | "secondary" | "default" | "destructive" = "outline"
        
        if (app?.status === 'active' || app?.completed_at) {
            status = 'Active'
            variant = 'default' 
        } else if (app) {
            status = 'Pending'
            variant = 'secondary' 
        }
        
        return { ...b, status, variant }
    })

    const activeBureausCount = bureauStatuses.filter(b => b.status === 'Active').length
    const activeUsers = 1;

    return (
        <div className="relative min-h-[calc(100vh-100px)]">
            <div className="flex items-center mb-4">
                <h1 className="text-lg font-semibold md:text-2xl">Command Center</h1>
            </div>

            {/* Welcome Card / Status Banner */}
            {activeBureausCount === 0 ? (
                <Card className="border-none bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Sparkles className="h-32 w-32" />
                    </div>
                    <CardHeader className="pb-4 relative z-10">
                        <CardTitle className="text-2xl md:text-3xl font-extrabold tracking-tight">
                            Ready to start furnishing?
                        </CardTitle>
                        <CardDescription className="text-blue-100 text-base md:text-lg max-w-2xl leading-relaxed mt-2">
                            To begin reporting data, you must first complete a Membership Application for your chosen credit bureau.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-8 relative z-10">
                        <Button className="bg-white text-blue-700 hover:bg-blue-50 font-bold px-8 h-12 rounded-xl transition-all shadow-lg active:scale-95 border-none" asChild>
                            <Link href="/experian-onboarding">
                                Begin Experian Application <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : pendingReviews && pendingReviews > 0 ? (
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
                <Card className="border-l-4 border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                            <Activity className="h-5 w-5" />
                            System Active
                        </CardTitle>
                        <CardDescription>No pending reviews. Ready for new submissions.</CardDescription>
                    </CardHeader>
                </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4 mt-8">
                <Card className="flex flex-col col-span-1 md:col-span-2 lg:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                            Bureaus
                        </CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="flex-1">
                         <CardTitle className="text-xl font-bold mb-4">Membership Status</CardTitle>
                         <div className="space-y-4">
                            {bureauStatuses.map((b) => (
                                <div key={b.name} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-1.5 rounded-full ${
                                            b.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 
                                            b.status === 'Pending' ? 'bg-yellow-100 text-yellow-600' : 
                                            'bg-zinc-100 text-zinc-400'
                                        }`}>
                                            {b.status === 'Active' ? <CheckCircle2 className="h-3.5 w-3.5" /> : 
                                             b.status === 'Pending' ? <Clock className="h-3.5 w-3.5" /> : 
                                             <Circle className="h-3.5 w-3.5" />}
                                        </div>
                                        <span className="text-sm font-medium">{b.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={b.variant === 'default' ? 'default' : b.variant} className={
                                            b.status === 'Active' ? 'bg-emerald-500 hover:bg-emerald-600 border-none px-2 py-0.5' : 
                                            b.status === 'Pending' ? 'bg-yellow-500 hover:bg-yellow-600 border-none text-white px-2 py-0.5' : 
                                            'px-2 py-0.5'
                                        }>
                                            {b.status}
                                        </Badge>
                                        {b.status === 'Not Started' && (
                                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50" asChild>
                                                <Link href={b.path}>Start</Link>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                         </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                            Pending Actions
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{pendingReviews || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Awaiting AI or Admin Attention
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Engine Readiness</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{org?.bureau_readiness_score || 0}%</div>
                        <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full mt-3 overflow-hidden">
                            <div 
                                className="bg-blue-600 h-full transition-all duration-1000" 
                                style={{ width: `${org?.bureau_readiness_score || 0}%` }} 
                            />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Account Access</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{activeUsers}</div>
                        <p className="text-xs text-muted-foreground mt-1 text-emerald-600 font-medium">
                            Status: Secure / Owner
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Setup Assistant (Concierge) */}
            <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-10 duration-700">
                <div className="flex flex-col items-end gap-3">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl shadow-2xl max-w-[280px] relative transition-all hover:scale-[1.02]">
                        <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white dark:bg-zinc-900 border-r border-b border-zinc-200 dark:border-zinc-800 rotate-45" />
                        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                            &nbsp;👋 Hi! I'm your onboarding assistant. I recommend starting with <Link href="/experian-onboarding" className="text-blue-600 font-bold hover:underline">Experian</Link>—it's the fastest way to get your first data line reported.
                        </p>
                    </div>
                    <div className="bg-red-600 p-3 rounded-full shadow-lg shadow-red-900/30 text-white cursor-pointer hover:bg-red-700 transition-colors">
                        <MessageCircle className="h-6 w-6" />
                    </div>
                </div>
            </div>
        </div>
    )
}
