'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a logo from a text prompt.
 * It uses the high-performance Imagen model to create visual brand assets.
 *
 * @module ai/flows/generate-logo-from-prompt
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { firebaseConfig } from '@/firebase/config';

const GenerateLogoInputSchema = z.object({
  logoPrompt: z.string().min(10, { message: 'El prompt del logo debe tener al menos 10 caracteres.' }),
});
export type GenerateLogoInput = z.infer<typeof GenerateLogoInputSchema>;

const GenerateLogoOutputSchema = z.object({
  logoUrl: z.string().url().describe("The data URI of the generated standard logo image (512x512)."),
});
export type GenerateLogoOutput = z.infer<typeof GenerateLogoOutputSchema>;

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
    const { media } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: `Create a professional, minimalist, high-quality vector logo. Design concept: ${logoPrompt}. Solid background, clean lines, centered composition, modern branding style, no realistic photography elements.`,
    });
    
    const baseLogoDataUrl = media?.url;
    if (!baseLogoDataUrl) {
        throw new Error('Failed to generate the base logo image.');
    }

    const projectId = process.env.GCLOUD_PROJECT || firebaseConfig.projectId;
    if (!projectId) {
        throw new Error("Project ID is missing. Cannot construct the image processing API URL.");
    }
    const imageProcessingApi = `https://us-central1-${projectId}.cloudfunctions.net/ext-image-processing-api-handler/process`;
    
    const standardSize = { width: 512, height: 512 };

    let standardLogoUrl = baseLogoDataUrl; 
    try {
      const response = await fetch(imageProcessingApi, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              input: { data: baseLogoDataUrl },
              operations: [
                  { name: 'resize', params: { width: standardSize.width, height: standardSize.height, fit: 'cover' } },
              ],
              output: { format: 'webp', data: true }
          }),
      });

      if (response.ok) {
          const result = await response.json();
          standardLogoUrl = result.data;
      }
    } catch (error) {
        console.error(`Error processing image, falling back to original:`, error);
    }
    
    return {
        logoUrl: standardLogoUrl,
    };
  }
);
