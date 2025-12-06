
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a logo from a text prompt.
 * It uses an image generation model and an image processing API to return a standard-sized logo.
 *
 * @module ai/flows/generate-logo-from-prompt
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { firebaseConfig } from '@/firebase/config';

// Define the input schema for the logo generation flow
const GenerateLogoInputSchema = z.object({
  logoPrompt: z.string().min(10, { message: 'El prompt del logo debe tener al menos 10 caracteres.' }),
});
export type GenerateLogoInput = z.infer<typeof GenerateLogoInputSchema>;

// Define the output schema for the logo generation flow
const GenerateLogoOutputSchema = z.object({
  logoUrl: z.string().url().describe("The data URI of the generated standard logo image (512x512)."),
});
export type GenerateLogoOutput = z.infer<typeof GenerateLogoOutputSchema>;

// Main exported function to be called from the frontend
export async function generateLogoFromPrompt(input: GenerateLogoInput): Promise<GenerateLogoOutput> {
  return generateLogoFromPromptFlow(input);
}

const generateLogoFromPromptFlow = ai.defineFlow(
  {
    name: 'generateLogoFromPromptFlow',
    inputSchema: GenerateLogoInputSchema,
    outputSchema: GenerateLogoOutputSchema,
  },
  async ({ logoPrompt }) => {
    // 1. Generate the base logo image from the provided prompt
    const { media } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: logoPrompt,
    });
    
    const baseLogoDataUrl = media?.url;
    if (!baseLogoDataUrl) {
        throw new Error('Failed to generate the base logo image.');
    }

    // 2. Define the Image Processing API endpoint and payload
    const imageProcessingApi = `https://us-central1-${firebaseConfig.projectId}.cloudfunctions.net/ext-image-processing-api-handler/process`;
    
    // Define the single standard size
    const standardSize = { width: 512, height: 512 };

    let standardLogoUrl = baseLogoDataUrl; // Fallback to base image
    try {
      const response = await fetch(imageProcessingApi, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              input: { data: baseLogoDataUrl }, // Pass data URI directly
              operations: [
                  { name: 'resize', params: { width: standardSize.width, height: standardSize.height, fit: 'cover' } },
              ],
              output: { format: 'webp', data: true } // Request output as data URI
          }),
      });

      if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`Image processing failed: ${response.status} ${errorBody}`);
      }

      const result = await response.json();
      standardLogoUrl = result.data; // The result is already a data URI
    } catch (error) {
        console.error(`Error processing image, falling back to original:`, error);
        // If processing fails, we'll just use the original data URL
        standardLogoUrl = baseLogoDataUrl;
    }
    
    // 3. Return the single standard logo URL
    return {
        logoUrl: standardLogoUrl,
    };
  }
);
