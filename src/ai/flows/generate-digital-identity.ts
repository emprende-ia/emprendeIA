'use server';
/**
 * @fileOverview Flujo para generar la identidad digital de una marca.
 * Incluye nombre, eslogan, paleta de colores y prompt para logo.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateDigitalIdentityInputSchema = z.object({
  businessDescription: z.string(),
});
export type GenerateDigitalIdentityInput = z.infer<typeof GenerateDigitalIdentityInputSchema>;

const GenerateDigitalIdentityOutputSchema = z.object({
  brandName: z.string(),
  slogan: z.string(),
  colorPalette: z.array(z.object({
    hex: z.string(),
    name: z.string(),
  })),
  logoPrompt: z.string(),
});
export type GenerateDigitalIdentityOutput = z.infer<typeof GenerateDigitalIdentityOutputSchema>;

export async function generateDigitalIdentity(input: GenerateDigitalIdentityInput): Promise<GenerateDigitalIdentityOutput> {
  return generateDigitalIdentityFlow(input);
}

const generateDigitalIdentityPrompt = ai.definePrompt({
    name: 'generateDigitalIdentityPrompt',
    input: { schema: GenerateDigitalIdentityInputSchema },
    output: { schema: GenerateDigitalIdentityOutputSchema },
    model: 'googleai/gemini-2.5-flash',
    prompt: `Actúa como un experto en branding profesional. Tu tarea es crear una identidad digital cohesiva para el siguiente negocio:

    Descripción del Negocio: {{{businessDescription}}}

    Debes generar:
    1. Un nombre de marca creativo y memorable.
    2. Un eslogan corto e impactante.
    3. Una paleta de 3 a 5 colores armónicos (en formato HEX y con un nombre descriptivo para cada color).
    4. Un prompt detallado y optimizado para generar un logo minimalista y profesional usando una IA de imagen.

    Toda la salida debe estar en español. Asegúrate de que los colores contrasten bien y sean adecuados para el giro del negocio.`,
});

const generateDigitalIdentityFlow = ai.defineFlow(
  {
    name: 'generateDigitalIdentityFlow',
    inputSchema: GenerateDigitalIdentityInputSchema,
    outputSchema: GenerateDigitalIdentityOutputSchema,
  },
  async (input) => {
    const { output } = await generateDigitalIdentityPrompt(input);
    if (!output) {
        throw new Error('No se pudo generar la identidad digital.');
    }
    return output;
  }
);
