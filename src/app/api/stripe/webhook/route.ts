// src/app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { handleStripeWebhook } from '@/ai/flows/stripe-webhook';

/**
 * This is the API route that Stripe will call to send webhook events.
 * It's a simple wrapper that passes the request to a Genkit flow for secure processing.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }
    
    // Pass the raw body and signature to the Genkit flow for verification and processing
    const result = await handleStripeWebhook({ body, signature });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Webhook processing error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
