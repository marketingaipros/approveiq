import { getOrCreateEquifaxApplication } from "@/lib/equifax-actions"
import { OnboardingDashboard } from "@/components/equifax/onboarding-dashboard"
import { redirect } from "next/navigation"

export default async function EquifaxOnboardingPage() {
    const { application, data } = await getOrCreateEquifaxApplication()

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
            <OnboardingDashboard 
                initialData={data} 
                applicationId={application.id} 
                status={application.status} 
            />
        </div>
    )
}
