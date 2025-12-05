
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
        phrase: z.string().describe('A brief phrase summarizing the viability level.'),
        reasons: z.array(z.string()).describe('A list of 2-3 reasons for the given viability level.'),
        nextSteps: z.array(z.string()).describe('A list of 2 concrete next steps for the user.'),
        howToGetToGreen: z.array(z.string()).describe('A list of 2-3 actions to improve or maintain viability.'),
        alternatives: z.array(z.string()).describe("A list of 2 pivot ideas, only if the level is 'Rojo'."),
    }).describe('The viability summary with a traffic light indicator and actionable steps.'),
    costAnalysis: z.object({
        summary: z.string().describe('A brief summary of the initial investment analysis, considering the user\'s existing supplies.'),
        items: z.array(z.object({
            item: z.string().describe('The specific supply or cost item.'),
            category: z.string().describe('The category of the cost (e.g., Equipo, Materia Prima, Legales, Marketing).'),
            priority: z.enum(['Alta', 'Media', 'Baja']).describe('Priority: Alta (essential for launch), Media (important but can be optimized), Baja (nice to have).'),
            costRange: z.string().describe('Estimated cost range in MXN (e.g., "$5,000 - $8,000 MXN").'),
            justification: z.string().describe('A brief explanation of why this item is needed.'),
        })),
    }).describe('A breakdown of estimated initial costs.'),
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
    model: 'googleai/gemini-2.5-flash',
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
    Based on the profile, generate a comprehensive analysis covering three key areas.

    **1. General Commentary & SWOT Analysis:**
    - **Comment:** Provide a quick, insightful commentary on the idea.
    - **SWOT Analysis:** Generate 2-3 bullet points for each category (Strengths, Weaknesses, Opportunities, Threats). Crucially, if the user already has supplies (tieneInsumos is "si"), list this as a key Strength and mention it in the analysis.

    **2. Initial Cost Analysis:**
    - **Cost Breakdown:** Generate a list of 5-7 essential items needed to start. For each item, provide:
        - **item:** The name of the supply/cost.
        - **category:** (e.g., Equipo, Materia Prima, Marketing, Legales).
        - **priority:** 'Alta' for essentials, 'Media' for important but optimizable, 'Baja' for nice-to-haves.
        - **costRange:** A realistic estimated cost range in MXN.
        - **justification:** A brief reason why it's needed.
        - **IMPORTANT:** If the user mentioned having certain supplies, OMIT those from this list and mention it in the summary.
    - **Summary:** Write a brief summary of the investment analysis, acknowledging the user's initial capital and existing supplies.

    **3. Viability Summary:**
    - Assign a traffic light status and provide feedback following these strict rules:

        **For 🟢 Verde:**
        - **phrase:** "Viable; solo ajustes menores."
        - **reasons:** 2-3 reasons why it's a strong idea.
        - **nextSteps:** 2 concrete next steps.
        - **howToGetToGreen:** Provide 2 consolidation actions (e.g., "Definir un canal de venta principal y probar precios", "Crear un perfil de Instagram y publicar 3 veces por semana").
        - **alternatives:** MUST be an empty array.

        **For 🟡 Amarillo:**
        - **phrase:** "Prometedor; requiere mejorar puntos clave."
        - **reasons:** 2-3 reasons explaining the potential and the risks.
        - **nextSteps:** 2 concrete next steps.
        - **howToGetToGreen:** Provide 2-3 concrete, measurable actions (e.g., "Validar el problema con 10 entrevistas a clientes potenciales", "Lanzar una prueba piloto de 1 semana con un producto básico").
        - **alternatives:** MUST be an empty array.

        **For 🔴 Rojo:**
        - **phrase:** "Baja viabilidad hoy; indica bloqueos principales."
        - **reasons:** 2-3 reasons explaining the main blockers (e.g., market saturation, high costs).
        - **nextSteps:** 2 next steps focused on validating the most critical assumption.
        - **howToGetToGreen:** Provide 2-3 minimal actions to clear the biggest risk.
        - **alternatives:** Provide 2 realistic pivot ideas (e.g., "Enfocarse en un nicho más pequeño, como 'café para oficinas'", "Cambiar el canal de venta a marketplaces como Amazon").

    Structure your entire response strictly as a single JSON object matching the defined output schema. Do not add any text before or after the JSON object.
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
