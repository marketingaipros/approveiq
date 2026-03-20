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
    MessageCircle,
    ChevronRight,
    Briefcase,
    FileCheck,
    Lock
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
        .select('org_id, full_name')
        .eq('id', session?.user?.id || '')
        .maybeSingle()

    const isSuperAdmin = session?.user?.id === 'a1c8f199-63b0-43a8-b82d-12c21c59187e' || (profile as any)?.is_system_admin

    // Use maybeSingle to avoid error if null
    let { data: org } = await (supabase as any)
        .from('organizations')
        .select('id, name, bureau_readiness_score, data_cache')
        .eq('id', profile?.org_id || '')
        .maybeSingle()

    // If SuperAdmin and org missing, use the default master org
    if (isSuperAdmin && !org) {
        const { data: masterOrg } = await (supabase as any)
            .from('organizations')
            .select('id, name, bureau_readiness_score, data_cache')
            .eq('id', '00000000-0000-0000-0000-000000000000')
            .maybeSingle()
        if (masterOrg) org = masterOrg
    }

    const orgId = org?.id

    // 2. Fetch Metrics (Parallel)
    const bureauAppsQuery = supabase
        .from('bureau_applications')
        .select('*')
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
        { count: pendingItemsCount },
        { count: pendingProgramsCount }
    ] = await Promise.all([bureauAppsQuery, pendingItemsQuery, pendingProgramsQuery])

    const pendingReviews = (pendingItemsCount || 0) + (pendingProgramsCount || 0)

    // Logics for Assistant & Launchpad
    const hasFullName = !!(profile as any)?.full_name
    const hasCompanyName = !!(org as any)?.name
    const hasEin = !!(org as any)?.data_cache?.ein
    const isProfileComplete = hasFullName && hasCompanyName && hasEin

    const experianApp = (bureauApps as any[])?.find(a => a.bureau_name.toLowerCase() === 'experian')
    const hasApps = bureauApps && (bureauApps as any[]).length > 0
    const isExperianApproved = experianApp?.status === 'active' || experianApp?.status === 'Approved'
    
    // Step Determination for Launchpad
    let currentStep = 1;
    if (isProfileComplete) currentStep = 2;
    if (hasApps) currentStep = 3;

    // Bureau Status Mapping (for Readiness Component)
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
        
        if (app?.status === 'active' || app?.status === 'Approved' || app?.completed_at) {
            status = 'Active'
            variant = 'default' 
        } else if (app) {
            status = 'Pending'
            variant = 'secondary' 
        }
        
        return { ...b, status, variant }
    })

    const activeBureausCount = bureauStatuses.filter(b => b.status === 'Active').length
    
    // Assistant Content logic
    let assistantMessage = "Welcome! Let’s complete your profile to get started."
    let assistantActionLink = "/onboarding/profile"
    let assistantActionText = "Complete Profile"

    if (isProfileComplete && !hasApps) {
        assistantMessage = "You’re ready! I suggest starting with Experian first."
        assistantActionLink = "/experian-onboarding"
        assistantActionText = "Start Experian"
    } else if (hasApps && !isExperianApproved) {
        assistantMessage = "Experian is currently reviewing your file. You can track progress here or start Equifax in the meantime."
        assistantActionLink = "/equifax-onboarding"
        assistantActionText = "Check Equifax"
    } else if (isExperianApproved) {
        assistantMessage = "Experian is Approved! Let's get Equifax started to build your bureau presence."
        assistantActionLink = "/equifax-onboarding"
        assistantActionText = "Next Steps"
    }

    const readinessScore = org?.bureau_readiness_score || 0;
    const circumference = 2 * Math.PI * 80;
    const strokeDashoffset = circumference - (readinessScore / 100) * circumference;

    return (
        <div className="relative min-h-screen">
            {/* Command Header */}
            <div className="flex flex-col gap-1 mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">Command Center</h1>
                <p className="text-muted-foreground text-sm flex items-center gap-1.5 font-medium">
                    <Briefcase className="h-4 w-4" />
                    {(org as any)?.name || 'Fintech Organization'} &bull; Managed by {(profile as any)?.full_name || 'Owner'}
                </p>
            </div>

            {/* Launchpad: Horizontal Onboarding Tracker */}
            <Card className="mb-0 border-none bg-zinc-50 dark:bg-zinc-900 shadow-sm overflow-hidden mb-8">
                <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className={`flex-1 flex items-center justify-center p-6 gap-4 border-b md:border-b-0 md:border-r transition-all ${currentStep === 1 ? 'bg-white dark:bg-zinc-800 shadow-[inset_0_2px_0_0_#0066FF] z-10' : 'opacity-40'}`}>
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-zinc-200 text-zinc-500'}`}>1</div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold">Business Profile</span>
                                <span className="text-xs text-muted-foreground">Company & EIN Setup</span>
                            </div>
                            {currentStep > 1 && <CheckCircle2 className="h-5 w-5 text-emerald-500 ml-auto" />}
                        </div>
                        <div className={`flex-1 flex items-center justify-center p-6 gap-4 border-b md:border-b-0 md:border-r transition-all ${currentStep === 2 ? 'bg-white dark:bg-zinc-800 shadow-[inset_0_2px_0_0_#0066FF] z-10' : 'opacity-40'}`}>
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-zinc-200 text-zinc-500'}`}>2</div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold">Experian Setup</span>
                                <span className="text-xs text-muted-foreground">Primary Application</span>
                            </div>
                            {currentStep > 2 && <CheckCircle2 className="h-5 w-5 text-emerald-500 ml-auto" />}
                        </div>
                        <div className={`flex-1 flex items-center justify-center p-6 gap-4 transition-all ${currentStep === 3 ? 'bg-white dark:bg-zinc-800 shadow-[inset_0_2px_0_0_#0066FF] z-10' : 'opacity-40'}`}>
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-zinc-200 text-zinc-500'}`}>3</div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold">Review & Expansion</span>
                                <span className="text-xs text-muted-foreground">Verify & Scale Bureaus</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Membership List (The Engine) */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-zinc-200 shadow-xl dark:border-zinc-800 overflow-hidden">
                        <CardHeader className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b dark:border-zinc-800 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-bold">Membership Applications</CardTitle>
                                    <CardDescription>Track status for all major credit reporting bureaus.</CardDescription>
                                </div>
                                <Activity className="h-6 w-6 text-blue-600" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {bureauStatuses.map((b) => (
                                    <div key={b.name} className="p-6 flex items-center justify-between group hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2.5 rounded-xl ${
                                                b.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 
                                                b.status === 'Pending' ? 'bg-blue-50 text-blue-600' : 
                                                'bg-zinc-100 text-zinc-400'
                                            }`}>
                                                {b.status === 'Active' ? <FileCheck className="h-5 w-5" /> : 
                                                 b.status === 'Pending' ? <Clock className="h-5 w-5" /> : 
                                                 <Circle className="h-5 w-5" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-lg">{b.name} Reporting</p>
                                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Standard Commercial Application</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right hidden sm:block">
                                                <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Status</p>
                                                <Badge variant={b.variant} className={
                                                    b.status === 'Active' ? 'bg-emerald-500 hover:bg-emerald-600 border-none px-3 py-1 font-bold' : 
                                                    b.status === 'Pending' ? 'bg-blue-600 hover:bg-blue-700 border-none text-white px-3 py-1 font-bold' : 
                                                    'px-3 py-1 font-bold border-zinc-300 text-zinc-500'
                                                }>
                                                    {b.status}
                                                </Badge>
                                            </div>
                                            {b.status === 'Not Started' ? (
                                                <Button className="rounded-xl h-11 px-6 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-blue-900/20 font-bold" asChild>
                                                    <Link href={b.path}>Start Now</Link>
                                                </Button>
                                            ) : (
                                                <Button variant="outline" size="icon" className="rounded-xl h-11 w-11 hover:text-blue-600 hover:border-blue-600" asChild>
                                                    <Link href={b.path}><ChevronRight className="h-5 w-5" /></Link>
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pending Items */}
                    {pendingReviews > 0 && (
                        <Card className="border-l-4 border-l-orange-500 shadow-lg animate-in fade-in slide-in-from-left-4 duration-500">
                             <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
                                    <Sparkles className="h-5 w-5 text-orange-500" />
                                    Review Requirements ({pendingReviews})
                                </CardTitle>
                             </CardHeader>
                             <CardContent className="flex items-center justify-between pb-6">
                                <p className="text-sm text-muted-foreground">Items are locked for review. Please check all programs to see detailed feedback.</p>
                                <Button variant="secondary" className="font-bold" asChild>
                                    <Link href="/programs">View All</Link>
                                </Button>
                             </CardContent>
                        </Card>
                    )}
                </div>

                {/* Bureau Readiness Gauge Side */}
                <div className="space-y-6">
                    <Card className="border-zinc-200 shadow-xl dark:border-zinc-800 text-center overflow-hidden">
                        <CardHeader className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b dark:border-zinc-800">
                            <CardTitle className="text-lg">Aggregate Readiness</CardTitle>
                        </CardHeader>
                        <CardContent className="p-10 flex flex-col items-center">
                            <div className="relative h-48 w-48 mb-6">
                                {/* BACKGROUND CIRCLE */}
                                <svg className="transform -rotate-90 w-full h-full">
                                    <circle
                                        cx="96"
                                        cy="96"
                                        r="80"
                                        stroke="currentColor"
                                        strokeWidth="12"
                                        fill="transparent"
                                        className="text-zinc-100 dark:text-zinc-800"
                                    />
                                    <circle
                                        cx="96"
                                        cy="96"
                                        r="80"
                                        stroke="#0066FF"
                                        strokeWidth="12"
                                        fill="transparent"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000 ease-out"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-5xl font-black text-zinc-900 dark:text-zinc-50">{readinessScore}%</span>
                                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Score</span>
                                </div>
                            </div>
                            <div className="space-y-4 w-full">
                                <div className="flex justify-between items-center text-sm font-medium">
                                    <span className="text-muted-foreground">Compliance Goal</span>
                                    <span className="text-zinc-900 dark:text-zinc-50 font-bold">95%</span>
                                </div>
                                <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                                     <div 
                                        className="bg-zinc-400 h-full transition-all duration-1000" 
                                        style={{ width: '95%' }} 
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground text-left leading-relaxed">
                                    Your readiness score is a weighted average of your data health and bureau compliance standing.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-zinc-200 shadow-xl dark:border-zinc-800 overflow-hidden">
                        <CardHeader className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b dark:border-zinc-800">
                            <CardTitle className="text-lg">Authorized Users</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                    {((profile as any)?.full_name || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold">{(profile as any)?.full_name || 'Authorized Member'}</p>
                                    <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-bold uppercase tracking-wider">Owner</Badge>
                                </div>
                                <div className="ml-auto flex items-center gap-1.5 text-emerald-500">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-xs font-bold">Online</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Setup Assistant (Concierge) - GLASSMORPHISM STYLE */}
            <div className="fixed bottom-8 right-8 z-[100] group animate-in slide-in-from-bottom-12 duration-1000">
                <div className="flex flex-col items-end gap-5">
                    <div className="mb-2 transition-all group-hover:-translate-y-2 pointer-events-auto">
                        <div className="relative bg-white/70 dark:bg-zinc-900/70 border border-white/20 dark:border-white/10 backdrop-blur-xl p-6 rounded-[2rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] dark:shadow-black/50 max-w-[320px] ring-1 ring-black/5 dark:ring-white/10">
                            <div className="flex items-start gap-3 mb-3">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg">
                                    <Sparkles className="h-4 w-4" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-500 mt-1">Concierge Assistant</span>
                            </div>
                            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-relaxed mb-5">
                                {assistantMessage}
                            </p>
                            {assistantActionLink && (
                                <Button className="w-full rounded-2xl h-12 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-950 font-black tracking-tight hover:scale-[1.03] transition-transform active:scale-95" asChild>
                                    <Link href={assistantActionLink}>
                                        {assistantActionText}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                    {/* Bot Button */}
                    <button className="bg-blue-600 dark:bg-blue-600 p-5 rounded-[2rem] shadow-[0_15px_30px_-5px_rgba(0,102,255,0.4)] text-white hover:bg-blue-700 hover:rotate-6 transition-all active:scale-90 ring-4 ring-blue-100 dark:ring-blue-900/30">
                        <MessageCircle className="h-8 w-8 fill-current" />
                    </button>
                </div>
            </div>

            {/* CSS FOR GAUGE & ANIMATIONS */}
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes slideIn {
                    from { transform: translateX(-10px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .concierge-bot {
                    transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
            `}} />
        </div>
    )
}
