import Stripe from 'stripe';

// Use a fallback key for build time (Next.js tries to exec this file)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key_for_build', {
    apiVersion: '2026-01-28.clover' as any, // Cast as any because @types/stripe might be behind the real lib
    typescript: true,
});
