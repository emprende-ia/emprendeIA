
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
import { getStripe } from '@/lib/stripe';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

// Initialize Firebase Admin for server-side operations
if (!getApps().length) {
    initializeApp(firebaseConfig);
}
const db = getFirestore();

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
    const stripe = getStripe();
    // In production, App Hosting exposes secrets as environment variables.
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const plusPriceId = process.env.NEXT_PUBLIC_STRIPE_PLUS_PRICE_ID;
    const premiumPriceId = process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID;

    if (!webhookSecret) {
      console.error('CRITICAL: STRIPE_WEBHOOK_SECRET is not set in the environment.');
      throw new Error('Stripe webhook secret is not configured on the server.');
    }
     if (!plusPriceId || !premiumPriceId) {
      console.error('CRITICAL: Stripe Price IDs are not set in the environment.');
      throw new Error('Stripe price IDs are not configured on the server.');
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      throw new Error('Webhook signature verification failed.');
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.firebase_uid;

      if (!userId) {
        console.error('CRITICAL: No firebase_uid found in session metadata.');
        return { received: false, message: 'Missing user ID in session metadata.' };
      }
        
      // Retrieve the price ID from the line items
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      const priceId = lineItems.data[0]?.price?.id;

      let userPlan: 'oro' | 'diamante' | 'básico' = 'básico';

      if (priceId === plusPriceId) {
          userPlan = 'oro';
      } else if (priceId === premiumPriceId) {
          userPlan = 'diamante';
      }

      if (userPlan !== 'básico') {
        try {
          const userDocRef = doc(db, 'users', userId);
          await updateDoc(userDocRef, { plan: userPlan });
          console.log(`User ${userId} plan updated to ${userPlan}.`);
        } catch (error) {
          console.error(`Failed to update plan for user ${userId}:`, error);
          // Optionally, handle this error (e.g., retry logic, notify admin)
        }
      }
    }
    
    // Handle subscription cancellation
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      // Find the user associated with this Stripe customer ID
      // This part is complex as it requires reverse-mapping Stripe customer ID to Firebase UID
      // For simplicity, we'll assume the client_reference_id or metadata holds the UID,
      // which is best practice but might not always be set up.
      // In this example, we'll simulate finding the user.
      // A more robust solution would be to query your 'customers' collection in Firestore.
       if (subscription.metadata?.firebase_uid) {
           const userId = subscription.metadata.firebase_uid;
            try {
              const userDocRef = doc(db, 'users', userId);
              await updateDoc(userDocRef, { plan: 'básico' });
              console.log(`User ${userId} plan reverted to básico due to subscription cancellation.`);
            } catch (error) {
              console.error(`Failed to revert plan for user ${userId}:`, error);
            }
       }
    }

    return { received: true };
  }
);
