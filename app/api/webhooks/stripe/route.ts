import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
    const body = await req.text()
    const signature = (await headers()).get("Stripe-Signature") as string

    let event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
    }

    const supabase = await createClient()

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as any
        // Update organization subscription status
        const { error } = await (supabase as any)
            .from('organizations')
            .update({
                stripe_customer_id: session.customer as string,
                subscription_status: 'active',
                subscription_tier: 'pro'
            })
            .eq('id', session.client_reference_id) // We pass org_id as client_reference_id

        if (error) console.error('Error updating org:', error)
    }

    if (event.type === "customer.subscription.deleted") {
        const subscription = event.data.object as any
        // Downgrade to free/incomplete
        await (supabase as any)
            .from('organizations')
            .update({ subscription_status: 'canceled', subscription_tier: 'free' })
            .eq('stripe_customer_id', subscription.customer)
    }

    return new NextResponse(null, { status: 200 })
}
