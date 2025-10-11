'use client';

import { createStripeCheckoutSession } from '@/ai/flows/create-stripe-checkout-session';
import type { User } from 'firebase/auth';

/**
 * This function is designed to be called from a client-side component.
 * It orchestrates the process of creating a Stripe checkout session and returns the session details.
 *
 * @param priceId The ID of the Stripe Price object.
 * @param user The Firebase authenticated user object.
 * @returns An object containing the sessionId and the sessionUrl for redirection.
 * @throws An error if the checkout process fails.
 */
export async function handleStripeCheckout(priceId: string, user: User) {
  if (!user.email) {
    throw new Error('El email del usuario es necesario para completar la compra.');
  }

  // 1. Create the checkout session on the server by calling the Genkit flow.
  // This now returns the full session object from Stripe.
  const { sessionId, sessionUrl } = await createStripeCheckoutSession({
    priceId,
    userEmail: user.email,
    userId: user.uid,
  });

  if (!sessionId || !sessionUrl) {
    throw new Error("Failed to create Stripe checkout session.");
  }
  
  // 2. Return the session details to the client component.
  return { sessionId, sessionUrl };
}
