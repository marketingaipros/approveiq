import { getOrCreateDNBApplication } from "@/lib/dnb-actions"
import { DNBOnboardingDashboard } from "@/components/dnb/dnb-onboarding-dashboard"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function DNBOnboardingPage() {
    const { application, data, org, profile } = await getOrCreateDNBApplication()

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
            <DNBOnboardingDashboard
                initialData={data}
                applicationId={application.id}
                status={application.status}
                org={org}
                profile={profile}
            />
        </div>
    )
}
