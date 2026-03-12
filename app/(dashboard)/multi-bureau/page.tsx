import { getMasterProfile, getActiveBureaus, getClientRequirements, getAvailableBureaus } from "@/lib/bureau-dynamic-actions"
import { MultiBureauDashboard } from "@/components/bureau/multi-bureau-dashboard"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function MultiBureauPage() {
    try {
        const masterProfile = await getMasterProfile()
        const activeBureaus = await getActiveBureaus()
        const allDynamicBureaus = await getAvailableBureaus()
        
        const activeBureauNames = activeBureaus.map((b: any) => b.bureau_name)
        const requirements = await getClientRequirements(activeBureauNames)

        return (
            <div className="max-w-6xl mx-auto p-4 md:p-8">
                <MultiBureauDashboard 
                    masterProfile={masterProfile} 
                    activeBureaus={activeBureaus} 
                    requirements={requirements} 
                    allDynamicBureaus={allDynamicBureaus}
                />
            </div>
        )
    } catch (e: any) {
        if (e.message === "Unauthorized") {
            redirect("/login")
        }
        return (
            <div className="p-8 text-center text-red-600 font-bold">
                Failed to load Multi-Bureau engine. Ensure you are logged in.
            </div>
        )
    }
}
