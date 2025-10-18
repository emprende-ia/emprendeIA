'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a marketing image.
 * @module ai/flows/generate-marketing-image
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateMarketingImageInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate the image from.'),
});
export type GenerateMarketingImageInput = z.infer<typeof GenerateMarketingImageInputSchema>;

const GenerateMarketingImageOutputSchema = z.object({
  imageUrl: z.string().describe('The data URI of the generated image.'),
});
export type GenerateMarketingImageOutput = z.infer<typeof GenerateMarketingImageOutputSchema>;

export async function generateMarketingImage(input: GenerateMarketingImageInput): Promise<GenerateMarketingImageOutput> {
  return generateMarketingImageFlow(input);
}

const generateMarketingImageFlow = ai.defineFlow(
  {
    name: 'generateMarketingImageFlow',
    inputSchema: GenerateMarketingImageInputSchema,
    outputSchema: GenerateMarketingImageOutputSchema,
  },
  async ({ prompt }) => {
    
    const { media } = await ai.generate({
        model: 'googleai/imagen-3.0-generate-002',
        prompt: `Create a professional, high-quality marketing image for a new business. The image should be visually appealing and suitable for social media campaigns. Prompt: "${prompt}"`,
    });

    const imageUrl = media?.url;

    if (!imageUrl) {
        throw new Error("Image generation failed.");
    }

    return { imageUrl };
  }
);
