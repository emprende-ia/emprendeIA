// This is a server-side file.
'use server';

/**
 * @fileOverview This file defines a Genkit flow for creating a Stripe Checkout session.
 * It is a secure way to initiate a payment process by creating the session on the server-side.
 *
 * @module ai/flows/create-stripe-checkout-session
 *
 * @interface CreateStripeCheckoutSessionInput - The input type for the flow.
 * @interface CreateStripeCheckoutSessionOutput - The output type for the flow.
 * @function createStripeCheckoutSession - The main function that orchestrates the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getStripe } from '@/lib/stripe'; // Import the centralized Stripe getter

const CreateStripeCheckoutSessionInputSchema = z.object({
  priceId: z.string().describe('The ID of the Stripe Price object.'),
  userEmail: z.string().email().describe('The email of the user making the purchase.'),
  userId: z.string().describe('The unique ID of the user in Firebase.'),
});
export type CreateStripeCheckoutSessionInput = z.infer<
  typeof CreateStripeCheckoutSessionInputSchema
>;

const CreateStripeCheckoutSessionOutputSchema = z.object({
  sessionId: z.string().describe('The ID of the created Stripe Checkout Session.'),
  sessionUrl: z.string().url().describe('The URL to redirect the user to for checkout.'),
});
export type CreateStripeCheckoutSessionOutput = z.infer<
  typeof CreateStripeCheckoutSessionOutputSchema
>;

// Export a wrapper function to be called from client components
export async function createStripeCheckoutSession(
  input: CreateStripeCheckoutSessionInput
): Promise<CreateStripeCheckoutSessionOutput> {
  return createStripeCheckoutSessionFlow(input);
}

const createStripeCheckoutSessionFlow = ai.defineFlow(
  {
    name: 'createStripeCheckoutSessionFlow',
    inputSchema: CreateStripeCheckoutSessionInputSchema,
    outputSchema: CreateStripeCheckoutSessionOutputSchema,
  },
  async ({ priceId, userEmail, userId }) => {
    // Get a Stripe instance from our centralized getter.
    // This function now handles loading environment variables and initialization.
    const stripe = getStripe();

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}`,
        customer_email: userEmail,
        metadata: {
          firebase_uid: userId,
        },
      });

      if (!session.id || !session.url) {
        throw new Error('Failed to create Stripe session.');
      }

      return { sessionId: session.id, sessionUrl: session.url };

    } catch (error: any) {
      console.error('Stripe Flow Error:', error.message);
      // It's better to throw a structured error, but for now, we'll re-throw
      throw new Error(`Could not create checkout session: ${error.message}`);
    }
  }
);
