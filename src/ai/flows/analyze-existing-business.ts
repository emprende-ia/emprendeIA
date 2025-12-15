
'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing an existing business's potential.
 * @module ai/flows/analyze-existing-business
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const AnalyzeExistingBusinessInputSchema = z.object({
  situacionActual: z.string().describe('The current type of business.'),
  tiempoOperacion: z.string().describe('How long the business has been operating.'),
  nivelVentas: z.string().describe('The current sales level.'),
  canalesVenta: z.string().describe('The current sales channels.'),
  mayorDesafio: z.string().describe('The biggest current challenge.'),
  publicoActual: z.string().describe('The current target audience.'),
  metaCrecimiento: z.string().describe('The main growth goal.'),
});
export type AnalyzeExistingBusinessInput = z.infer<typeof AnalyzeExistingBusinessInputSchema>;


const GrowthAnalysisSchema = z.object({
    comment: z.string().describe('A brief but encouraging comment about the business stage.'),
    swot: z.object({
        strengths: z.array(z.string()).describe('List of current capabilities and strengths.'),
        weaknesses: z.array(z.string()).describe('List of internal limitations.'),
        opportunities: z.array(z.string()).describe('List of market trends or new channels.'),
        threats: z.array(z.string()).describe('List of external risks.'),
    }).describe('A SWOT analysis for the existing business.'),
    growthViability: z.object({
        level: z.enum(['Verde', 'Amarillo', 'Rojo']).describe('The growth viability traffic light level.'),
        phrase: z.string().max(80).describe('A brief phrase summarizing the growth viability level.'),
        reasons: z.array(z.string()).describe('A list of 2-3 reasons for the given viability level.'),
        nextSteps: z.array(z.string()).describe('A list of 2 concrete next steps for the user.'),
        howToGetToGreen: z.array(z.string()).describe('A list of 2-3 actions to improve or maintain growth viability.'),
        alternatives: z.array(z.string()).describe('A list of 2 pivot ideas, only if the level is "Rojo".'),
    }).describe('The growth viability summary with a traffic light indicator and actionable steps.'),
    recommendation: z.string().describe('Final recommendation with two paths: "Sí, quiero potenciar mi negocio" or "Prefiero replantear mi estrategia".'),
});

const AnalyzeExistingBusinessOutputSchema = z.object({
  analysis: GrowthAnalysisSchema,
});

export type AnalyzeExistingBusinessOutput = z.infer<typeof AnalyzeExistingBusinessOutputSchema>;


export async function analyzeExistingBusiness(input: AnalyzeExistingBusinessInput): Promise<AnalyzeExistingBusinessOutput> {
  return analyzeExistingBusinessFlow(input);
}


const analyzeExistingBusinessPrompt = ai.definePrompt({
    name: 'analyzeExistingBusinessPrompt',
    input: { schema: AnalyzeExistingBusinessInputSchema },
    output: { schema: AnalyzeExistingBusinessOutputSchema },
    model: 'googleai/gemini-2.5-flash',
    prompt: `You are an expert business consultant, honest and direct, specializing in scaling existing businesses. Your entire output must be in Spanish.
    Analyze the following profile of an existing business and provide a concise growth potential analysis.

    **Business Profile:**
    - **Current Situation:** {{{situacionActual}}}
    - **Operating Time:** {{{tiempoOperacion}}}
    - **Sales Level:** {{{nivelVentas}}}
    - **Sales Channels:** {{{canalesVenta}}}
    - **Biggest Challenge:** {{{mayorDesafio}}}
    - **Current Audience:** {{{publicoActual}}}
    - **Growth Goal:** {{{metaCrecimiento}}}

    **Your Task:**
    Based on the profile, generate a brief but critical analysis of the business's growth potential.

    1.  **General Comment:** Provide a brief initial diagnosis. Example: "Tu negocio tiene bases sólidas con más de un año operando. El desafío de conseguir más clientes es común, pero tus ventas estables son una gran fortaleza. Veamos cómo escalar."
    2.  **SWOT Analysis:** Generate 2-3 bullet points for each category (Strengths, Weaknesses, Opportunities, Threats), adapted for a business that is already running.
    3.  **Growth Viability Summary:** Assign a traffic light status and provide feedback following these strict rules:

        **For 🟢 Verde: "Negocio listo para escalar"**
        - **phrase:** "Bases sólidas; listo para crecer."
        - **reasons:** 2-3 reasons why the business is in a good position to scale (e.g., "Ventas estables demuestran demanda", "Canales de venta diversificados").
        - **nextSteps:** 2 concrete next steps for scaling (e.g., "Implementar una campaña de fidelización", "Explorar un nuevo canal de venta en línea").
        - **howToGetToGreen:** Title must be "Cómo acelerar el crecimiento". Provide 2 consolidation actions (e.g., "Invertir un 10% de las ganancias en publicidad", "Automatizar el seguimiento a clientes").
        - **alternatives:** MUST be an empty array.

        **For 🟡 Amarillo: "Potencial de crecimiento con ajustes clave"**
        - **phrase:** "Buen potencial; requiere optimización."
        - **reasons:** 2-3 reasons explaining the potential and the key areas to improve (e.g., "Ventas estables pero dependencia de un solo canal", "El desafío financiero indica necesidad de ordenar costos").
        - **nextSteps:** 2 concrete next steps to address weaknesses.
        - **howToGetToGreen:** Title must be "Cómo pasar a la fase de crecimiento". Provide 2-3 concrete actions to fix the weak points (e.g., "Crear un presupuesto detallado y revisar gastos mensuales", "Lanzar una encuesta para entender mejor a tus clientes actuales").
        - **alternatives:** MUST be an empty array.

        **For 🔴 Rojo: "Riesgo alto; optimizar antes de escalar"**
        - **phrase:** "Riesgo alto; optimizar antes de escalar."
        - **reasons:** 2-3 reasons explaining the main blockers (e.g., "Ventas bajas indican un problema de producto o mercado", "El mayor desafío es financiero, lo cual es crítico").
        - **nextSteps:** 2 next steps focused on stabilization, not growth (e.g., "Realizar entrevistas a clientes y no clientes para entender por qué no compran", "Analizar la estructura de costos a fondo").
        - **howToGetToGreen:** Title must be "Cómo estabilizar el negocio". Provide 2-3 minimal actions to address the biggest risk.
        - **alternatives:** Provide 2 realistic pivot ideas (e.g., "Enfocarse en el producto más vendido y pausar los demás", "Cambiar de público objetivo a un nicho más específico y rentable").
        
    4.  **Final Recommendation:** Provide a final recommendation with two paths. Use the text: "Con este análisis, tienes dos caminos claros: si te sientes listo para aplicar las mejoras y escalar, ¡ve a tu Panel de Control! Si crees que necesitas repensar las bases, puedes reformular tu negocio."

    Structure your response strictly as a JSON object matching the defined output schema. Do not add any text before or after the JSON object.
    `,
});


const analyzeExistingBusinessFlow = ai.defineFlow(
  {
    name: 'analyzeExistingBusinessFlow',
    inputSchema: AnalyzeExistingBusinessInputSchema,
    outputSchema: AnalyzeExistingBusinessOutputSchema,
  },
  async (input) => {
    const { output } = await analyzeExistingBusinessPrompt(input);
    if (!output) {
      throw new Error("The AI model failed to return a valid analysis.");
    }
    return output;
  }
);
