
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a high-quality marketing image.
 * It enhances the user's prompt with relevant keywords and then calls an image generation model.
 * @module ai/flows/generate-optimized-image
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/google-genai';

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
    
    // Step 1: Programmatically enhance the user's prompt.
    // This removes the AI-to-AI chain, which can cause build issues.
    let enhancedPrompt = prompt;
    if (creativeType === 'LOGO') {
      enhancedPrompt = `${prompt}, minimalist vector design, 3D isologo concept, neutral or transparent background, modern typography, clean lines`;
    } else {
      enhancedPrompt = `${prompt}, photorealistic studio photography, dramatic lighting, 4K render, cinematic feel, ultra-detailed`;
    }
    
    // Step 2: Generate the image using the enhanced prompt with the image model.
    const { media } = await ai.generate({
        model: googleAI.model('imagen-4.0-fast-generate-001'),
        prompt: enhancedPrompt,
    });

    const imageUrl = media?.url;

    if (!imageUrl) {
        throw new Error("Image generation failed. The AI did not return an image.");
    }

    return { imageUrl, optimizedPrompt: enhancedPrompt };
  }
);
