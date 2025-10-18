'use server';

/**
 * @fileOverview This file defines a Genkit flow for creating a digital identity for a business.
 * @module ai/flows/generate-digital-identity
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateDigitalIdentityInputSchema = z.object({
  businessDescription: z.string().describe('A description of the business.'),
});
export type GenerateDigitalIdentityInput = z.infer<typeof GenerateDigitalIdentityInputSchema>;

const GenerateDigitalIdentityOutputSchema = z.object({
  brandName: z.string().describe('A creative and memorable name for the brand.'),
  slogan: z.string().describe('A catchy slogan that captures the essence of the brand.'),
  colorPalette: z.array(z.object({
    hex: z.string().describe('The hex code of the color (e.g., "#FFFFFF").'),
    name: z.string().describe('The name of the color (e.g., "Snow White").'),
  })).describe('A palette of 3-5 colors that match the brand identity.'),
  logoPrompt: z.string().describe('A suggested prompt for generating a logo for the brand.'),
});
export type GenerateDigitalIdentityOutput = z.infer<typeof GenerateDigitalIdentityOutputSchema>;

export async function generateDigitalIdentity(input: GenerateDigitalIdentityInput): Promise<GenerateDigitalIdentityOutput> {
  return generateDigitalIdentityFlow(input);
}

const generateDigitalIdentityPrompt = ai.definePrompt({
    name: 'generateDigitalIdentityPrompt',
    input: { schema: GenerateDigitalIdentityInputSchema },
    output: { schema: GenerateDigitalIdentityOutputSchema },
    prompt: `You are a world-class branding expert, known for creating iconic brand identities. Your entire output must be in Spanish.

    A user needs help creating a digital identity for their new business.

    **Business Description:** {{{businessDescription}}}

    Your task is to generate the following assets:
    1.  **Brand Name:** A unique, catchy, and available-sounding name.
    2.  **Slogan:** A short, memorable tagline.
    3.  **Color Palette:** A set of 3 to 5 harmonious colors. For each color, provide its hex code and a descriptive name.
    4.  **Logo Prompt:** A concise, descriptive prompt suggestion for an AI image generator to create a logo. This prompt should be based on the brand name and business description. For example: "Un logo minimalista para una marca de café llamada 'Aroma Celestial', con un grano de café formando una luna creciente".

    Return the final output as a JSON object matching the defined schema.
    `,
});


const generateDigitalIdentityFlow = ai.defineFlow(
  {
    name: 'generateDigitalIdentityFlow',
    inputSchema: GenerateDigitalIdentityInputSchema,
    outputSchema: GenerateDigitalIdentityOutputSchema,
  },
  async (input) => {
    const { output } = await generateDigitalIdentityPrompt(input);
    return output!;
  }
);
