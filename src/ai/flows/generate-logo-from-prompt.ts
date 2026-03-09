'use server';
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateLogoInputSchema = z.object({
  logoPrompt: z.string(),
});

export async function generateLogoFromPrompt(input: z.infer<typeof GenerateLogoInputSchema>) {
  return generateLogoFromPromptFlow(input);
}

const generateLogoFromPromptFlow = ai.defineFlow(
  {
    name: 'generateLogoFromPromptFlow',
    inputSchema: GenerateLogoInputSchema,
    outputSchema: z.object({ logoUrl: z.string() }),
  },
  async ({ logoPrompt }) => {
    const { media } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: `Professional, minimalist vector logo. Clean lines, solid background. Concept: ${logoPrompt}`,
    });
    
    if (!media?.url) throw new Error('Error al generar imagen');
    
    return { logoUrl: media.url };
  }
);