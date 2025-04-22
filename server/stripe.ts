import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Missing Stripe secret key! Payments will not work correctly.');
}

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key_for_development', {
  apiVersion: '2023-10-16' as any // Force the type to avoid version mismatch
});

export default stripe;