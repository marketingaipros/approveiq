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
            <div className="p-8 text-center space-y-2">
                <p className="text-red-600 font-bold">Failed to load Experian application.</p>
                <p className="text-sm text-slate-500 font-mono">{e.message}</p>
                <p className="text-xs text-slate-400">Check that the SQL migration has been run in Supabase.</p>
            </div>
        )
    }
}
