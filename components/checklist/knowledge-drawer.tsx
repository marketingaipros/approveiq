"use client"

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { BookOpen, HelpCircle, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import ReactMarkdown from 'react-markdown'

interface KnowledgeDrawerProps {
    topic: string
}

export function KnowledgeDrawer({ topic }: KnowledgeDrawerProps) {
    const [content, setContent] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        if (isOpen && !content) {
            fetchContent()
        }
    }, [isOpen, topic, content])

    async function fetchContent() {
        setIsLoading(true)
        try {
            const supabase = createClient()
            const { data, error } = await supabase
                .from('knowledge_base')
                .select('content')
                .eq('topic', topic)
                .maybeSingle()

            if (error) throw error
            if (data) {
                setContent(data.content)
            }
        } catch (error) {
            console.error("Error fetching KB content:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-2 text-muted-foreground hover:text-primary p-0 h-auto">
                    <HelpCircle className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">Explain</span>
                </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-md overflow-y-auto pt-10">
                <SheetHeader className="mb-6">
                    <SheetTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        Guidance: {topic}
                    </SheetTitle>
                    <SheetDescription>
                        Procedural requirements and standards for this item.
                    </SheetDescription>
                </SheetHeader>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Fetching latest standards...</p>
                    </div>
                ) : content ? (
                    <div className="prose dark:prose-invert text-sm space-y-4 max-w-none">
                        <ReactMarkdown>{content}</ReactMarkdown>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-sm text-muted-foreground italic">No specific guidance found for this topic yet.</p>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}
