'use server';
/**
 * @fileOverview Flow for generating brand logos using the Imagen model.
 * 
 * - generateLogoFromPrompt: Wrapper function for the flow.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateLogoInputSchema = z.object({
  logoPrompt: z.string().describe('Description of the logo to generate.'),
});

const GenerateLogoOutputSchema = z.object({
  logoUrl: z.string().url().describe('The data URI or URL of the generated image.'),
});

export async function generateLogoFromPrompt(input: z.infer<typeof GenerateLogoInputSchema>) {
  return generateLogoFromPromptFlow(input);
}

const generateLogoFromPromptFlow = ai.defineFlow(
  {
    name: 'generateLogoFromPromptFlow',
    inputSchema: GenerateLogoInputSchema,
    outputSchema: GenerateLogoOutputSchema,
  },
  async ({ logoPrompt }) => {
    // We use the Google AI plugin model which is simpler and more reliable in this environment.
    const { media } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: `Professional, minimalist vector logo, clean lines, solid white background, high contrast, concept: ${logoPrompt}`,
    });
    
    if (!media?.url) {
        throw new Error('Error al generar la imagen del logo. Inténtalo de nuevo.');
    }
    
    return { logoUrl: media.url };
  }
);
