import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function checkSubscriptionEntitlement() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return false

    // Fetch Organization for User (Assuming 1:1 for MVP or via profile table)
    // PROTOTYPE HACK: We will mock the check for now since we don't have the user->org mapping yet.
    // In real app: SELECT * FROM organizations WHERE id = (SELECT org_id FROM users WHERE id = user.id)

    const mockIsPro = true; // TOGGLE THIS TO TEST ENTITLEMENT
    return mockIsPro
}

export function SubscriptionBanner({ isPro }: { isPro: boolean }) {
    if (isPro) return null

    return (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 dark:bg-yellow-900/20 dark:text-yellow-400" role="alert">
            <p className="font-bold">Free Plan Limit Reached</p>
            <p>You can only create 1 active project. Upgrade to Pro for unlimited access.</p>
        </div>
    )
}
