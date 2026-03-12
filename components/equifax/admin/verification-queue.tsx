"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShieldAlert, ArrowRight, Building2, Calendar } from "lucide-react"

export function VerificationQueue({ applications, onView }: { applications: any[], onView: (app: any) => void }) {
    
    if (!applications || applications.length === 0) {
        return (
            <div className="text-center py-20 bg-slate-50 border border-slate-200 border-dashed rounded-2xl">
                <ShieldAlert className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-1">Queue Empty</h3>
                <p className="text-slate-500 max-w-sm mx-auto">There are no Equifax Onboarding applications awaiting your verification.</p>
            </div>
        )
    }

    return (
        <Card className="bg-white border-slate-200 text-slate-900 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-black tracking-tight">
                    Verification Queue
                    <Badge variant="secondary" className="bg-slate-200 text-slate-700 ml-2 rounded-full px-3">{applications.length}</Badge>
                </CardTitle>
                <CardDescription className="text-xs font-medium text-slate-500">
                    Review and verify completed Equifax data contributor applications.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                    {applications.map((app) => (
                        <div key={app.id} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer" onClick={() => onView(app)}>
                            <div className="flex gap-4 items-center">
                                <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                    <Building2 className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-slate-900 text-sm">{app.organizations?.name || "Unknown Organization"}</h4>
                                    <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(app.created_at).toLocaleDateString()}</span>
                                        {app.status === 'manual_review_required' ? (
                                            <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded">Manual Review Required</span>
                                        ) : (
                                            <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">100% Complete</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <Button variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600">
                                Review Application <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
