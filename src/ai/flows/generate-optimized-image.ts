'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a high-quality, optimized marketing image using a two-step AI process.
 * 1. An LLM optimizes the user's prompt.
 * 2. An image generation model creates an image from the optimized prompt.
 * @module ai/flows/generate-optimized-image
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateOptimizedImageInputSchema = z.object({
  prompt: z.string().describe('The user\'s simple text prompt to generate the image from.'),
});
export type GenerateOptimizedImageInput = z.infer<typeof GenerateOptimizedImageInputSchema>;

const GenerateOptimizedImageOutputSchema = z.object({
  imageUrl: z.string().url().describe('The data URI of the generated image.'),
  optimizedPrompt: z.string().describe('The AI-enhanced prompt used for generation.'),
});
export type GenerateOptimizedImageOutput = z.infer<typeof GenerateOptimizedImageOutputSchema>;

export async function generateOptimizedImage(input: GenerateOptimizedImageInput): Promise<GenerateOptimizedImageOutput> {
  return generateOptimizedImageFlow(input);
}

const promptOptimizerPrompt = ai.definePrompt({
    name: 'promptOptimizerPrompt',
    input: { schema: z.object({ prompt: z.string() }) },
    prompt: `You are a creative assistant that enhances user prompts for an AI image generator.
    Rewrite the following user prompt to be more descriptive, artistic, and detailed.
    Add concepts like 'photorealistic', 'ultra-detailed', '3D render', 'cinematic lighting', and 'professional photography' to ensure a high-quality visual output.
    Your response should ONLY be the new, optimized prompt.

    User Prompt: {{{prompt}}}
    Optimized Prompt:`,
});

const generateOptimizedImageFlow = ai.defineFlow(
  {
    name: 'generateOptimizedImageFlow',
    inputSchema: GenerateOptimizedImageInputSchema,
    outputSchema: GenerateOptimizedImageOutputSchema,
  },
  async ({ prompt }) => {
    // Step 1: Optimize the user's prompt with an LLM.
    const { text: optimizedPrompt } = await promptOptimizerPrompt({ prompt });

    if (!optimizedPrompt) {
        throw new Error("Failed to optimize the prompt.");
    }
    
    // Step 2: Generate the image using the optimized prompt.
    const { media } = await ai.generate({
        model: 'googleai/imagen-3.0-generate-002',
        prompt: optimizedPrompt,
    });

    const imageUrl = media?.url;

    if (!imageUrl) {
        throw new Error("Image generation failed.");
    }

    return { imageUrl, optimizedPrompt };
  }
);
