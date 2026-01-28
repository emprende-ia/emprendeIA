// src/app/api/stripe/webhook/route.ts
import { NextResponse } from 'next/server';

/**
 * This webhook is disabled because its logic is handled by the `onCheckoutSessionCompleted`
 * Cloud Function, which is triggered by the official Firebase Stripe Extension.
 * Keeping both would be redundant and cause build errors.
 */
export async function POST() {
  return NextResponse.json({ received: true, message: 'Webhook handler is disabled; processing is handled by a Cloud Function.' });
}
