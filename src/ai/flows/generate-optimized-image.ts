
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a high-quality, optimized marketing image using a two-step AI process.
 * 1. An LLM optimizes the user's prompt based on the desired creative type (logo or brand image).
 * 2. An image generation model creates an image from the optimized prompt.
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
  optimizedPrompt: z.string().describe('The AI-enhanced prompt used for generation.'),
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
    
    // Step 1: Dynamically create the prompt for the optimizer.
    let optimizationInstructions = '';
    if (creativeType === 'LOGO') {
        optimizationInstructions = "Focus on concepts for a logo. Add terms like: 'minimalist vector design', '3D isologo concept', 'neutral or transparent background', 'modern typography', 'clean lines'.";
    } else { // BRAND_IMAGE
        optimizationInstructions = "Focus on concepts for a brand image or banner. Add terms like: 'photorealistic studio photography', 'dramatic lighting', '4K render', 'cinematic feel', 'ultra-detailed'.";
    }

    const optimizerPrompt = `You are a creative assistant that enhances user prompts for an AI image generator. Rewrite the following user prompt to be more descriptive, artistic, and detailed. Your entire output must be the new prompt and nothing else.
    ${optimizationInstructions}

    User Prompt: ${prompt}
    Optimized Prompt:`;
    
    // Step 2: Optimize the user's prompt with an LLM.
    const optimizerResponse = await ai.generate({ prompt: optimizerPrompt, model: googleAI.model('gemini-pro') });
    const optimizedPrompt = optimizerResponse.text;

    if (!optimizedPrompt) {
        throw new Error("Failed to optimize the prompt.");
    }
    
    // Step 3: Generate the image using the optimized prompt with the correct image model.
    const { media } = await ai.generate({
        model: googleAI.model('imagen-4.0-fast-generate-001'),
        prompt: optimizedPrompt,
    });

    const imageUrl = media?.url;

    if (!imageUrl) {
        throw new Error("Image generation failed.");
    }

    return { imageUrl, optimizedPrompt };
  }
);
