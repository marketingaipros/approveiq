import { getMasterProfile, getActiveBureaus, getClientRequirements, getAvailableBureaus } from "@/lib/bureau-dynamic-actions"
import { MultiBureauDashboard } from "@/components/bureau/multi-bureau-dashboard"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function MultiBureauPage() {
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
}
