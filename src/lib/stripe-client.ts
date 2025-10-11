'use client';

import { loadStripe } from '@stripe/stripe-js';
import { createStripeCheckoutSession } from '@/ai/flows/create-stripe-checkout-session';
import type { User } from 'firebase/auth';

/**
 * This function is designed to be called from a client-side component.
 * It orchestrates the process of creating a Stripe checkout session and redirecting the user.
 *
 * @param priceId The ID of the Stripe Price object.
 * @param user The Firebase authenticated user object.
 * @throws An error if the checkout process fails at any stage.
 */
export async function handleStripeCheckout(priceId: string, user: User) {
  if (!user.email) {
    throw new Error('El email del usuario es necesario para completar la compra.');
  }

  // 1. Create the checkout session on the server by calling the Genkit flow.
  const { sessionId } = await createStripeCheckoutSession({
    priceId,
    userEmail: user.email,
    userId: user.uid,
  });

  // 2. Load the Stripe.js library.
  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  const stripe = await stripePromise;

  if (!stripe) {
    throw new Error('Stripe.js no se ha podido cargar. Revisa tu conexión de red.');
  }

  // 3. Redirect the user to the Stripe Checkout page.
  const { error } = await stripe.redirectToCheckout({ sessionId });

  // 4. If there's an error during redirection, throw it so it can be caught and displayed.
  if (error) {
    console.error('Stripe redirection error:', error);
    throw new Error(error.message);
  }
}
