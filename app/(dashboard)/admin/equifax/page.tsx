import { getPendingEquifaxApplications } from "@/lib/equifax-admin-actions"
import { VerificationDashboard } from "@/components/equifax/admin/verification-dashboard"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function AdminEquifaxPage() {
    const applications = await getPendingEquifaxApplications()

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8">
            <VerificationDashboard initialApplications={applications} />
        </div>
    )
}
