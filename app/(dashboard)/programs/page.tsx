"use client"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
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
import Link from "next/link"
import { Plus } from "lucide-react"

export default function ProjectsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
                    <p className="text-muted-foreground">Manage your active compliance and onboarding projects.</p>
                </div>
                <Button asChild>
                    <Link href="/templates">
                        <Plus className="mr-2 h-4 w-4" />
                        New Project
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Projects</CardTitle>
                    <CardDescription>
                        You have 3 active projects.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Project Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Progress</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* Mock Data */}
                            <TableRow>
                                <TableCell className="font-medium">
                                    <Link href="/projects/1" className="hover:underline">
                                        Vendor Onboarding - Acme Corp
                                    </Link>
                                </TableCell>
                                <TableCell><Badge variant="secondary">Active</Badge></TableCell>
                                <TableCell>65%</TableCell>
                                <TableCell>2023-10-23</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href="/projects/1">View</Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">
                                    <Link href="/projects/2" className="hover:underline">
                                        ISO 27001 Audit
                                    </Link>
                                </TableCell>
                                <TableCell><Badge>Review Needed</Badge></TableCell>
                                <TableCell>90%</TableCell>
                                <TableCell>2023-11-01</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href="/projects/2">View</Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
