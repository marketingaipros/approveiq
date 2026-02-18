import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
    Zap,
    ShieldAlert,
    BrainCircuit,
    History,
    Settings,
    ToggleRight,
    Ban,
    Sparkles,
    AlertCircle
} from "lucide-react"

export default function AdminAIGovernancePage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black italic tracking-tighter text-slate-900">AI & Logic Governance</h1>
                    <p className="text-slate-500">Manage pattern recognition, cost guardrails, and automated verification ethics.</p>
                </div>
                <Button variant="outline" className="border-slate-200 text-slate-500 font-black h-9 uppercase tracking-widest text-[10px] gap-2 shadow-sm hover:bg-slate-50">
                    <History className="h-4 w-4" /> View Suggestion Logs
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="bg-white border-slate-200 text-slate-900 shadow-sm border-t-4 border-t-purple-600">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-slate-400">
                            <Zap className="h-4 w-4 text-purple-600" />
                            Global Token Guardrail
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end justify-between mb-3">
                            <div className="text-2xl font-black italic tracking-tighter text-slate-900">$1,240 <span className="text-slate-300 font-normal">/</span> $5,000</div>
                            <span className="text-[10px] text-slate-400 font-black tracking-widest uppercase">24.8% Usage</span>
                        </div>
                        <Progress value={24.8} className="h-1.5 bg-slate-100 shadow-inner" />
                        <p className="text-[10px] text-slate-400 mt-3 font-bold uppercase tracking-widest">Budget Hard-Stop: $5,000/mo</p>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200 text-slate-900 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-emerald-500">
                            <BrainCircuit className="h-4 w-4" />
                            Model Reliability
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black italic tracking-tighter text-emerald-600">98.2%</div>
                        <p className="text-[10px] text-slate-400 mt-2 font-black uppercase tracking-widest italic">Pattern PRECISION Rating</p>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200 text-slate-900 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-red-600">
                            <Ban className="h-4 w-4" />
                            Zero-Auto-Approval
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs font-black mb-2 text-slate-900 uppercase tracking-widest">STRICT ENFORCEMENT</div>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">AI is currently restricted to "Pen-Only" status. It may only flag suggestions, never finalize submissions.</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-white border-slate-200 text-slate-900 shadow-sm">
                    <CardHeader className="border-b border-slate-50 pb-4">
                        <CardTitle className="text-lg font-black italic tracking-tight flex items-center gap-2">
                            <BrainCircuit className="h-5 w-5 text-purple-600" />
                            Entity Relationship Memory
                        </CardTitle>
                        <CardDescription className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Active Structured Extraction</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        {[
                            { entity: "Business Identity", fields: ["EIN", "Legal Name", "Inc. Date"], confidence: "99.9%", status: "VERIFIED" },
                            { entity: "Ownership Layer", fields: ["Principal SSN", "Address"], confidence: "94.2%", status: "PENDING" },
                            { entity: "Filing History", fields: ["NY Certificate", "CA Good Standing"], confidence: "98.5%", status: "VERIFIED" }
                        ].map((memory, i) => (
                            <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">{memory.entity}</h4>
                                    <Badge className={`${memory.status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700' : 'bg-yellow-50 text-yellow-700'} border-transparent text-[8px] font-black`}>
                                        {memory.status}
                                    </Badge>
                                </div>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {memory.fields.map((f, j) => (
                                        <Badge key={j} variant="outline" className="text-[9px] font-medium border-slate-200 bg-white text-slate-600">{f}</Badge>
                                    ))}
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-purple-600 rounded-full" style={{ width: memory.confidence }} />
                                    </div>
                                    <span className="text-[9px] font-black text-slate-400 italic">Extraction Confidence: {memory.confidence}</span>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200 text-slate-900 shadow-sm">
                    <CardHeader className="border-b border-slate-50 pb-4">
                        <CardTitle className="text-lg font-black italic tracking-tight flex items-center gap-2">
                            <Settings className="h-5 w-5 text-slate-300" />
                            Internal Guardrails
                        </CardTitle>
                        <CardDescription className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Safety Compliance Layer</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-6">
                        {[
                            { name: "PII Scrubbing", status: "ENABLED", description: "All SSN/Email data is hashed before embedding." },
                            { name: "Tenant Isolation", status: "ENABLED", description: "Cross-client pattern learning is strictly disabled." },
                            { name: "Smart Suggestions", status: "ENABLED", description: "Automated EIN/NPI validation for fast lookups." },
                            { name: "Human-in-the-Loop", status: "STAGING", description: "Manual verification required for all AI signals." }
                        ].map((guard, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white transition-all group">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-sm font-black italic tracking-tight text-slate-900">{guard.name}</h4>
                                        {guard.status === 'ENABLED' && <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[8px] h-4 font-black tracking-widest">ACTIVE</Badge>}
                                        {guard.status === 'STAGING' && <Badge className="bg-blue-50 text-blue-700 border-blue-100 text-[8px] h-4 font-black tracking-widest">STAGING</Badge>}
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-medium mt-1">{guard.description}</p>
                                </div>
                                <ToggleRight className="h-6 w-6 text-slate-200 group-hover:text-red-500 transition-colors cursor-pointer" />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-white border-slate-200 text-slate-900 shadow-sm overflow-hidden flex flex-col">
                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                    <CardTitle className="text-lg font-black italic tracking-tight flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                        Governance Insights
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-1">
                    <div className="divide-y divide-slate-100">
                        {[
                            { msg: "High precision (99.8%) on Experian Batch #12 validation.", type: "insight" },
                            { msg: "Pattern conflict detected: SSN mismatch on Client 9901.", type: "warning" },
                            { msg: "Privacy threshold reached: Redacting old session data.", type: "info" }
                        ].map((insight, i) => (
                            <div key={i} className="p-5 flex gap-4 hover:bg-slate-50/50 transition-colors">
                                <AlertCircle className={`h-5 w-5 shrink-0 ${insight.type === 'warning' ? 'text-red-500 shake' : 'text-slate-300'}`} />
                                <p className="text-xs text-slate-600 font-medium leading-relaxed">{insight.msg}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
                <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
                    <Button className="w-full bg-slate-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-lg">
                        Force Pattern Refresh
                    </Button>
                    <p className="text-[9px] text-slate-400 mt-3 font-bold uppercase tracking-widest italic flex items-center justify-center gap-1.5">
                        <ShieldAlert className="h-3 w-3" /> System action will delay UI logic for ~2.4s
                    </p>
                </div>
            </Card>
        </div>
    )
}
