import { config } from 'dotenv';
config();

import '@/ai/flows/customize-supplier-recommendations.ts';
import '@/ai/flows/suggest-relevant-suppliers.ts';
import '@/ai/flows/create-stripe-checkout-session.ts';
