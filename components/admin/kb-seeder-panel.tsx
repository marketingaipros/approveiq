"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle2, Database, BookOpen, AlertTriangle } from "lucide-react"
import { SBFE_KB_RULES } from "@/lib/sbfe-actions"

interface SeedResult {
    bureau: string
    status: "idle" | "loading" | "success" | "error"
    message?: string
    count?: number
}

export function KBSeederPanel() {
    const [sbfe, setSbfe] = useState<SeedResult>({ bureau: "sbfe", status: "idle" })

    const seedSBFE = async () => {
        setSbfe({ bureau: "sbfe", status: "loading" })
        try {
            const res = await fetch("/api/admin/seed-kb", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bureau: "sbfe" }),
            })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error || "Seed failed")
            setSbfe({ bureau: "sbfe", status: "success", count: json.seeded, message: `${json.seeded} rules seeded successfully` })
        } catch (e: any) {
            setSbfe({ bureau: "sbfe", status: "error", message: e.message })
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-black italic tracking-tighter text-slate-900">Knowledge Base Seeder</h1>
                <p className="text-sm text-slate-500 mt-1">Populate the AI Brain Knowledge Base containers for each credit bureau. Safe to re-run — uses upsert.</p>
            </div>

            {/* SBFE Card */}
            <Card className="border border-violet-200">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between gap-2 text-base">
                        <div className="flex items-center gap-2">
                            <Database className="h-4 w-4 text-violet-500" />
                            SBFE Knowledge Base Container
                        </div>
                        <div className="flex gap-1.5">
                            <Badge className="font-mono text-[10px] bg-blue-100 text-blue-700 border-blue-200">LENDER_VERIFICATION</Badge>
                            <Badge className="font-mono text-[10px] bg-violet-100 text-violet-700 border-violet-200">SBFE_GOVERNANCE</Badge>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Preview rules */}
                    <div className="divide-y divide-slate-100 rounded-lg border border-slate-100 overflow-hidden">
                        {SBFE_KB_RULES.map((rule, i) => (
                            <div key={i} className="flex items-center justify-between px-4 py-2.5 bg-white hover:bg-slate-50">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="h-3 w-3 text-slate-300" />
                                    <span className="text-sm text-slate-700">{rule.topic}</span>
                                </div>
                                <span className="text-[10px] font-mono text-slate-400">sbfe · rule {i + 1}</span>
                            </div>
                        ))}
                    </div>

                    {/* Status message */}
                    {sbfe.status === "success" && (
                        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
                            <CheckCircle2 className="h-4 w-4" />
                            {sbfe.message}
                        </div>
                    )}
                    {sbfe.status === "error" && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                            <AlertTriangle className="h-4 w-4" />
                            {sbfe.message}
                        </div>
                    )}

                    <Button
                        className="gap-2 bg-violet-600 hover:bg-violet-700 text-white"
                        disabled={sbfe.status === "loading"}
                        onClick={seedSBFE}
                    >
                        {sbfe.status === "loading"
                            ? <><Loader2 className="h-4 w-4 animate-spin" /> Seeding SBFE Rules...</>
                            : sbfe.status === "success"
                            ? <><CheckCircle2 className="h-4 w-4" /> Re-seed SBFE Knowledge Base</>
                            : <><Database className="h-4 w-4" /> Seed SBFE Knowledge Base</>
                        }
                    </Button>
                    <p className="text-xs text-slate-400">Uses upsert — safe to run multiple times. All rules tagged with bureau requirements.</p>
                </CardContent>
            </Card>
        </div>
    )
}
