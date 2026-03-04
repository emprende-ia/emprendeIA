'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating high-quality marketing images.
 * It uses the Imagen model to create photorealistic or stylized brand imagery.
 * @module ai/flows/generate-optimized-image
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const CreativeTypeSchema = z.enum(['LOGO', 'BRAND_IMAGE']);

const GenerateOptimizedImageInputSchema = z.object({
  prompt: z.string().describe('The user\'s simple text prompt to generate the image from.'),
  creativeType: CreativeTypeSchema.describe('The type of creative to generate.'),
});
export type GenerateOptimizedImageInput = z.infer<typeof GenerateOptimizedImageInputSchema>;

const GenerateOptimizedImageOutputSchema = z.object({
  imageUrl: z.string().url().describe('The data URI of the generated image.'),
  optimizedPrompt: z.string().describe('The enhanced prompt used for generation.'),
});
export type GenerateOptimizedImageOutput = z.infer<typeof GenerateOptimizedImageOutputSchema>;

export async function generateOptimizedImage(input: GenerateOptimizedImageInput): Promise<GenerateOptimizedImageOutput> {
  return generateOptimizedImageFlow(input);
}

const generateOptimizedImageFlow = ai.defineFlow(
  {
    name: 'generateOptimizedImageFlow',
    inputSchema: GenerateOptimizedImageInputSchema,
    outputSchema: GenerateOptimizedImageOutputSchema,
  },
  async ({ prompt, creativeType }) => {
    
    let enhancedPrompt = prompt;
    if (creativeType === 'LOGO') {
      enhancedPrompt = `Minimalist vector logo, ${prompt}, high contrast, clean shapes, professional branding, flat design, 4k resolution.`;
    } else {
      enhancedPrompt = `Photorealistic studio photography of ${prompt}, dramatic cinematic lighting, ultra-detailed textures, 8k professional render, clean composition.`;
    }
    
    const { media } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: enhancedPrompt,
    });

    const imageUrl = media?.url;

    if (!imageUrl) {
        throw new Error("Image generation failed. The model did not return image data.");
    }

    return { imageUrl, optimizedPrompt: enhancedPrompt };
  }
);
