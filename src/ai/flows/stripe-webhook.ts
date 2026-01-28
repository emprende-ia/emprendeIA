
'use server';

/**
 * @fileOverview This flow is disabled.
 * The logic for handling Stripe events is now managed exclusively by the 
 * `onCheckoutSessionCompleted` Cloud Function in `functions/src/index.ts`.
 * This function is triggered by writes to Firestore from the official Firebase Stripe Extension,
 * which is the recommended and more robust pattern. Keeping this manual webhook
 * was causing build and deployment failures.
 */

// This file is intentionally left with no exports to disable the flow.
