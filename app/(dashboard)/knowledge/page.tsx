import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Search, Info } from "lucide-react"
import { Input } from "@/components/ui/input"
import ReactMarkdown from 'react-markdown'

export default async function KnowledgeBasePage() {
    const supabase = await createClient()

    // Fetch all topics
    const { data: topics, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .order('topic', { ascending: true })

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
                <p className="text-muted-foreground">Procedural standards and technical guidance for credit bureau compliance.</p>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search topics (e.g. Metro 2, SOC 2)..."
                    className="pl-8"
                />
            </div>

            {error ? (
                <div className="p-4 border border-destructive/20 bg-destructive/10 rounded-lg text-destructive flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    <p>Failed to load knowledge base content.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {topics?.map((topic: any) => (
                        <Card key={topic.id} className="h-full flex flex-col">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between mb-2">
                                    <Badge variant="outline" className="capitalize">{topic.bureau || 'General'}</Badge>
                                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <CardTitle className="text-xl">{topic.topic}</CardTitle>
                                <CardDescription>Official procedural guidance</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-hidden">
                                <div className="prose dark:prose-invert prose-sm max-w-none line-clamp-6">
                                    <ReactMarkdown>{topic.content}</ReactMarkdown>
                                </div>
                            </CardContent>
                            <div className="px-6 pb-6 pt-2">
                                <button className="text-sm font-medium text-primary hover:underline">
                                    View Full Standard →
                                </button>
                            </div>
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
