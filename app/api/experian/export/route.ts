import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const applicationId = searchParams.get("id")

    if (!applicationId) return NextResponse.json({ error: "Missing application ID" }, { status: 400 })

    const admin = createAdminClient()

    const { data, error } = await (admin as any)
        .from("experian_onboarding_data")
        .select("*")
        .eq("application_id", applicationId)
        .maybeSingle()

    if (error || !data) return NextResponse.json({ error: "Application not found" }, { status: 404 })

    const FIELDS: [string, string][] = [
        ["DBA Name", "dba_name"],
        ["Years in Business", "years_in_business"],
        ["Ownership Type", "ownership_type"],
        ["Tax ID", "tax_id"],
        ["State of Incorporation", "state_of_incorporation"],
        ["Street Address", "street_address"],
        ["City", "city"],
        ["State", "state"],
        ["ZIP", "zip"],
        ["Lease or Own", "lease_or_own"],
        ["Time at Location", "how_long_at_location"],
        ["Residential Address", "residential_address_check"],
        ["Residential Note", "residential_address_note"],
        ["Has Parent Company", "has_parent_company"],
        ["Parent Company Name", "parent_company_name"],
        ["Parent Company Address", "parent_company_address"],
        ["Parent Equifax ID", "parent_company_equifax_id"],
        ["Parent Experian ID", "parent_company_experian_id"],
        ["Affiliated Companies", "affiliated_companies"],
        ["Authorized Signer", "authorized_signer_name"],
        ["Signer Title", "authorized_signer_title"],
        ["Signer Email", "authorized_signer_email"],
        ["Signature Date", "signature_date"],
        ["Agreed to Terms", "agreed_to_terms"],
    ]

    const escape = (v: any): string => {
        if (v === null || v === undefined) return ""
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
            "Content-Disposition": `attachment; filename="experian-onboarding-${applicationId}.csv"`,
        },
    })
}
