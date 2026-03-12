import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Info, ShieldCheck } from "lucide-react"
import ReactMarkdown from 'react-markdown'
import type { BureauRules } from "@/lib/templates"

// Renders compliance rules as readable label chips
function RulesPanel({ rules }: { rules: BureauRules }) {
    const chips: string[] = []
    if (rules.min_records && rules.min_records > 0) chips.push(`Min ${rules.min_records} records`)
    if (rules.requires_dispute_doc) chips.push("Dispute doc required")
    if (rules.requires_lending_license) chips.push("Lending license required")
    if (rules.repayment_types?.length) chips.push(`Payments: ${rules.repayment_types.join(", ")}`)
    if (rules.required_checklist_tags?.length) chips.push(`${rules.required_checklist_tags.length} checklist items`)

    if (chips.length === 0) return null

    return (
        <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5 mb-2">
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Live Compliance Rules</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
                {chips.map((chip, i) => (
                    <span
                        key={i}
                        className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full px-2.5 py-0.5 font-medium"
                    >
                        {chip}
                    </span>
                ))}
            </div>
        </div>
    )
}

export default async function KnowledgeBasePage() {
    const supabase = await createClient()

    const { data: topics, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .order('topic', { ascending: true })

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
                <p className="text-muted-foreground">Procedural standards and technical guidance for credit bureau compliance. Rules here drive Templates and the AI Compliance Agent automatically.</p>
            </div>

            {error ? (
                <div className="p-4 border border-destructive/20 bg-destructive/10 rounded-lg text-destructive flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    <p>Failed to load knowledge base content.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {topics?.map((topic: any) => (
                        <Card key={topic.id} className="h-full flex flex-col hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between mb-2">
                                    <Badge variant="outline" className="capitalize">{topic.bureau || 'General'}</Badge>
                                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <CardTitle className="text-xl">{topic.topic}</CardTitle>
                                <CardDescription>Official procedural guidance</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-hidden flex flex-col">
                                <div className="prose dark:prose-invert prose-sm max-w-none line-clamp-5">
                                    <ReactMarkdown>{topic.content}</ReactMarkdown>
                                </div>

                                {/* Render structured rules if available */}
                                {topic.rules_json && (
                                    <RulesPanel rules={topic.rules_json as BureauRules} />
                                )}

                                <div className="pt-4 mt-auto">
                                    <button className="text-sm font-medium text-primary hover:underline">
                                        View Full Standard →
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {topics?.length === 0 && !error && (
                <div className="text-center py-24 border rounded-lg border-dashed">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No topics found</h3>
                    <p className="text-muted-foreground">The knowledge base is currently being updated with new bureau standards.</p>
                </div>
            )}
        </div>
    )
}
