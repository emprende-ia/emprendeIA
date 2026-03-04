
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
      'Comma separated list of supply types to consider (e.g., "materias primas", "empaque").'
    ),
});
export type CustomizeSupplierRecommendationsInput = z.infer<
  typeof CustomizeSupplierRecommendationsInputSchema
>;

const CustomizeSupplierRecommendationsOutputSchema = z.object({
  recommendedSuppliers: z
    .array(
      z.object({
        name: z.string(),
        relevanceScore: z.number().min(0).max(1),
        justification: z.string(),
      })
    )
    .describe('A list of recommended suppliers with relevance scores and justifications.'),
});

export type CustomizeSupplierRecommendationsOutput = z.infer<
  typeof CustomizeSupplierRecommendationsOutputSchema
>;

// Exported function that calls the flow.
export async function customizeSupplierRecommendations(
  input: CustomizeSupplierRecommendationsInput
): Promise<CustomizeSupplierRecommendationsOutput> {
  return await customizeSupplierRecommendationsFlow(input);
}

// Define the prompt at the top level
const recommendationPrompt = ai.definePrompt({
    name: 'customRecommendationPrompt',
    model: 'googleai/gemini-2.5-flash',
    input: { schema: CustomizeSupplierRecommendationsInputSchema },
    output: { schema: CustomizeSupplierRecommendationsOutputSchema },
    prompt: `You are a business consultant. Based on the business plan and focusing only on the specified supply types, recommend a list of 3 fictional suppliers. Provide a relevance score (0.0 to 1.0) and a brief justification for each. Output must be in Spanish.

    Business Plan: {{{businessPlan}}}
    Supply Types to Focus On: {{{supplyTypes}}}
    `,
});


// Define the flow at the top level
const customizeSupplierRecommendationsFlow = ai.defineFlow(
  {
    name: 'customizeSupplierRecommendationsFlow',
    inputSchema: CustomizeSupplierRecommendationsInputSchema,
    outputSchema: CustomizeSupplierRecommendationsOutputSchema,
  },
  async (input) => {
    const { output } = await recommendationPrompt(input);
    if (!output) {
      throw new Error('Failed to get recommendations from the AI model.');
    }
    // The output from the prompt should match the flow's output schema.
    return output;
  }
);
