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
        relevanceScore: z.number(),
      })
    )
    .describe('A list of recommended suppliers with relevance scores.'),
});

export type CustomizeSupplierRecommendationsOutput = z.infer<
  typeof CustomizeSupplierRecommendationsOutputSchema
>;

export async function customizeSupplierRecommendations(
  input: CustomizeSupplierRecommendationsInput
): Promise<CustomizeSupplierRecommendationsOutput> {
  const recommendationFlow = ai.defineFlow(
    {
      name: 'recommendationFlow',
      inputSchema: CustomizeSupplierRecommendationsInputSchema,
      outputSchema: CustomizeSupplierRecommendationsOutputSchema,
    },
    async ({businessPlan, supplyTypes}) => {
      const prompt = `Based on the business plan: "${businessPlan}" and considering the supply types: "${supplyTypes}", recommend a list of suppliers.`;

      const llmResponse = await ai.generate({
        prompt: prompt,
      });

      const generatedText = llmResponse.text;

      // This is a placeholder for actual logic to parse the LLM response
      // and format it into the output schema.
      return {
        recommendedSuppliers: [
          {name: 'Supplier A', relevanceScore: 0.9},
          {name: 'Supplier B', relevanceScore: 0.8},
        ],
      };
    }
  );

  return await recommendationFlow(input);
}
