import { config } from 'dotenv';
config();

import '@/ai/flows/customize-supplier-recommendations.ts';
import '@/ai/flows/suggest-relevant-suppliers.ts';
import '@/ai/flows/create-stripe-checkout-session.ts';
import '@/ai/flows/stripe-webhook.ts';
import '@/ai/flows/generate-digital-identity.ts';
import '@/ai_flows/generate-action-plan.ts';
import '@/ai_flows/generate-marketing-image.ts';
