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
    Lock,
    Zap,
    TrendingUp,
    LayoutDashboard
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
import { ConciergeAssistant } from "@/components/dashboard/concierge-assistant"
import { DashboardToasts } from "@/components/dashboard/dashboard-toasts"
import { Suspense } from "react"

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ success?: string }> }) {
    const params = await searchParams;
    const success = params.success;
    
    const SUCCESS_HEADERS: Record<string, string> = {
        experian: "Experian Submission Received!",
        equifax: "Equifax Application Live!",
        sbfe: "SBFE Data Synced!",
        dnb: "Full Coverage Achieved! 🏆"
    }

    const SUCCESS_SUBTEXTS: Record<string, string> = {
        experian: "Data successfully synced to our compliance bridge. View Equifax below.",
        equifax: "You're halfway to the Big Three. Let's look at SBFE for small business depth.",
        sbfe: "Small Business Financial Exchange is active. Final step: D&B (Dun & Bradstreet).",
        dnb: "All major bureaus are pending. Let's set up your First Data Batch for reporting."
    }

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
        .select('id, name, bureau_readiness_score, ein')
        .eq('id', profile?.org_id || '')
        .maybeSingle()

    // If SuperAdmin and org missing, use the default master org
    if (isSuperAdmin && !org) {
        const { data: masterOrg } = await (supabase as any)
            .from('organizations')
            .select('id, name, bureau_readiness_score, ein')
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
    const hasEin = !!(org as any)?.ein
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

    const readinessScore = org?.bureau_readiness_score || 0;
    const circumference = 2 * Math.PI * 120; // Larger gauge
    const strokeDashoffset = circumference - (readinessScore / 100) * circumference;

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

    return (
        <div className="relative min-h-screen bg-[#F8FAFC] dark:bg-[#09090B]">
            <Suspense fallback={null}>
                <DashboardToasts />
            </Suspense>
            
            {/* Success Hero Overlay (Conditional) */}
            {success && SUCCESS_HEADERS[success] && (
                <div className="mb-8 p-6 bg-[#0066FF] rounded-[2rem] shadow-2xl shadow-blue-500/20 text-white flex flex-col md:flex-row items-center justify-between animate-in slide-in-from-top duration-700">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
                            <Clock className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black italic">{SUCCESS_HEADERS[success]}</h3>
                            <p className="text-blue-100 text-sm font-bold">{SUCCESS_SUBTEXTS[success]}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4 md:mt-0">
                        <Badge className="bg-white/20 text-white border-none font-black text-[10px] uppercase px-3 py-1">Synced & Secured</Badge>
                    </div>
                </div>
            )}

            {/* Header Content */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-8 w-1 bg-[#0066FF] rounded-full" />
                        <span className="text-xs font-bold uppercase tracking-widest text-[#0066FF]">Intelligent Dashboard</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 italic">Command Center</h1>
                    <p className="text-muted-foreground text-sm flex items-center gap-1.5 font-semibold">
                        <Briefcase className="h-4 w-4" />
                        {(org as any)?.name || 'Fintech Architecture'} &bull; API Key Active
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-2xl border-zinc-200 dark:border-zinc-800 h-12 px-6 font-bold shadow-sm">
                        <TrendingUp className="h-4 w-4 mr-2 text-emerald-500" />
                        Performance
                    </Button>
                    <Button className="rounded-2xl bg-[#0066FF] hover:bg-[#0052CC] h-12 px-6 font-bold shadow-xl shadow-blue-500/20">
                        <Zap className="h-4 w-4 mr-2 fill-current" />
                        Instant Support
                    </Button>
                </div>
            </div>

            {/* Launchpad: Horizontal Onboarding Tracker (Modern Horizontal) */}
            <div className="mb-12 relative">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-zinc-200 dark:bg-zinc-800 -translate-y-1/2 hidden md:block" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                    <div className={`group relative p-6 rounded-3xl transition-all duration-500 ${currentStep === 1 ? 'bg-white dark:bg-zinc-900 shadow-2xl shadow-blue-500/10 ring-2 ring-[#0066FF]' : 'bg-transparent opacity-50'}`}>
                        <div className="flex items-center gap-4">
                            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-xl transition-all ${currentStep >= 1 ? 'bg-[#0066FF] text-white rotate-3 group-hover:rotate-0' : 'bg-zinc-100 text-zinc-400'}`}>1</div>
                            <div className="flex flex-col">
                                <span className="text-sm font-black uppercase tracking-tight">Step One</span>
                                <span className="text-lg font-bold">Business Profile</span>
                            </div>
                            {currentStep > 1 && <div className="ml-auto bg-emerald-500 p-1 rounded-full"><CheckCircle2 className="h-4 w-4 text-white" /></div>}
                        </div>
                    </div>
                    <div className={`group relative p-6 rounded-3xl transition-all duration-500 ${currentStep === 2 ? 'bg-white dark:bg-zinc-900 shadow-2xl shadow-blue-500/10 ring-2 ring-[#0066FF]' : 'bg-transparent opacity-50'}`}>
                        <div className="flex items-center gap-4">
                            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-xl transition-all ${currentStep >= 2 ? 'bg-[#0066FF] text-white rotate-3 group-hover:rotate-0' : 'bg-zinc-100 text-zinc-400'}`}>2</div>
                            <div className="flex flex-col">
                                <span className="text-sm font-black uppercase tracking-tight">Step Two</span>
                                <span className="text-lg font-bold">Experian Direct</span>
                            </div>
                            {currentStep > 2 && <div className="ml-auto bg-emerald-500 p-1 rounded-full"><CheckCircle2 className="h-4 w-4 text-white" /></div>}
                        </div>
                    </div>
                    <div className={`group relative p-6 rounded-3xl transition-all duration-500 ${currentStep === 3 ? 'bg-white dark:bg-zinc-900 shadow-2xl shadow-blue-500/10 ring-2 ring-[#0066FF]' : 'bg-transparent opacity-50'}`}>
                        <div className="flex items-center gap-4">
                            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-xl transition-all ${currentStep >= 3 ? 'bg-[#0066FF] text-white rotate-3 group-hover:rotate-0' : 'bg-zinc-100 text-zinc-400'}`}>3</div>
                            <div className="flex flex-col">
                                <span className="text-sm font-black uppercase tracking-tight">Step Three</span>
                                <span className="text-lg font-bold">Scaling Phase</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-10 lg:grid-cols-12">
                {/* The Muscle: Membership List */}
                <div className="lg:col-span-8 space-y-8">
                    <Card className="border-none shadow-2xl bg-white dark:bg-zinc-900 overflow-hidden rounded-[2.5rem]">
                        <CardHeader className="p-8 border-b dark:border-zinc-800">
                             <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight">Bureau Connectivity</h2>
                                    <p className="text-muted-foreground font-medium">Manage and monitor live data furnishing status.</p>
                                </div>
                                <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                    <Activity className="h-6 w-6 text-[#0066FF]" />
                                </div>
                             </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y dark:divide-zinc-800">
                                {bureauStatuses.map((b) => (
                                    <div key={b.name} className="p-8 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                                        <div className="flex items-center gap-6">
                                            <div className={`h-16 w-16 rounded-[1.5rem] flex items-center justify-center transition-all group-hover:scale-110 ${
                                                b.status === 'Active' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 
                                                b.status === 'Pending' ? 'bg-[#0066FF10] text-[#0066FF]' : 
                                                'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                                            }`}>
                                                {b.status === 'Active' ? <FileCheck className="h-8 w-8" /> : 
                                                 b.status === 'Pending' ? <Clock className="h-8 w-8" /> : 
                                                 <Circle className="h-8 w-8" />}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black tracking-tight">{b.name} <span className="text-muted-foreground font-normal ml-1">Reporting</span></h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge className={`rounded-full px-3 py-0.5 text-[10px] font-black tracking-widest uppercase ${
                                                        b.status === 'Active' ? 'bg-emerald-500 text-white border-none' : 
                                                        b.status === 'Pending' ? 'bg-[#0066FF] text-white border-none' : 
                                                        'bg-zinc-200 dark:bg-zinc-800 text-zinc-500 border-none'
                                                    }`}>
                                                        {b.status}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground font-bold italic">Standard Secure Link</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button className={`rounded-2xl h-12 px-8 font-black transition-all ${
                                            b.status === 'Not Started' 
                                            ? 'bg-[#0066FF] hover:bg-[#0052CC] shadow-lg shadow-blue-500/20 text-white' 
                                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 hover:bg-zinc-200 dark:hover:bg-zinc-700 underline underline-offset-4'
                                        }`} asChild>
                                            <Link href={b.path}>
                                                {b.status === 'Not Started' ? 'Furnish Data' : 'Manage'}
                                            </Link>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pending Review Alerts */}
                    {pendingReviews > 0 && (
                        <div className="bg-orange-600 p-[1px] rounded-[2.5rem] shadow-2xl">
                             <div className="bg-orange-50 dark:bg-orange-900/10 p-8 rounded-[2.4rem] flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-6">
                                    <div className="h-14 w-14 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-xl shadow-orange-600/20">
                                        <Sparkles className="h-7 w-7" />
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-black tracking-tight text-orange-900 dark:text-orange-50 italic">AI Intelligence Alert</h4>
                                        <p className="text-orange-800/80 dark:text-orange-200/80 font-bold">{pendingReviews} items require immediate correction for compliance.</p>
                                    </div>
                                </div>
                                <Button className="rounded-2xl h-14 px-8 bg-orange-600 hover:bg-orange-700 text-white font-black text-lg" asChild>
                                    <Link href="/programs">Fix Now</Link>
                                </Button>
                             </div>
                        </div>
                    )}
                </div>

                {/* The Health Gauge: Side Panel */}
                <div className="lg:col-span-4 space-y-10">
                    <Card className="border-none shadow-2xl bg-white dark:bg-zinc-900 p-10 flex flex-col items-center rounded-[3rem] relative overflow-hidden group">
                         {/* Abstract background blur */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#0066FF] to-transparent" />
                        
                        <CardHeader className="text-center p-0 mb-8">
                            <h2 className="text-sm font-black uppercase tracking-[0.25em] text-muted-foreground mb-1">Global Readiness</h2>
                            <p className="text-xl font-black text-zinc-900 dark:text-zinc-50 italic tracking-tighter">System Health Index</p>
                        </CardHeader>
                        
                        {/* THE LARGE GAUGE */}
                        <div className="relative h-64 w-64 mb-10 group-hover:scale-105 transition-transform duration-700">
                             <svg className="transform -rotate-90 w-full h-full p-2">
                                <defs>
                                    <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#0066FF" />
                                        <stop offset="100%" stopColor="#00E5FF" />
                                    </linearGradient>
                                </defs>
                                <circle
                                    cx="120"
                                    cy="120"
                                    r="105"
                                    stroke="currentColor"
                                    strokeWidth="16"
                                    fill="transparent"
                                    className="text-zinc-50 dark:text-zinc-800"
                                />
                                <circle
                                    cx="120"
                                    cy="120"
                                    r="105"
                                    stroke="url(#gaugeGradient)"
                                    strokeWidth="16"
                                    fill="transparent"
                                    strokeDasharray={2 * Math.PI * 105}
                                    strokeDashoffset={(2 * Math.PI * 105) - (readinessScore / 100) * (2 * Math.PI * 105)}
                                    strokeLinecap="round"
                                    className="transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-6xl font-black text-zinc-900 dark:text-zinc-50 tracking-tighter">{readinessScore}</span>
                                <span className="text-xs font-black uppercase tracking-widest text-[#0066FF] -mt-1">Verified Score</span>
                            </div>
                        </div>

                        <div className="w-full grid grid-cols-2 gap-4 mt-4">
                            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-3xl text-center">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Target</p>
                                <p className="text-xl font-black text-[#0066FF]">95%</p>
                            </div>
                            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-3xl text-center">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Status</p>
                                <p className="text-xl font-black text-emerald-500 italic">{readinessScore > 80 ? 'Stable' : 'Optimal'}</p>
                            </div>
                        </div>

                        <p className="text-xs text-muted-foreground text-center mt-8 font-bold leading-relaxed px-4">
                            Real-time compliance monitoring actively scanning 4 bureau data endpoints.
                        </p>
                    </Card>

                    <Card className="border-none shadow-2xl bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] relative overflow-hidden group">
                        <div className="absolute right-0 bottom-0 opacity-10 p-4">
                            <Shield className="h-24 w-24 text-[#0066FF]" />
                        </div>
                        <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-6">Security Context</h4>
                        <div className="flex items-center gap-5">
                            <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-[#0066FF] to-[#00E5FF] p-[2px]">
                                <div className="h-full w-full bg-white dark:bg-zinc-900 rounded-[calc(1.5rem-2px)] flex items-center justify-center font-black text-2xl text-[#0066FF]">
                                    {((profile as any)?.full_name || 'U').charAt(0).toUpperCase()}
                                </div>
                            </div>
                            <div>
                                <h5 className="text-xl font-black italic">{(profile as any)?.full_name || 'System User'}</h5>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge className="bg-emerald-500 text-white border-none font-black text-[10px] uppercase">Online</Badge>
                                    <span className="text-xs text-muted-foreground font-bold">Encrypted Session</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Setup Assistant (Concierge) - ULTRA GLASSMORPHISM BOT */}
            <ConciergeAssistant 
                message={assistantMessage} 
                actionLink={assistantActionLink} 
                actionText={assistantActionText} 
            />

            {/* DESIGN SYSTEM UTILITIES */}
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes pulse-slow {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                .italic-strike { font-style: italic; letter-spacing: -0.05em; }
            `}} />
        </div>
    )
}
