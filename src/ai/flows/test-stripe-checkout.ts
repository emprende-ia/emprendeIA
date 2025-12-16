
'use server';

/**
 * @fileOverview This file defines a Genkit flow for creating a Stripe Checkout session
 * by creating a document in Firestore, which is then processed by the Stripe Firebase Extension.
 *
 * @module ai/flows/create-checkout-session
 *
 * @interface CreateCheckoutSessionInput - The input type for the flow.
 * @interface CreateCheckoutSessionOutput - The output type for the flow.
 * @function createCheckoutSession - The main function that orchestrates the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  addDoc,
  onSnapshot,
  collection,
} from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

// Initialize Firebase app to get a Firestore instance
if (!getApps().length) {
  initializeApp(firebaseConfig);
}
const db = getFirestore(getApp());

const CreateCheckoutSessionInputSchema = z.object({
  userId: z.string().describe('The Firebase Auth UID of the user.'),
  priceId: z.string().describe('The ID of the Stripe Price object.'),
  userEmail: z.string().email().optional().describe('The email of the user (optional).'),
});
export type CreateCheckoutSessionInput = z.infer<typeof CreateCheckoutSessionInputSchema>;

const CreateCheckoutSessionOutputSchema = z.object({
  checkoutUrl: z.string().url().describe('The URL for the Stripe Checkout session.'),
  sessionId: z.string().describe('The ID of the created Firestore document.'),
});
export type CreateCheckoutSessionOutput = z.infer<typeof CreateCheckoutSessionOutputSchema>;

// This is the main exported function that will be called from client components.
export async function createCheckoutSession(
  input: CreateCheckoutSessionInput
): Promise<CreateCheckoutSessionOutput> {
  return createCheckoutSessionFlow(input);
}

const createCheckoutSessionFlow = ai.defineFlow(
  {
    name: 'createCheckoutSessionFlow',
    inputSchema: CreateCheckoutSessionInputSchema,
    outputSchema: CreateCheckoutSessionOutputSchema,
  },
  async ({ userId, priceId, userEmail }) => {
    if (!userId) {
      throw new Error('User must be authenticated to create a checkout session.');
    }

    // Step 1: Ensure the customer document exists in Firestore.
    // The Stripe extension requires this parent document to exist before creating a sub-collection document.
    const customerDocRef = doc(db, 'customers', userId);
    await setDoc(customerDocRef, { 
      email: userEmail || null,
      stripeId: null // Stripe ID will be populated by the extension
    }, { merge: true });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';

    // Step 2: Create the checkout session document in the sub-collection.
    const checkoutSessionsCollection = collection(db, 'customers', userId, 'checkout_sessions');
    const newSessionDoc = await addDoc(checkoutSessionsCollection, {
      price: priceId,
      quantity: 1,
      success_url: `${appUrl}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pricing`,
      mode: 'subscription', // or 'payment' if it's a one-time charge
      client_reference_id: userId,
      customer_email: userEmail || undefined, // Add email if available
      metadata: {
        firebase_uid: userId,
      },
    });

    // Step 3: Wait for the Stripe extension to populate the checkout URL.
    return new Promise((resolve, reject) => {
      const unsubscribe = onSnapshot(
        newSessionDoc,
        (snapshot) => {
          const data = snapshot.data();
          // The extension adds 'url' when the session is created successfully
          if (data?.url) {
            unsubscribe();
            resolve({ checkoutUrl: data.url, sessionId: newSessionDoc.id });
          }
          // The extension adds 'error' if something goes wrong
          if (data?.error) {
            unsubscribe();
            console.error("Stripe Extension Error:", data.error.message);
            reject(new Error(`Error from Stripe Extension: ${data.error.message}`));
          }
        },
        (error) => {
          unsubscribe();
          reject(error);
        }
      );

      // Add a timeout to prevent the flow from running indefinitely
      setTimeout(() => {
        unsubscribe();
        reject(new Error('Flow timed out waiting for Stripe checkout URL. Check the Stripe Extension logs.'));
      }, 40000); // 40-second timeout
    });
  }
);

    