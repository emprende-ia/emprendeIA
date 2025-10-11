// src/lib/stripe.ts
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  if (process.env.NODE_ENV === 'production') {
    // In production, failing to provide the key is a critical error.
    throw new Error('FATAL: STRIPE_SECRET_KEY environment variable is not set.');
  } else {
    // In development, we can provide a more helpful message.
    console.warn(
      'Stripe secret key is not set. Please set STRIPE_SECRET_KEY in your .env file for Stripe functionality.'
    );
  }
}

// Initialize Stripe with the secret key.
// The exclamation mark tells TypeScript that we are sure the key exists at this point
// (or we would have thrown an error).
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20', // Use a specific API version for consistency
});
