"use client"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { ChecklistItem, ChecklistItemStatus } from "@/components/checklist/checklist-item"

// Mock Data for Prototype
const MOCK_PROJECT = {
    id: '1',
    title: 'Vendor Onboarding - Acme Corp',
    progress: 40,
    items: [
        {
            id: '1',
            title: 'W-9 Form',
            description: 'Please upload the latest W-9 form for tax purposes.',
            status: 'approved' as ChecklistItemStatus,
            isRequired: true
        },
        {
            id: '2',
            title: 'Certificate of Insurance',
            description: 'Upload valid liability insurance certificate (min $1M coverage).',
            status: 'needs_action' as ChecklistItemStatus,
            rejectionReason: 'The uploaded certificate is expired (Exp: 2022-12-31).',
            isRequired: true
        },
        {
            id: '3',
            title: 'Master Services Agreement',
            description: 'Upload the signed MSA.',
            status: 'missing' as ChecklistItemStatus,
            isRequired: true
        },
        {
            id: '4',
            title: 'Security Questionnaire',
            description: 'Completed SIG Lite or equivalent.',
            status: 'pending_review' as ChecklistItemStatus,
            isRequired: false
        }
    ]
}

export default function ProjectDetailsPage({ params }: { params: { id: string } }) {
    // In real app, fetch project by ID
    const project = MOCK_PROJECT

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/projects">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold tracking-tight">{project.title}</h1>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="text-sm">Project ID: {project.id}</span>
                    </div>
                </div>
                <Button>Submit for Final Review</Button>
            </div>

            {/* Progress Section */}
            <div className="bg-card border rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Overall Progress</span>
                    <span className="text-sm text-muted-foreground">{project.progress}% Complete</span>
                </div>
                <Progress value={project.progress} className="h-2" />
            </div>

            {/* Checklist */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold">Requirements List</h2>
                <div>
                    {project.items.map((item) => (
                        <ChecklistItem
                            key={item.id}
                            id={item.id}
                            title={item.title}
                            description={item.description}
                            status={item.status}
                            rejectionReason={item.rejectionReason}
                            isRequired={item.isRequired}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
