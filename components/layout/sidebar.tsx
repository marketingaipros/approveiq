import Link from "next/link"
import {
    Bell,
    Building2,
    Home,
    LineChart,
    Package2,
    Settings,
    ShoppingCart,
    Users,
    FileCheck,
    ShieldCheck,
    BookOpen
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { isEntitled } from "@/lib/utils"
import { Lock, Database } from "lucide-react"

interface SidebarProps {
    tier?: string
    isAdmin?: boolean
}

export function Sidebar({ tier = 'starter', isAdmin = false }: SidebarProps) {
    const NavLink = ({ href, icon: Icon, children, feature }: any) => {
        const entitled = feature ? isEntitled(tier, feature) : true

        return (
            <Link
                href={entitled ? href : "#"}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${entitled ? 'text-muted-foreground' : 'text-muted-foreground/50 cursor-not-allowed grayscale'
                    }`}
            >
                <Icon className="h-4 w-4" />
                <span className="flex-1">{children}</span>
                {!entitled && <Lock className="h-3 w-3" />}
            </Link>
        )
    }

    return (
        <div className="hidden border-r bg-muted/40 md:block">
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                        <Package2 className="h-6 w-6" />
                        <span className="">ApproveIQ</span>
                    </Link>
                    <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
                        <Bell className="h-4 w-4" />
                        <span className="sr-only">Toggle notifications</span>
                    </Button>
                </div>
                <div className="flex-1 overflow-auto">
                    <nav className="grid items-start px-2 text-sm font-medium lg:px-4 pb-4">
                        <div className="pt-4 pb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">General</div>
                        <NavLink href="/dashboard" icon={Home}>Dashboard</NavLink>
                        <NavLink href="/programs" icon={ShoppingCart}>Credit Bureaus</NavLink>

                        <div className="pt-4 pb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">Applications</div>
                        <NavLink href="/equifax-onboarding" icon={ShieldCheck}>Equifax</NavLink>
                        <NavLink href="/experian-onboarding" icon={ShieldCheck}>Experian</NavLink>
                        <NavLink href="/sbfe-onboarding" icon={ShieldCheck}>SBFE</NavLink>
                        <NavLink href="/dnb-onboarding" icon={ShieldCheck}>D&amp;B</NavLink>

                        {isAdmin && (
                            <>
                                <div className="pt-4 pb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">Admin Controls</div>
                                <NavLink href="/admin/clients" icon={Building2}>Organizations</NavLink>
                                <NavLink href="/templates" icon={FileCheck}>Templates</NavLink>
                                <NavLink href="/knowledge" icon={BookOpen}>Knowledge Base</NavLink>
                                <NavLink href="/admin/equifax" icon={Building2}>Admin: Equifax</NavLink>
                                <NavLink href="/admin/kb-seeder" icon={Database}>Admin: KB Seeder</NavLink>
                                <NavLink href="/admin/requirement-manager" icon={Settings}>Admin: Requirements</NavLink>
                                <NavLink href="/analytics" icon={LineChart} feature="advanced_security">Analytics</NavLink>
                            </>
                        )}

                        <div className="pt-4 pb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">Settings</div>
                        <NavLink href="/settings/users" icon={Users} feature="team_management">Users</NavLink>
                        <NavLink href="/settings/audit" icon={FileCheck} feature="audit_export">Audit Logs</NavLink>
                        <NavLink href="/settings/security" icon={ShieldCheck}>Security</NavLink>
                    </nav>
                </div>
                {tier !== 'enterprise' && !isAdmin && (
                    <div className="mt-auto p-4">
                        <Card>
                            <CardHeader className="p-2 pt-0 md:p-4">
                                <CardTitle>Upgrade to Enterprise</CardTitle>
                                <CardDescription>
                                    Unlock Audit Logs, Multi-User, and SBA reporting.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
                                <Button size="sm" className="w-full">
                                    Upgrade
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}
