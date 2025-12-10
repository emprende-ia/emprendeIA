'use server';

/**
 * @fileOverview This file defines a Genkit flow to test the Stripe Checkout integration.
 * It creates a checkout session document in Firestore and waits for the Stripe extension
 * to populate the checkout URL.
 * @module ai/flows/test-stripe-checkout
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  addDoc,
  onSnapshot,
  collection,
  DocumentReference,
} from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

// Initialize Firebase app to get a Firestore instance
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const TestStripeCheckoutInputSchema = z.object({
  userId: z.string().describe('The Firebase Auth UID of the user.'),
});
export type TestStripeCheckoutInput = z.infer<typeof TestStripeCheckoutInputSchema>;

const TestStripeCheckoutOutputSchema = z.object({
  checkoutUrl: z.string().url().describe('The URL for the Stripe Checkout session.'),
});
export type TestStripeCheckoutOutput = z.infer<typeof TestStripeCheckoutOutputSchema>;

export async function testStripeCheckout(
  input: TestStripeCheckoutInput
): Promise<TestStripeCheckoutOutput> {
  return testStripeCheckoutFlow(input);
}

const testStripeCheckoutFlow = ai.defineFlow(
  {
    name: 'testStripeCheckoutFlow',
    inputSchema: TestStripeCheckoutInputSchema,
    outputSchema: TestStripeCheckoutOutputSchema,
  },
  async ({ userId }) => {
    if (!userId) {
      throw new Error('User must be authenticated.');
    }

    // 1. Ensure customer document exists in Firestore
    const customerRef = doc(db, 'customers', userId);
    const customerSnap = await getDoc(customerRef);
    if (!customerSnap.exists()) {
      await setDoc(customerRef, {});
    }

    // 2. Create the checkout session document
    const checkoutSessionsCollection = collection(customerRef, 'checkout_sessions');
    const newSessionRef = await addDoc(checkoutSessionsCollection, {
      price: 'price_1SH8EJPvgBWnIXuYe5lVi9h2', // Test price ID
      quantity: 1,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/pricing-success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/pricing-cancel`,
      // The mode can be 'payment', 'setup', or 'subscription'.
      // For a one-time payment test, 'payment' is appropriate.
      mode: 'payment',
    });

    // 3. Wait for the Stripe extension to populate the URL
    return new Promise((resolve, reject) => {
      const unsubscribe = onSnapshot(
        newSessionRef,
        (snapshot) => {
          const data = snapshot.data();
          // The extension adds 'url' when the session is created
          if (data?.url) {
            unsubscribe();
            resolve({ checkoutUrl: data.url });
          }
          // The extension adds 'error' if something goes wrong
          if (data?.error) {
            unsubscribe();
            reject(new Error(data.error.message));
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
        reject(new Error('Flow timed out waiting for Stripe checkout URL.'));
      }, 30000); // 30-second timeout
    });
  }
);
