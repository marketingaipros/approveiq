"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

// Mock Data
const MOCK_LOGS = [
    { id: '1', action: 'document_uploaded', user: 'alice@example.com', target: 'W-9 Form', timestamp: '2023-10-25 10:30 AM', ip: '192.168.1.1' },
    { id: '2', action: 'status_changed', user: 'system', target: 'W-9 Form', timestamp: '2023-10-25 10:31 AM', ip: '10.0.0.1', details: 'Status changed to pending_review' },
    { id: '3', action: 'document_rejected', user: 'bob@approver.com', target: 'Insurance Cert', timestamp: '2023-10-26 09:15 AM', ip: '172.16.0.1', details: 'Reason: Expired' },
    { id: '4', action: 'project_created', user: 'alice@example.com', target: 'Vendor Onboarding', timestamp: '2023-10-23 02:00 PM', ip: '192.168.1.1' },
]

export function AuditLogViewer() {

    const handleExport = () => {
        // Simple CSV Export Logic
        const headers = ["ID", "Action", "User", "Target", "Timestamp", "IP Address", "Details"]
        const csvContent = [
            headers.join(","),
            ...MOCK_LOGS.map(log => [
                log.id,
                log.action,
                log.user,
                log.target,
                log.timestamp,
                log.ip,
                `"${log.details || ''}"`
            ].join(","))
        ].join("\n")

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", "audit_logs.csv")
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={handleExport}>
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                </Button>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Timestamp</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Target</TableHead>
                            <TableHead>IP Address</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {MOCK_LOGS.map((log) => (
                            <TableRow key={log.id}>
                                <TableCell className="whitespace-nowrap text-muted-foreground text-sm">{log.timestamp}</TableCell>
                                <TableCell className="font-medium">{log.user}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">{log.action}</Badge>
                                </TableCell>
                                <TableCell>{log.target}</TableCell>
                                <TableCell className="font-mono text-xs text-muted-foreground">{log.ip}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
