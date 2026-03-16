import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { BureauRules } from "@/lib/templates"
import { getBureauDocuments } from "@/lib/bureau-document-actions"
import { BureauDocUploader } from "@/components/bureau/bureau-doc-uploader"
import {
    ShieldCheck, Zap, BrainCircuit, Link2,
    FileCheck, Users, Database, CheckCircle2,
    Clock, Info, BookOpen, Upload
} from "lucide-react"

// ─── Bureau brand config ──────────────────────────────────────────────────────
const BUREAU_CONFIG: Record<string, {
    label: string; color: string; borderColor: string
    icon: string; bgGradient: string
}> = {
    equifax:    { label: "Equifax",    color: "text-red-700",     borderColor: "border-red-200",     icon: "🔴", bgGradient: "from-red-50 to-rose-50" },
    experian:   { label: "Experian",   color: "text-blue-700",    borderColor: "border-blue-200",    icon: "🔵", bgGradient: "from-blue-50 to-sky-50" },
    sbfe:       { label: "SBFE",       color: "text-violet-700",  borderColor: "border-violet-200",  icon: "🟣", bgGradient: "from-violet-50 to-purple-50" },
    dnb:        { label: "D&B",        color: "text-amber-700",   borderColor: "border-amber-200",   icon: "🟡", bgGradient: "from-amber-50 to-yellow-50" },
    creditsafe: { label: "Creditsafe", color: "text-emerald-700", borderColor: "border-emerald-200", icon: "🟢", bgGradient: "from-emerald-50 to-green-50" },
}

// ─── Rule row renderer ────────────────────────────────────────────────────────
function RuleRow({ icon, label, value, highlight = false }: {
    icon: React.ReactNode; label: string; value: React.ReactNode; highlight?: boolean
}) {
    return (
        <div className={`flex items-start gap-3 py-2.5 px-3 rounded-lg ${highlight ? "bg-amber-50 border border-amber-100" : "bg-white/60 border border-slate-100"}`}>
            <span className="mt-0.5 shrink-0 text-slate-400">{icon}</span>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
                <div className="text-sm font-medium text-slate-800 mt-0.5">{value}</div>
            </div>
        </div>
    )
}

// ─── Bureau Logic Container ───────────────────────────────────────────────────
async function BureauContainer({ bureau, topic, rules, hasRules }: {
    bureau: string; topic: string; rules: BureauRules | null; hasRules: boolean
}) {
    const cfg = BUREAU_CONFIG[bureau.toLowerCase()] || {
        label: bureau, color: "text-slate-700", borderColor: "border-slate-200",
        icon: "⚫", bgGradient: "from-slate-50 to-slate-100"
    }

    // Fetch existing uploaded documents for this bureau
    let existingDocs: any[] = []
    try {
        existingDocs = await getBureauDocuments(bureau)
    } catch (_) { /* not critical */ }

    return (
        <Card className={`border-2 ${cfg.borderColor} overflow-hidden`}>
            {/* Header */}
            <CardHeader className={`bg-gradient-to-r ${cfg.bgGradient} pb-4`}>
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{cfg.icon}</span>
                        <div>
                            <h2 className={`text-lg font-black ${cfg.color} tracking-tight`}>{cfg.label}</h2>
                            <p className="text-xs text-slate-500 mt-0.5 max-w-xs truncate">{topic}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {rules?.source_year && (
                            <Badge className="bg-white/80 text-slate-600 border border-slate-200 font-mono text-[10px]">
                                {rules.source_year} Form
                            </Badge>
                        )}
                        <Badge className="bg-white/80 text-indigo-600 border border-indigo-200 gap-1 text-[10px]">
                            <Link2 className="h-2.5 w-2.5" />Templates Linked
                        </Badge>
                        <Badge className="bg-white/80 text-emerald-600 border border-emerald-200 gap-1 text-[10px]">
                            <BrainCircuit className="h-2.5 w-2.5" />AI Read Access
                        </Badge>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
                {/* Rules section */}
                {!hasRules ? (
                    <div className="text-center py-4 text-sm text-muted-foreground flex flex-col items-center gap-2">
                        <Info className="h-5 w-5 text-slate-300" />
                        No rules configured. Seed the Knowledge Base to unlock.
                    </div>
                ) : (
                    <>
                        {rules?.min_records !== undefined && (
                            <RuleRow highlight={rules.min_records > 0} icon={<Users className="h-4 w-4" />}
                                label="Minimum Record Threshold"
                                value={rules.min_records > 0
                                    ? <span className="text-amber-700 font-bold">{rules.min_records.toLocaleString()} active accounts required</span>
                                    : <span className="text-emerald-600">No minimum</span>
                                } />
                        )}
                        {rules?.requires_3_months_historical && (
                            <RuleRow highlight icon={<Clock className="h-4 w-4" />}
                                label="Historical Data Load"
                                value={<span className="text-amber-700 font-bold">3 months of historical data required for initial load</span>} />
                        )}
                        {rules?.requires_dispute_pdf && (
                            <RuleRow highlight icon={<FileCheck className="h-4 w-4" />}
                                label="Dispute Procedure PDF"
                                value={<span className="text-red-700 font-bold">Mandatory Dispute Procedure PDF upload required</span>} />
                        )}
                        {rules?.requires_dispute_doc && !rules?.requires_dispute_pdf && (
                            <RuleRow icon={<FileCheck className="h-4 w-4" />}
                                label="Dispute Documentation" value="Dispute handling policy required" />
                        )}
                        {rules?.requires_lending_license && (
                            <RuleRow highlight icon={<ShieldCheck className="h-4 w-4" />}
                                label="Lending License"
                                value={<span className="text-amber-700 font-bold">Lending license required for approval</span>} />
                        )}
                        {rules?.repayment_types && rules.repayment_types.length > 0 && (
                            <RuleRow icon={<Database className="h-4 w-4" />} label="Accepted Payment Types"
                                value={<div className="flex flex-wrap gap-1 mt-1">{rules.repayment_types.map((t, i) => (
                                    <span key={i} className="text-xs bg-slate-100 text-slate-700 rounded px-2 py-0.5 font-mono">{t}</span>
                                ))}</div>} />
                        )}
                        {rules?.required_checklist_tags && rules.required_checklist_tags.length > 0 && (
                            <RuleRow icon={<CheckCircle2 className="h-4 w-4" />} label="Generated Checklist Items"
                                value={<div className="flex flex-wrap gap-1 mt-1">{rules.required_checklist_tags.map((tag, i) => (
                                    <span key={i} className="text-xs bg-indigo-50 text-indigo-700 rounded-full px-2 py-0.5 font-medium border border-indigo-100">{tag}</span>
                                ))}</div>} />
                        )}
                    </>
                )}

                {/* Document Upload Section */}
                <div className="pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 mb-2">
                        <Upload className="h-3.5 w-3.5 text-slate-400" />
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Upload Documents</p>
                    </div>
                    <BureauDocUploader bureau={bureau} existingDocs={existingDocs} />
                </div>

                {/* Footer */}
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
                    <Zap className="h-3 w-3 text-amber-400" />
                    Rule changes here auto-update the linked Template questionnaire
                </div>
            </CardContent>
        </Card>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function BureauLogicCenterPage() {
    const supabase = await createClient()
    const BUREAUS_ORDER = ["equifax", "experian", "sbfe", "dnb", "creditsafe"]

    // Resilient fetch: try with rules_json first, fall back to basic columns
    let topics: any[] = []
    let hadError = false

    const full = await supabase
        .from('knowledge_base')
        .select('id, topic, bureau, rules_json, content')
        .order('bureau', { ascending: true })

    if (full.error) {
        // rules_json column may not exist yet — fall back
        const basic = await supabase
            .from('knowledge_base')
            .select('id, topic, bureau, content')
            .order('bureau', { ascending: true })

        if (basic.error) {
            hadError = true
        } else {
            topics = (basic.data || []).map((t: any) => ({ ...t, rules_json: null }))
        }
    } else {
        topics = full.data || []
    }

    const bureauMap = new Map<string, any>()
    for (const t of topics) {
        if (t.bureau) bureauMap.set(t.bureau.toLowerCase(), t)
    }

    return (
        <div className="space-y-6">
            <div>
                <div className="flex items-center gap-3 mb-1">
                    <BookOpen className="h-7 w-7 text-indigo-600" />
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Bureau Logic Center</h1>
                </div>
                <p className="text-slate-500 ml-10">
                    Single source of truth for bureau compliance rules. Changes automatically propagate to Templates and the AI Compliance Agent.
                </p>
            </div>

            {/* Status Bar */}
            <div className="flex items-center gap-3 flex-wrap p-3 bg-slate-900 rounded-xl text-xs font-medium">
                <div className="flex items-center gap-1.5 text-emerald-400">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    Templates: Live Sync Active
                </div>
                <div className="h-4 w-px bg-slate-700" />
                <div className="flex items-center gap-1.5 text-indigo-400">
                    <BrainCircuit className="h-3 w-3" />
                    AI Agent: Read Access Granted (5 bureaus)
                </div>
                <div className="h-4 w-px bg-slate-700" />
                <div className="flex items-center gap-1.5 text-amber-400">
                    <Zap className="h-3 w-3" />
                    Rule Engine: POST /api/ai/validate
                </div>
                {hadError && (
                    <>
                        <div className="h-4 w-px bg-slate-700" />
                        <div className="flex items-center gap-1.5 text-red-400">
                            ⚠ DB connection issue — run migration SQL
                        </div>
                    </>
                )}
            </div>

            {/* Bureau Containers Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Equifax — full width */}
                <div className="md:col-span-2">
                    <BureauContainer
                        bureau="equifax"
                        topic={bureauMap.get("equifax")?.topic || "Equifax Data Furnisher Requirements (2023)"}
                        rules={bureauMap.get("equifax")?.rules_json || null}
                        hasRules={!!bureauMap.get("equifax")?.rules_json}
                    />
                </div>
                {/* Other 4 bureaus — 2-col */}
                {BUREAUS_ORDER.filter(b => b !== "equifax").map(bureau => {
                    const entry = bureauMap.get(bureau)
                    return (
                        <BureauContainer
                            key={bureau}
                            bureau={bureau}
                            topic={entry?.topic || `${BUREAU_CONFIG[bureau]?.label} Requirements`}
                            rules={entry?.rules_json || null}
                            hasRules={!!entry?.rules_json}
                        />
                    )
                })}
            </div>
        </div>
    )
}
