import { getAllBureauRules } from "@/lib/knowledge-actions"
import { buildTemplateFromRules } from "@/lib/templates"
import { createProgramFromTemplate } from "@/lib/actions"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Info, Zap } from "lucide-react"

// Rule description helpers for readable display
function formatRule(key: string, value: unknown): string | null {
    if (key === "min_records" && Number(value) > 0) return `Min ${value} records`
    if (key === "requires_dispute_doc" && value) return "Dispute policy required"
    if (key === "requires_lending_license" && value) return "Lending license or volume exception"
    if (key === "repayment_types" && Array.isArray(value)) return `Payment: ${(value as string[]).join(", ")}`
    return null
}

export default async function TemplatesPage() {
    // Fetch live KB entries to drive template generation
    const kbEntries = await getAllBureauRules()

    // Build templates from live DB rules
    const dynamicTemplates = kbEntries
        .filter(e => e.bureau && e.rules_json)
        .map(e => buildTemplateFromRules(e))

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Templates</h1>
                    <p className="text-muted-foreground flex items-center gap-1.5 mt-1">
                        <Zap className="h-3.5 w-3.5 text-amber-500" />
                        Dynamically generated from live Knowledge Base rules
                    </p>
                </div>
            </div>

            {dynamicTemplates.length === 0 && (
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                        No bureau rules found in the Knowledge Base yet. Run the seed script or add entries in Supabase to unlock dynamic templates.
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {dynamicTemplates.map((template) => {
                    const kbEntry = kbEntries.find(e => e.bureau === template.bureau)
                    const rules = kbEntry?.rules_json || {}
                    const ruleLabels = Object.entries(rules)
                        .map(([k, v]) => formatRule(k, v))
                        .filter(Boolean) as string[]

                    return (
                        <Card key={template.id} className="flex flex-col border-t-2 border-t-slate-200 hover:border-t-indigo-500 transition-colors">
                            <CardHeader>
                                <div className="flex items-center justify-between mb-2">
                                    <Badge variant="outline" className="capitalize">{template.bureau}</Badge>
                                    <span className="text-xs text-muted-foreground">Live Rules</span>
                                </div>
                                <CardTitle>{template.name}</CardTitle>
                                <CardDescription>{template.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-4">
                                {/* Live rules badges */}
                                {ruleLabels.length > 0 && (
                                    <div>
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Compliance Rules</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {ruleLabels.map((r, i) => (
                                                <span key={i} className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full px-2.5 py-0.5 font-medium">
                                                    {r}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {/* Checklist items */}
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                        {template.items.length} Requirements
                                    </p>
                                    <ul className="space-y-1">
                                        {template.items.map((item, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                                                {item.title}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <form action={createProgramFromTemplate.bind(null, template.id)} className="w-full">
                                    <Button type="submit" className="w-full">
                                        Use Template
                                    </Button>
                                </form>
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
