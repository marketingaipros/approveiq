import { getOrCreateExperianApplication } from "@/lib/experian-actions"
import { ExperianOnboardingDashboard } from "@/components/experian/experian-onboarding-dashboard"
import { redirect } from "next/navigation"

export default async function ExperianOnboardingPage() {
    try {
        const { application, data, org, profile } = await getOrCreateExperianApplication()

        return (
            <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
                <ExperianOnboardingDashboard
                    initialData={data}
                    applicationId={application.id}
                    status={application.status}
                    org={org}
                    profile={profile}
                />
            </div>
        )
    } catch (e: any) {
        if (e.message === "Unauthorized") redirect("/login")
        return (
            <div className="p-8 text-center text-red-600 font-bold">
                Failed to load application. Ensure you are logged in and have an organization context.
            </div>
        )
    }
}
