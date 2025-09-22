// This is a server-side file.
'use server';

/**
 * @fileOverview This file defines a Genkit flow for customizing supplier recommendations.
 *
 * It allows entrepreneurs to select the types of supplies that should be considered when
 * listing suppliers, so the AI tool can provide better results.
 *
 * @module ai/flows/customize-supplier-recommendations
 *
 * @interface CustomizeSupplierRecommendationsInput - The input type for the customizeSupplierRecommendations function.
 * @interface CustomizeSupplierRecommendationsOutput - The output type for the customizeSupplierRecommendations function.
 * @function customizeSupplierRecommendations - The main function that orchestrates the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema
const CustomizeSupplierRecommendationsInputSchema = z.object({
  businessPlan: z.string().describe('The entrepreneur\'s business plan description.'),
  supplyTypes: z
    .string()
    .describe(
      'Comma separated list of supply types to consider (e.g., 