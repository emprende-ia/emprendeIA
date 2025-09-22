// src/ai/flows/suggest-relevant-suppliers.ts
'use server';
/**
 * @fileOverview This file defines a Genkit flow to suggest relevant suppliers based on a business plan.
 *
 * The flow takes a business plan as input and returns a list of suggested suppliers with their details.
 *
 * @param {SuggestRelevantSuppliersInput} input - The input data for the flow, including the business plan and optional supplier tool selection.
 * @returns {Promise<SuggestRelevantSuppliersOutput>} A promise that resolves to the output of the flow, containing a list of suggested suppliers.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRelevantSuppliersInputSchema = z.object({
  businessPlan: z
    .string()
    .describe('The business plan of the entrepreneur.'),
  supplierToolSelection: z
    .string()
    .optional()
    .describe(
      'Optional selection of supplier tools to consider for recommendations.'
    ),
});
export type SuggestRelevantSuppliersInput = z.infer<
  typeof SuggestRelevantSuppliersInputSchema
>;

const SupplierSchema = z.object({
  name: z.string().describe('The name of the supplier.'),
  description: z.string().describe('A description of the supplier.'),
  contactInfo: z.string().describe('The contact information of the supplier.'),
  location: z.string().describe('The location of the supplier.'),
  specialOffers: z.string().optional().describe('Any special offers from the supplier.'),
});

const SuggestRelevantSuppliersOutputSchema = z.object({
  suppliers: z.array(SupplierSchema).describe('A list of suggested suppliers.'),
});
export type SuggestRelevantSuppliersOutput = z.infer<
  typeof SuggestRelevantSuppliersOutputSchema
>;

export async function suggestRelevantSuppliers(
  input: SuggestRelevantSuppliersInput
): Promise<SuggestRelevantSuppliersOutput> {
  return suggestRelevantSuppliersFlow(input);
}

const suggestRelevantSuppliersPrompt = ai.definePrompt({
  name: 'suggestRelevantSuppliersPrompt',
  input: {schema: SuggestRelevantSuppliersInputSchema},
  output: {schema: SuggestRelevantSuppliersOutputSchema},
  prompt: `You are an AI assistant designed to analyze business plans and suggest relevant suppliers.

  Analyze the following business plan:
  {{businessPlan}}

  {% if supplierToolSelection %}
  Consider these supplier tools: {{supplierToolSelection}}
  {% endif %}

  Based on the business plan, suggest a list of suppliers that can help the entrepreneur.
  Each supplier should include the following information:
  - name: The name of the supplier.
  - description: A brief description of the supplier and what they offer.
  - contactInfo: The contact information of the supplier (e.g., phone number, email address).
  - location: The location of the supplier.
  - specialOffers: Any special offers the supplier may have.

  Return the suppliers in a JSON format.
  `,
});

const suggestRelevantSuppliersFlow = ai.defineFlow(
  {
    name: 'suggestRelevantSuppliersFlow',
    inputSchema: SuggestRelevantSuppliersInputSchema,
    outputSchema: SuggestRelevantSuppliersOutputSchema,
  },
  async input => {
    const {output} = await suggestRelevantSuppliersPrompt(input);
    return output!;
  }
);
