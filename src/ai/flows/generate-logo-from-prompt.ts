'use server';
/**
 * @fileOverview Generador de logos usando Imagen 4.0.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateLogoInputSchema = z.object({
  logoPrompt: z.string().describe('Descripción del logo a generar.'),
});

const GenerateLogoOutputSchema = z.object({
  logoUrl: z.string().url().describe('URL del logo generado.'),
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
    // Usamos el modelo Imagen 4.0 directamente
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
