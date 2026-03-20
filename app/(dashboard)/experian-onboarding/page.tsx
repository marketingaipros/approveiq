import { getOrCreateExperianApplication } from "@/lib/experian-actions"
import { ExperianOnboardingDashboard } from "@/components/experian/experian-onboarding-dashboard"
import { redirect } from "next/navigation"

export default async function ExperianOnboardingPage() {
    // 1. Double check session (Layout handles it too, but let's be explicit before try/catch)
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
}
