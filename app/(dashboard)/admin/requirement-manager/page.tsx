import { getDynamicRequirements, createDynamicRequirement } from "@/lib/bureau-admin-actions"
import { getAvailableBureaus } from "@/lib/bureau-dynamic-actions"
import { RequirementBuilder } from "@/components/bureau/admin/requirement-builder"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function RequirementManagerPage() {
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
}
