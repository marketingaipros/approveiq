"use client"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BUREAU_TEMPLATES } from "@/lib/templates"
import { createProgramFromTemplate } from "@/lib/actions"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Loader2, Plus } from "lucide-react"

export default function TemplatesPage() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    const handleUseTemplate = (templateId: string) => {
        setError(null)
        startTransition(async () => {
            try {
                await createProgramFromTemplate(templateId)
            } catch (err: any) {
                console.error("Template error:", err)
                setError(err.message || "Failed to create program")
            }
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Templates</h1>
                    <p className="text-muted-foreground">Start a new project from a verified compliance template.</p>
                </div>
                <Button>Create Custom Template</Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {BUREAU_TEMPLATES.map((template) => (
                    <Card key={template.id} className="flex flex-col">
                        <CardHeader>
                            <div className="flex items-center justify-between mb-2">
                                <Badge variant="outline" className="capitalize">{template.bureau}</Badge>
                            </div>
                            <CardTitle>{template.name}</CardTitle>
                            <CardDescription>{template.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Includes {template.items.length} requirements:</p>
                                <ul className="text-sm text-muted-foreground list-disc list-inside">
                                    {template.items.map((item, i) => (
                                        <li key={i}>{item.title}</li>
                                    ))}
                                </ul>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full"
                                onClick={() => handleUseTemplate(template.id)}
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    "Use Template"
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
