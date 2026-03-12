import { getPendingEquifaxApplications } from "@/lib/equifax-admin-actions"
import { VerificationDashboard } from "@/components/equifax/admin/verification-dashboard"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function AdminEquifaxPage() {
    try {
        const applications = await getPendingEquifaxApplications()

        return (
            <div className="max-w-6xl mx-auto p-4 md:p-8">
                <VerificationDashboard initialApplications={applications} />
            </div>
        )
    } catch (e: any) {
        if (e.message === "Unauthorized") {
            redirect("/login")
        }
        return (
            <div className="p-8 text-center text-red-600 font-bold">
                Failed to load admin verification queue. Ensure you have the correct permissions.
            </div>
        )
    }
}
