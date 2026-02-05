
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

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser()

    // 2. Mock Org ID for prototype (In real app, we'd fetch from user metadata or context)
    // For now, we fetch the FIRST org we find to demonstrate connectivity.
    const { data: orgs } = await supabase.from('organizations').select('id').limit(1)
    const org = orgs?.[0] as any
    const orgId = org?.id

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
                    <h1 className="text-2xl font-bold tracking-tight">Bureau Programs</h1>
                    <p className="text-muted-foreground">Manage your application status across credit bureaus.</p>
                </div>
                <Button asChild>
                    <Link href="/templates">
                        <Plus className="mr-2 h-4 w-4" />
                        New Program
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
                            <TableHead>Program Title</TableHead>
                            <TableHead>Bureau</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Readiness</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {programs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No active programs found. Create one from a template.
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
