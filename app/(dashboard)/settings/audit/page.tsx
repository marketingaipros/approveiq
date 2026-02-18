import { AuditLogViewer } from "@/components/compliance/audit-log-viewer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExportAuditButton } from "@/components/compliance/export-audit-button"

export default function AuditPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
                <p className="text-muted-foreground">Immutable record of all system activities for compliance and security.</p>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                        <CardTitle>System Activity</CardTitle>
                        <CardDescription>
                            Displaying recent 50 events. Export for full history.
                        </CardDescription>
                    </div>
                    <ExportAuditButton />
                </CardHeader>
                <CardContent>
                    <AuditLogViewer />
                </CardContent>
            </Card>
        </div>
    )
}
