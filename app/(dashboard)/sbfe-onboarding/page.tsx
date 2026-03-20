import { getOrCreateSBFEApplication } from "@/lib/sbfe-actions"
import { SBFEOnboardingDashboard } from "@/components/sbfe/sbfe-onboarding-dashboard"
import { redirect } from "next/navigation"

export default async function SBFEOnboardingPage() {
    const { application, data, org, profile } = await getOrCreateSBFEApplication()

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
            <SBFEOnboardingDashboard
                initialData={data}
                applicationId={application.id}
                status={application.status}
                org={org}
                profile={profile}
            />
        </div>
    )
}
