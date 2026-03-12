import { getDynamicRequirements, createDynamicRequirement } from "@/lib/bureau-admin-actions"
import { getAvailableBureaus } from "@/lib/bureau-dynamic-actions"
import { RequirementBuilder } from "@/components/bureau/admin/requirement-builder"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function RequirementManagerPage() {
    try {
        const requirements = await getDynamicRequirements()
        const bureaus = await getAvailableBureaus()

        return (
            <div className="max-w-4xl mx-auto p-4 md:p-8">
                <RequirementBuilder 
                    initialRequirements={requirements} 
                    availableBureaus={bureaus}
                    onSave={createDynamicRequirement} 
                />
            </div>
        )
    } catch (e: any) {
        if (e.message === "Unauthorized") {
            redirect("/login")
        }
        return (
            <div className="p-8 text-center text-red-600 font-bold">
                Failed to load Requirement Manager. Ensure you have Admin permissions.
            </div>
        )
    }
}
