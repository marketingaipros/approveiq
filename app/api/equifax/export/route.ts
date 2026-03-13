import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const applicationId = searchParams.get("id")

    if (!applicationId) {
        return NextResponse.json({ error: "Missing application ID" }, { status: 400 })
    }

    const admin = createAdminClient()

    const { data, error } = await admin
        .from("equifax_onboarding_data")
        .select("*")
        .eq("application_id", applicationId)
        .single()

    if (error || !data) {
        return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    // Build CSV
    const FIELDS: [string, string][] = [
        ["Company Name", "company_name"],
        ["Address", "company_address"],
        ["City", "city"],
        ["State", "state"],
        ["Phone", "company_phone"],
        ["Website", "company_website"],
        ["Primary Contact", "primary_contact_name"],
        ["Contact Email", "primary_contact_email"],
        ["Contact Phone", "primary_contact_phone"],
        ["Years in Business", "years_in_business"],
        ["Industry", "industry"],
        ["Geographic Area", "geographic_area"],
        ["Account Types", "account_types"],
        ["Reason for Reporting", "reason_for_reporting"],
        ["Other Bureaus", "other_bureaus"],
        ["Upload Method", "data_upload_method"],
        ["3rd Party Vendor", "third_party_vendor"],
        ["Member Numbers", "existing_member_numbers"],
        ["Lending License", "lending_license_number"],
        ["Customer Acquisition", "customer_acquisition_method"],
        ["Has Dispute Procedures", "has_dispute_procedures"],
        ["Dispute Description", "dispute_resolution_description"],
        ["Product Type", "product_type"],
        ["Repayment Terms", "repayment_terms"],
        ["Duration (months)", "duration_months"],
        ["Payment Method", "payment_method"],
        ["Loan Min ($)", "loan_amount_min"],
        ["Loan Max ($)", "loan_amount_max"],
        ["Collateral", "collateral_description"],
        ["Has Membership Fees", "has_membership_fees"],
        ["Initial Records", "estimated_initial_records"],
        ["Growth 12mo", "growth_12_months"],
        ["Growth 24mo", "growth_24_months"],
    ]

    const escape = (v: any): string => {
        if (v === null || v === undefined) return ""
        if (Array.isArray(v)) return `"${v.join("; ")}"`
        const str = String(v)
        return str.includes(",") || str.includes('"') || str.includes("\n")
            ? `"${str.replace(/"/g, '""')}"` : str
    }

    const header = FIELDS.map(([label]) => escape(label)).join(",")
    const row = FIELDS.map(([, key]) => escape((data as any)[key])).join(",")
    const csv = `${header}\n${row}`

    return new NextResponse(csv, {
        headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="equifax-onboarding-${applicationId}.csv"`,
        },
    })
}
