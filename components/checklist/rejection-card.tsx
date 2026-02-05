import { AlertCircle, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

interface RejectionCardProps {
    reason: string
    solution?: string
    onRetry: () => void
}

export function RejectionCard({ reason, solution, onRetry }: RejectionCardProps) {
    return (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/10 mt-2 animate-in fade-in slide-in-from-top-2">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Action Required: Document Rejected
                </CardTitle>
                <CardDescription className="text-red-600/90 dark:text-red-400/90">
                    {reason}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {solution && (
                    <p className="text-sm text-muted-foreground mb-4">
                        <strong>How to fix:</strong> {solution}
                    </p>
                )}
            </CardContent>
            <CardFooter>
                <Button variant="destructive" size="sm" onClick={onRetry} className="gap-2">
                    <Upload className="h-4 w-4" />
                    Re-upload Document
                </Button>
            </CardFooter>
        </Card>
    )
}
