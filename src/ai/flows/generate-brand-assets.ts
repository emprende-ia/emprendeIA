
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a complete brand identity,
 * including a logo, using a multi-step AI process.
 * 1. An LLM generates a text-based brand identity (name, slogan, logo prompt).
 * 2. An image generation model creates a base logo from the generated prompt.
 * 3. An image processing API creates a standard-sized version of the logo.
 *
 * @module ai/flows/generate-brand-assets
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { firebaseConfig } from '@/firebase/config';

// Define the input schema for the brand generation flow
const GenerateBrandAssetsInputSchema = z.object({
  businessDescription: z.string().describe('A description of the business and its required resources.'),
});
export type GenerateBrandAssetsInput = z.infer<typeof GenerateBrandAssetsInputSchema>;

// Define the output schema for the text-based brand identity elements
const BrandIdentityElementsSchema = z.object({
  brandName: z.string().describe('A creative and memorable name for the brand.'),
  slogan: z.string().describe('A catchy slogan that captures the essence of the brand.'),
  colorPalette: z.array(z.object({
    hex: z.string().describe('The hex code of the color (e.g., "#FFFFFF").'),
    name: z.string().describe('The name of the color (e.g., "Snow White").'),
  })).describe('A palette of 3-5 colors that match the brand identity.'),
  logoPrompt: z.string().describe('A suggested prompt for generating a logo for the brand. This prompt must be in English.'),
});

// Define the final output schema for the entire flow, now with a single logo URL
const GenerateBrandAssetsOutputSchema = z.object({
    brandName: z.string(),
    slogan: z.string(),
    colorPalette: z.array(z.object({ hex: z.string(), name: z.string() })),
    logoPrompt: z.string(),
    logoUrl: z.string().url().describe("The data URI of the generated standard logo image (512x512)."),
    logoSource: z.enum(['ai_generated', 'user_uploaded']).nullable(),
});
export type GenerateBrandAssetsOutput = z.infer<typeof GenerateBrandAssetsOutputSchema>;

// Main exported function to be called from the frontend
export async function generateBrandAssets(input: GenerateBrandAssetsInput): Promise<GenerateBrandAssetsOutput> {
  return generateBrandAssetsFlow(input);
}


// Internal prompt for generating the initial text-based brand identity
const generateIdentityPrompt = ai.definePrompt({
    name: 'generateIdentityElementsPrompt',
    input: { schema: GenerateBrandAssetsInputSchema },
    output: { schema: BrandIdentityElementsSchema },
    prompt: `You are a world-class branding expert. Your entire output must be in Spanish, except for the 'logoPrompt' which MUST be in English.
    Based on the user's business description, generate a brand name, slogan, color palette, and a descriptive logo prompt.
    Business Description: {{{businessDescription}}}
    Return the final output as a JSON object.`,
});


const generateBrandAssetsFlow = ai.defineFlow(
  {
    name: 'generateBrandAssetsFlow',
    inputSchema: GenerateBrandAssetsInputSchema,
    outputSchema: GenerateBrandAssetsOutputSchema,
  },
  async ({ businessDescription }) => {
    // 1. Generate text-based brand identity, including the logo prompt
    const { output: identityElements } = await generateIdentityPrompt({ businessDescription });
    if (!identityElements) {
        throw new Error('Failed to generate brand identity elements.');
    }

    // 2. Generate the base logo image from the newly generated prompt
    const { media } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: identityElements.logoPrompt,
    });
    
    const baseLogoDataUrl = media?.url;
    if (!baseLogoDataUrl) {
        throw new Error('Failed to generate the base logo image.');
    }

    // 3. Define the Image Processing API endpoint and payload
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
    
    // 4. Return all generated assets with the single standard logo URL
    return {
        ...identityElements,
        logoUrl: standardLogoUrl,
        logoSource: 'ai_generated',
    };
  }
);
