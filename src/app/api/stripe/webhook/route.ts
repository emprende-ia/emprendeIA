import { NextResponse, type NextRequest } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/server';
import type { PlanStatus, PlanTier } from '@/lib/supabase/database.types';

export const runtime = 'nodejs';

/**
 * Mapea Stripe price → plan tier. Mantén sincronizado con los price IDs
 * configurados en .env (NEXT_PUBLIC_STRIPE_PLUS_PRICE_ID = oro,
 * NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID = diamante).
 */
function priceIdToTier(priceId: string | undefined | null): PlanTier {
  if (!priceId) return 'basico';
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PLUS_PRICE_ID?.trim()) return 'oro';
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID?.trim()) return 'diamante';
  return 'basico';
}

/**
 * Mapea Stripe subscription.status → nuestro plan_status.
 */
function subscriptionStatusToPlanStatus(status: Stripe.Subscription.Status): PlanStatus {
  switch (status) {
    case 'active':
    case 'trialing':
      return 'active';
    case 'past_due':
    case 'unpaid':
      return 'past_due';
    case 'canceled':
    case 'incomplete_expired':
      return 'canceled';
    default:
      return 'inactive';
  }
}

async function syncSubscriptionToProfile(subscription: Stripe.Subscription) {
  const supabase = createAdminClient();
  const userId = subscription.metadata?.supabase_user_id;
  if (!userId) {
    console.warn('webhook: subscription sin supabase_user_id en metadata', subscription.id);
    return;
  }

  const priceId = subscription.items.data[0]?.price?.id;
  const periodEnd = (subscription as unknown as { current_period_end?: number })
    .current_period_end;

  await supabase
    .from('profiles')
    .update({
      plan: priceIdToTier(priceId),
      plan_status: subscriptionStatusToPlanStatus(subscription.status),
      stripe_subscription_id: subscription.id,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    })
    .eq('id', userId);
}

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Stripe webhook no configurado.' },
      { status: 503 }
    );
  }

  const stripe = getStripe();
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Falta stripe-signature.' }, { status: 400 });
  }

  // Stripe necesita el body crudo para validar la firma.
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'firma inválida';
    return NextResponse.json({ error: `Firma inválida: ${message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.subscription && typeof session.subscription === 'string') {
          const sub = await stripe.subscriptions.retrieve(session.subscription);
          // Asegura el metadata si Stripe no lo propagó
          if (!sub.metadata?.supabase_user_id && session.metadata?.supabase_user_id) {
            await stripe.subscriptions.update(sub.id, {
              metadata: { supabase_user_id: session.metadata.supabase_user_id },
            });
            sub.metadata = { ...sub.metadata, supabase_user_id: session.metadata.supabase_user_id };
          }
          await syncSubscriptionToProfile(sub);
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        await syncSubscriptionToProfile(event.data.object as Stripe.Subscription);
        break;
      }
      default:
        // Eventos que no nos interesan, los acusamos OK.
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'error procesando webhook';
    console.error('stripe webhook handler error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
