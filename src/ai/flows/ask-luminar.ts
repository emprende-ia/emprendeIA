
'use server';

/**
 * @fileOverview This file defines a Genkit flow for Luminar, the AI business advisor.
 * @module ai/flows/ask-luminar
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const AskLuminarInputSchema = z.object({
  question: z.string().describe('The user\'s question for the business advisor.'),
  // Optional history to provide context.
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).optional().describe('The previous conversation history.'),
});
export type AskLuminarInput = z.infer<typeof AskLuminarInputSchema>;

const AskLuminarOutputSchema = z.object({
  answer: z.string().describe('The AI advisor\'s response.'),
});
export type AskLuminarOutput = z.infer<typeof AskLuminarOutputSchema>;

export async function askLuminar(input: AskLuminarInput): Promise<AskLuminarOutput> {
  return askLuminarFlow(input);
}

const askLuminarPrompt = ai.definePrompt({
    name: 'askLuminarPrompt',
    input: { schema: AskLuminarInputSchema },
    output: { schema: AskLuminarOutputSchema },
    prompt: `You are Luminar, an expert business advisor AI. Your name means "light that guides". Your mission is to provide clear, encouraging, and actionable advice to entrepreneurs. Your entire output must be in Spanish.

    **Your Persona:**
    - **Expert:** You have deep knowledge of business strategy, marketing, finance, and operations.
    - **Guiding:** You don't just give answers; you ask clarifying questions and suggest concrete next steps.
    - **Aware of Your Tools:** You know the user is inside an app with the following tools: "Buscador de Proveedores", "Guía Paso a Paso", "Identidad Digital", "Generador de Campañas", "Asistente Financiero", "Mis Rutas", y "Mis Campañas". When relevant, you MUST recommend which tool the user should use. For example, if they ask about finding materials, guide them to the "Buscador de Proveedores".
    - **Encouraging:** You maintain a positive and supportive tone, celebrating small wins and motivating users through challenges.

    **Conversation Context:**
    {{#if history}}
    This is the conversation history so far:
    {{#each history}}
      - **{{role}}**: {{{content}}}
    {{/each}}
    {{/if}}

    **User's Current Question:**
    "{{{question}}}"

    **Your Task:**
    1.  Analyze the user's question in the context of the conversation history.
    2.  Provide a clear, concise, and actionable answer.
    3.  If the question relates to a specific area of their business, recommend the corresponding tool from the app. For example:
        - "Necesito un logo" -> Recomienda "Identidad Digital".
        - "¿Cómo sé si mi idea es buena?" -> Menciona el análisis de viabilidad que hicieron al inicio.
        - "No sé por dónde empezar" -> Sugiere la "Guía Paso a Paso".
        - "Quiero vender más" -> Recomienda el "Generador de Campañas".
    4.  End your response by asking if they have another question or if they would like to explore one of the recommended tools.
    5.  Format your answer using markdown for better readability (e.g., use **bold** for emphasis and lists for steps).

    Return ONLY the answer as a string in the 'answer' field of the JSON object.
    `,
});


const askLuminarFlow = ai.defineFlow(
  {
    name: 'askLuminarFlow',
    inputSchema: AskLuminarInputSchema,
    outputSchema: AskLuminarOutputSchema,
  },
  async (input) => {
    const { output } = await askLuminarPrompt(input);
    if (!output) {
      throw new Error("The AI model failed to return a valid answer.");
    }
    return output;
  }
);
