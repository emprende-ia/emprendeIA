
'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing a business idea's viability.
 * @module ai/flows/analyze-business-idea
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Schema for the detailed form input, now defined internally.
const AnalyzeBusinessIdeaInputSchema = z.object({
  idea: z.string().describe('The user\'s business idea.'),
  tipoNegocio: z.string().describe('The type of business (physical, online, both).'),
  capitalInicial: z.string().describe('The initial capital investment range. Can be "No especificado".'),
  experienciaPrevia: z.string().describe('The user\'s prior experience level. Can be "No especificada".'),
  tieneInsumos: z.string().describe('Whether the user already has supplies ("si" or "no").'),
  insumosDetalle: z.string().optional().describe('A description of the supplies the user already has. Provided only if tieneInsumos is "si".'),
  publicoObjetivo: z.string().describe('The target audience, comma-separated.'),
  objetivoPrincipal: z.string().describe('The primary goal of the venture, comma-separated.'),
  necesidad: z.string().describe('The problem or need the business solves. This is the same as the "idea" field.'),
  competencia: z.string().optional().describe('Any known competitors. Can be "No especificada".'),
  disponibilidadTiempo: z.string().describe('The time commitment available per week.'),
});
// The type can still be exported.
export type AnalyzeBusinessIdeaInput = z.infer<typeof AnalyzeBusinessIdeaInputSchema>;

// Schema for the AI's output, now defined internally.
const ViabilityAnalysisSchema = z.object({
    comment: z.string().describe('A brief but critical and encouraging comment about the business idea.'),
    swot: z.object({
        strengths: z.array(z.string()).describe('List of strengths for the idea.'),
        weaknesses: z.array(z.string()).describe('List of weaknesses for the idea.'),
        opportunities: z.array(z.string()).describe('List of opportunities for the idea.'),
        threats: z.array(z.string()).describe('List of threats to the idea.'),
    }).describe('A SWOT analysis of the business idea.'),
    viability: z.object({
        level: z.enum(['Verde', 'Amarillo', 'Rojo']).describe('The viability traffic light level.'),
        feedback: z.string().describe('A summary explaining the viability level and suggesting next steps or improvements.'),
    }).describe('The viability summary with a traffic light indicator.'),
});

const AnalyzeBusinessIdeaOutputSchema = z.object({
  analysis: ViabilityAnalysisSchema,
});
// The type can still be exported.
export type AnalyzeBusinessIdeaOutput = z.infer<typeof AnalyzeBusinessIdeaOutputSchema>;

// This is the only function exported, and it's async, which is correct.
export async function analyzeBusinessIdea(input: AnalyzeBusinessIdeaInput): Promise<AnalyzeBusinessIdeaOutput> {
  return analyzeBusinessIdeaFlow(input);
}


const analyzeBusinessIdeaPrompt = ai.definePrompt({
    name: 'analyzeBusinessIdeaPrompt',
    input: { schema: AnalyzeBusinessIdeaInputSchema },
    output: { schema: AnalyzeBusinessIdeaOutputSchema },
    prompt: `You are an expert business consultant, honest and direct, but also encouraging. Your entire output must be in Spanish.
    Analyze the following user profile for a new business venture and provide a concise viability analysis.

    **User Business Profile:**
    - **Idea:** {{{idea}}}
    - **Business Type:** {{{tipoNegocio}}}
    - **Initial Capital:** {{{capitalInicial}}}
    - **Experience:** {{{experienciaPrevia}}}
    - **Already Has Supplies?:** {{{tieneInsumos}}}
    {{#if insumosDetalle}}- **Details on Supplies:** {{{insumosDetalle}}}{{/if}}
    - **Target Audience:** {{{publicoObjetivo}}}
    - **Main Goal:** {{{objetivoPrincipal}}}
    - **Known Competition:** {{{competencia}}}
    - **Time Availability:** {{{disponibilidadTiempo}}}

    **Your Task:**
    Based on the profile, generate a brief but critical analysis.

    1.  **Comment on the idea:** Provide a quick, insightful commentary.
    2.  **SWOT Analysis:** Generate 2-3 bullet points for each category (Strengths, Weaknesses, Opportunities, Threats). Crucially, if the user already has supplies (tieneInsumos is "si"), list this as a key Strength and consider it when analyzing weaknesses related to initial investment.
    3.  **Viability Summary:** Assign a traffic light status and provide feedback.
        - 🟢 **Verde:** "Idea viable con ajustes mínimos." Explain why it's strong.
        - 🟡 **Amarillo:** "Idea viable, pero requiere mejorar en X puntos." Explain the key areas that need work.
        - 🔴 **Rojo:** "Idea con baja viabilidad." Be honest about the core issues and suggest potential pivots or alternative approaches.

    Structure your response strictly as a JSON object matching the defined output schema.
    `,
});


const analyzeBusinessIdeaFlow = ai.defineFlow(
  {
    name: 'analyzeBusinessIdeaFlow',
    inputSchema: AnalyzeBusinessIdeaInputSchema,
    outputSchema: AnalyzeBusinessIdeaOutputSchema,
  },
  async (input) => {
    const { output } = await analyzeBusinessIdeaPrompt(input);
    if (!output) {
      throw new Error("The AI model failed to return a valid analysis.");
    }
    return output;
  }
);
