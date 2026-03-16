
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, ArrowRight, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export default async function ProgramsPage() {
    const supabase = await createClient()

    // 1. Get current user profile and org_id
    const { data: { session } } = await supabase.auth.getSession()
    
    let orgId = null;
    if (session?.user) {
        const { data: profile } = await (supabase as any)
            .from('profiles')
            .select('org_id')
            .eq('id', session.user.id)
            .single()
        orgId = profile?.org_id
    }

    let programs: any[] = []
    let error = null

    if (orgId) {
        const { data, error: fetchError } = await supabase
            .from('bureau_programs')
            .select('*')
            .eq('org_id', orgId)
        //.order('created_at', { ascending: false })
        // Note: If order fails due to index missing, remove it for prototype

        programs = data || []
        error = fetchError
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Active Credit Bureaus</h1>
                    <p className="text-muted-foreground">Manage your application status across credit bureaus.</p>
                </div>
                <Button asChild>
                    <Link href="/templates">
                        <Plus className="mr-2 h-4 w-4" />
                        New Credit Bureau
                    </Link>
                </Button>
            </div>

            {error && (
                <div className="bg-destructive/15 text-destructive p-4 rounded-md flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>Failed to load programs: {error.message}</span>
                </div>
            )}

            {!orgId && (
                <div className="bg-yellow-500/15 text-yellow-600 p-4 rounded-md flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>No Organization found. Please check database configuration.</span>
                </div>
            )}

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Bureau Name</TableHead>
                            <TableHead>Provider</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Readiness</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {programs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No active credit bureaus found. Create one from a template.
                                </TableCell>
                            </TableRow>
                        ) : (
                            programs.map((program) => (
                                <TableRow key={program.id}>
                                    <TableCell className="font-medium">{program.title}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{program.bureau}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={program.status === 'active' ? 'default' : 'secondary'}>
                                            {program.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{program.progress_percent}%</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/programs/${program.id}`}>
                                                View <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
