
'use server';

/**
 * @fileOverview This file defines a Genkit flow for regenerating a brand name and slogan.
 * @module ai/flows/regenerate-brand-elements
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const RegenerateBrandElementsInputSchema = z.object({
  businessDescription: z.string().describe('A description of the business.'),
});
export type RegenerateBrandElementsInput = z.infer<typeof RegenerateBrandElementsInputSchema>;

const RegenerateBrandElementsOutputSchema = z.object({
  brandName: z.string().describe('A new creative and memorable name for the brand.'),
  slogan: z.string().describe('A new catchy slogan that captures the essence of the brand.'),
});
export type RegenerateBrandElementsOutput = z.infer<typeof RegenerateBrandElementsOutputSchema>;

export async function regenerateBrandElements(input: RegenerateBrandElementsInput): Promise<RegenerateBrandElementsOutput> {
  return regenerateBrandElementsFlow(input);
}

const regeneratePrompt = ai.definePrompt({
    name: 'regenerateBrandElementsPrompt',
    input: { schema: RegenerateBrandElementsInputSchema },
    output: { schema: RegenerateBrandElementsOutputSchema },
    prompt: `You are a branding expert. Your entire output must be in Spanish.
    Based on the business description, generate a new brand name and slogan.
    Business Description: {{{businessDescription}}}
    Return the final output as a JSON object.`,
});


const regenerateBrandElementsFlow = ai.defineFlow(
  {
    name: 'regenerateBrandElementsFlow',
    inputSchema: RegenerateBrandElementsInputSchema,
    outputSchema: RegenerateBrandElementsOutputSchema,
  },
  async (input) => {
    const { output } = await regeneratePrompt(input);
    return output!;
  }
);
