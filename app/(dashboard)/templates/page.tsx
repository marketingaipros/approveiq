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
import { STANDARD_TEMPLATES } from "@/lib/constants/templates"
import { useRouter } from "next/navigation"

export default function TemplatesPage() {
    const router = useRouter()

    const handleUseTemplate = (templateId: string) => {
        // In a real app, this would open a dialog to name the project
        // and then call an API to create the project copies the items.
        // For now, we'll just mock it or navigate to a create page.
        console.log("Using template", templateId)
        // router.push(`/projects/new?template=${templateId}`)
        alert("In a real implementation, this would create a new Project with these items.")
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
                {STANDARD_TEMPLATES.map((template) => (
                    <Card key={template.id} className="flex flex-col">
                        <CardHeader>
                            <CardTitle>{template.name}</CardTitle>
                            <CardDescription>{template.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Includes {template.items.length} items:</p>
                                <ul className="text-sm text-muted-foreground list-disc list-inside">
                                    {template.items.slice(0, 3).map((item, i) => (
                                        <li key={i}>{item.title}</li>
                                    ))}
                                    {template.items.length > 3 && <li>+{template.items.length - 3} more...</li>}
                                </ul>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={() => handleUseTemplate(template.id)}>
                                Use Template
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
