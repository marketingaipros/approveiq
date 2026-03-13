"use client"

import { useState } from "react"
import { CheckCircle2, Building2, Briefcase, Package, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { submitEquifaxApplication } from "@/lib/equifax-actions"

interface Props {
    data: any
    applicationId: string
    onSubmitted: () => void
}

function ReviewSection({ title, icon: Icon, rows }: { title: string; icon: React.ElementType; rows: [string, any][] }) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 border-b pb-2">
                <Icon className="h-4 w-4 text-slate-500" />
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">{title}</h3>
            </div>
            <div className="grid gap-2">
                {rows.map(([label, value]) => (
                    <div key={label} className="flex items-start justify-between gap-4 text-sm">
                        <span className="text-slate-500 shrink-0">{label}</span>
                        <span className="text-slate-800 font-medium text-right">
                            {Array.isArray(value) ? value.join(", ") || "—" : value || <span className="text-slate-300 italic">Not provided</span>}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export function Step5Submit({ data, applicationId, onSubmitted }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async () => {
        setIsSubmitting(true)
        setError(null)
        try {
            await submitEquifaxApplication(applicationId)
            setSubmitted(true)
            onSubmitted()
        } catch (e: any) {
            setError(e.message || "Submission failed. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-black text-slate-900">Application Submitted!</h2>
                <p className="text-slate-500 max-w-md">
                    Your Equifax Data Contributor application has been submitted for internal review. Our compliance team will contact you within 3–5 business days.
                </p>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-sm px-4 py-1">Under Review</Badge>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-black text-slate-900">Step 5: Review & Submit</h2>
                <p className="text-sm text-slate-500 mt-1">
                    Review your application below. Once submitted, our compliance team will review it before forwarding to Equifax.
                </p>
            </div>

            <ReviewSection title="Company Information" icon={Building2} rows={[
                ["Company Name", data.company_name],
                ["Address", [data.company_address, data.city, data.state].filter(Boolean).join(", ")],
                ["Phone", data.company_phone],
                ["Website", data.company_website],
                ["Years in Business", data.years_in_business],
                ["Industry", data.industry],
                ["Geographic Area", data.geographic_area],
                ["Primary Contact", data.primary_contact_name],
                ["Contact Email", data.primary_contact_email],
                ["Contact Phone", data.primary_contact_phone],
                ["Account Types", data.account_types],
                ["Reason for Reporting", data.reason_for_reporting],
                ["Other Bureaus", data.other_bureaus],
                ["Upload Method", data.data_upload_method],
                ["3rd Party Vendor", data.third_party_vendor],
                ["Equifax Member #", data.existing_member_numbers],
                ["Lending License #", data.lending_license_number],
            ]} />

            <ReviewSection title="Business Model" icon={Briefcase} rows={[
                ["Customer Acquisition", data.customer_acquisition_method],
                ["Dispute Procedures", data.has_dispute_procedures ? "Yes" : "No"],
                ["Dispute Process", data.dispute_resolution_description],
            ]} />

            <ReviewSection title="Products & Services" icon={Package} rows={[
                ["Product Type", data.product_type],
                ["Repayment Terms", data.repayment_terms],
                ["Duration", data.duration_months ? `${data.duration_months} months` : null],
                ["Payment Method", data.payment_method],
                ["Loan / Limit Range", data.loan_amount_min && data.loan_amount_max ? `$${data.loan_amount_min?.toLocaleString()} – $${data.loan_amount_max?.toLocaleString()}` : null],
                ["Collateral", data.collateral_description],
                ["Membership Fees", data.has_membership_fees ? "Yes" : "No"],
                ["Initial Records", data.estimated_initial_records?.toLocaleString()],
                ["12-Month Growth", data.growth_12_months?.toLocaleString()],
                ["24-Month Growth", data.growth_24_months?.toLocaleString()],
            ]} />

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
            )}

            <div className="flex items-center justify-between p-5 bg-slate-900 rounded-xl">
                <div>
                    <p className="text-white font-bold">Ready to submit?</p>
                    <p className="text-slate-400 text-xs mt-0.5">This will send your application to our internal compliance team.</p>
                </div>
                <Button
                    size="lg"
                    className="gap-2 bg-red-600 hover:bg-red-700 text-white"
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
