'use server';
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateDigitalIdentityInputSchema = z.object({
  businessDescription: z.string(),
});

const GenerateDigitalIdentityOutputSchema = z.object({
  brandName: z.string(),
  slogan: z.string(),
  colorPalette: z.array(z.object({
    hex: z.string(),
    name: z.string(),
  })),
  logoPrompt: z.string(),
});

export async function generateDigitalIdentity(input: z.infer<typeof GenerateDigitalIdentityInputSchema>) {
  return generateDigitalIdentityFlow(input);
}

const generateDigitalIdentityPrompt = ai.definePrompt({
    name: 'generateDigitalIdentityPrompt',
    input: { schema: GenerateDigitalIdentityInputSchema },
    output: { schema: GenerateDigitalIdentityOutputSchema },
    model: 'googleai/gemini-2.5-flash',
    prompt: `Actúa como un experto en branding. Genera una identidad digital para: {{{businessDescription}}}.
    Incluye: Nombre de marca, eslogan, paleta de 3-5 colores armónicos y un prompt detallado para generar un logo minimalista. Todo en español.`,
});

const generateDigitalIdentityFlow = ai.defineFlow(
  {
    name: 'generateDigitalIdentityFlow',
    inputSchema: GenerateDigitalIdentityInputSchema,
    outputSchema: GenerateDigitalIdentityOutputSchema,
  },
  async (input) => {
    const { output } = await generateDigitalIdentityPrompt(input);
    return output!;
  }
);