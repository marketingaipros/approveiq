"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Send, Loader2, Building2, User, Briefcase, Network } from "lucide-react"
import { submitExperianApplication } from "@/lib/experian-actions"

interface Props {
    data: any
    org: any
    profile: any
    applicationId: string
    onSubmitted: () => void
    onChange: (field: string, value: any) => void
    submitAction?: (applicationId: string) => Promise<any>
    bureauLabel?: string
    requirementTag?: string
}

function ReviewRow({ label, value }: { label: string; value: any }) {
    return (
        <div className="flex items-start justify-between gap-4 text-sm py-1.5 border-b border-slate-100 last:border-0">
            <span className="text-slate-400 shrink-0">{label}</span>
            <span className="text-slate-800 font-medium text-right">
                {value || <span className="text-slate-300 italic font-normal">—</span>}
            </span>
        </div>
    )
}

function ReviewSection({ title, icon: Icon, rows }: { title: string; icon: React.ElementType; rows: [string, any][] }) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1">
            <div className="flex items-center gap-2 border-b pb-2 mb-2">
                <Icon className="h-4 w-4 text-slate-400" />
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">{title}</h3>
            </div>
            {rows.map(([label, value]) => <ReviewRow key={label} label={label} value={value} />)}
        </div>
    )
}

export function ExperianStep5Signature({ data, org, profile, applicationId, onSubmitted, onChange, submitAction, bureauLabel = 'Experian', requirementTag = 'EXPERIAN_MEMBERSHIP_APP' }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async () => {
        if (!data.agreed_to_terms) {
            setError("You must agree to the terms before submitting.")
            return
        }
        if (!data.authorized_signer_name || !data.signature_date) {
            setError("Please complete the authorized signer name and date.")
            return
        }
        setIsSubmitting(true)
        setError(null)
        try {
            await (submitAction ?? submitExperianApplication)(applicationId)
            onSubmitted()
        } catch (e: any) {
            setError(e.message || "Submission failed. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-black text-slate-900">Step 5: Authorized Signature & Review</h2>
                <p className="text-sm text-slate-500 mt-1">Review your application, then provide an authorized signature to submit.</p>
            </div>

            <ReviewSection title="Company Profile" icon={Building2} rows={[
                ["Company Name", org.name],
                ["Address", [org.address, org.city, org.state, org.zip].filter(Boolean).join(", ")],
                ["Website", org.website],
                ["Phone", org.phone],
            ]} />

            <ReviewSection title="Primary Contact" icon={User} rows={[
                ["Name", profile.fullName],
                ["Email", profile.email],
                ["Phone", profile.phone],
            ]} />

            <ReviewSection title="Company Identity" icon={Briefcase} rows={[
                ["DBA Name", data.dba_name],
                ["Ownership Type", data.ownership_type],
                ["Years in Business", data.years_in_business],
                ["Tax ID", data.tax_id],
                ["State of Incorporation", data.state_of_incorporation],
                ["Business Address", [data.street_address, data.city, data.state, data.zip].filter(Boolean).join(", ")],
                ["Lease or Own", data.lease_or_own],
                ["Time at Location", data.how_long_at_location],
                ["Residential Address", data.residential_address_check ? "Yes (see note)" : "No"],
            ]} />

            <ReviewSection title="Affiliated Companies" icon={Network} rows={[
                ["Has Parent Company", data.has_parent_company ? "Yes" : "No"],
                ["Parent Company", data.parent_company_name],
                ["Parent Address", data.parent_company_address],
                ["Parent Equifax ID", data.parent_company_equifax_id],
                ["Parent Experian ID", data.parent_company_experian_id],
                ["Affiliated Entities", data.affiliated_companies],
            ]} />

            {/* Signature block */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b pb-2">Authorization</h3>
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            Authorized Signer Name <span className="text-red-500">*</span>
                        </Label>
                        <Input placeholder="Full legal name" value={data.authorized_signer_name || ""} onChange={e => onChange("authorized_signer_name", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Title / Position</Label>
                        <Input placeholder="CEO, President, etc." value={data.authorized_signer_title || ""} onChange={e => onChange("authorized_signer_title", e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            Date <span className="text-red-500">*</span>
                        </Label>
                        <Input type="date" value={data.signature_date || ""} onChange={e => onChange("signature_date", e.target.value)} />
                    </div>
                </div>

                <label className="flex items-start gap-3 cursor-pointer mt-2">
                    <Checkbox
                        className="mt-0.5"
                        checked={data.agreed_to_terms ?? false}
                        onCheckedChange={v => onChange("agreed_to_terms", v)}
                    />
                    <span className="text-sm text-slate-600 leading-relaxed">
                        I certify that the information provided is accurate and complete. I authorize submission of this application
                        to {bureauLabel} on behalf of my company and agree to comply with all membership requirements and data
                        contributor standards. <span className="font-semibold">Requirement Tag: </span>
                        <span className="font-mono text-violet-600 text-xs">{requirementTag}</span>
                    </span>
                </label>
            </div>

            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

            <div className="flex items-center justify-between p-5 bg-slate-900 rounded-xl">
                <div>
                    <p className="text-white font-bold">Ready to submit?</p>
                    <p className="text-slate-400 text-xs mt-0.5">Our compliance team reviews before forwarding to {bureauLabel}.</p>
                </div>
                <Button
                    size="lg"
                    className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                </Button>
            </div>
        </div>
    )
}
