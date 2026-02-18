"use client"

import { CheckCircle2, Clock, ShieldCheck, ArrowRight, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface PostSubmissionStatusProps {
    bureau: string
}

export function PostSubmissionStatus({ bureau }: PostSubmissionStatusProps) {
    const steps = [
        {
            title: "Application Received",
            description: "Your attestation and documents are secured in our immutable vault.",
            status: "complete"
        },
        {
            title: "Internal Compliance Review",
            description: "ApproveIQ auditors are performing a pre-bureau validation of your files.",
            status: "current"
        },
        {
            title: `${bureau} Formal Audit`,
            description: "Your application is submitted to the bureau's membership department.",
            status: "upcoming"
        },
        {
            title: "Furnisher Status Granted",
            description: "Final approval and technical data feed activation.",
            status: "upcoming"
        }
    ]

    return (
        <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-primary/5 p-6 border-b border-primary/10">
                <div className="flex items-center gap-4 mb-2">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Submission Successful</h2>
                        <p className="text-sm text-muted-foreground">Your {bureau} program is now in the audit queue.</p>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-8">
                <div className="relative">
                    {/* Vertical Line */}
                    <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-muted" />

                    <div className="space-y-8 relative">
                        {steps.map((step, i) => (
                            <div key={i} className="flex gap-4">
                                <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-background ${step.status === 'complete' ? 'bg-primary' :
                                        step.status === 'current' ? 'bg-background border-primary' : 'bg-muted border-muted'
                                    }`}>
                                    {step.status === 'complete' ? (
                                        <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
                                    ) : step.status === 'current' ? (
                                        <Clock className="h-5 w-5 text-primary" />
                                    ) : (
                                        <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                                    )}
                                </div>
                                <div className="pt-1">
                                    <h3 className={`font-semibold ${step.status === 'upcoming' ? 'text-muted-foreground' : ''}`}>
                                        {step.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed italic">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-4 border-t flex flex-col sm:flex-row gap-3">
                    <Button asChild className="gap-2">
                        <Link href="/">
                            <Home className="h-4 w-4" />
                            Return to Dashboard
                        </Link>
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={() => window.print()}>
                        Print Submission Receipt
                    </Button>
                </div>
            </div>

            <div className="bg-muted/50 px-6 py-4 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">ApproveIQ Enterprise Compliance Engine v2.4</span>
            </div>
        </div>
    )
}
