// This is a server-side file.
'use server';

/**
 * @fileOverview This file defines a Genkit flow for handling Stripe webhooks.
 * It verifies the event signature and processes the event.
 *
 * @module ai/flows/stripe-webhook
 *
 * @interface StripeWebhookInput - The input type for the flow.
 * @interface StripeWebhookOutput - The output type for the flow.
 * @function handleStripeWebhook - The main function that orchestrates the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const StripeWebhookInputSchema = z.object({
  body: z.string().describe('The raw request body from Stripe.'),
  signature: z.string().describe('The stripe-signature header from the request.'),
});
export type StripeWebhookInput = z.infer<typeof StripeWebhookInputSchema>;

const StripeWebhookOutputSchema = z.object({
  received: z.boolean(),
  message: z.string().optional(),
});
export type StripeWebhookOutput = z.infer<typeof StripeWebhookOutputSchema>;

export async function handleStripeWebhook(input: StripeWebhookInput): Promise<StripeWebhookOutput> {
  return handleStripeWebhookFlow(input);
}

const handleStripeWebhookFlow = ai.defineFlow(
  {
    name: 'handleStripeWebhookFlow',
    inputSchema: StripeWebhookInputSchema,
    outputSchema: StripeWebhookOutputSchema,
  },
  async ({ body, signature }) => {
    let event: Stripe.Event;

    try {
      // Verify the event came from Stripe
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      throw new Error('Webhook signature verification failed.');
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('Checkout session completed!', session);

      // TODO: Here you would typically fulfill the order:
      // 1. Retrieve the user's ID from session.metadata.firebase_uid
      // 2. Update the user's role in your Firestore database to 'plus' or 'premium'.
      // 3. This will grant them access to the premium features.
    }

    // You can handle other event types here as needed
    // For example: 'customer.subscription.deleted' to handle cancellations.

    return { received: true };
  }
);
