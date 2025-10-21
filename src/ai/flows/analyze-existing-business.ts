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
    comment: z.string().describe('A general diagnosis of the business based on the user\'s answers.'),
    swot: z.object({
        strengths: z.array(z.string()).describe('List of current capabilities and strengths.'),
        weaknesses: z.array(z.string()).describe('List of internal limitations.'),
        opportunities: z.array(z.string()).describe('List of market trends or new channels.'),
        threats: z.array(z.string()).describe('List of external risks.'),
    }).describe('A SWOT analysis for the existing business.'),
    growthViability: z.object({
        level: z.enum(['Verde', 'Amarillo', 'Rojo']).describe('The growth viability traffic light level.'),
        feedback: z.string().describe('A summary explaining the viability level and suggesting next steps or improvements.'),
    }).describe('The growth viability summary with a traffic light indicator.'),
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

    1.  **General Comment:** Provide a brief initial diagnosis. Example: "Your business has been operating for over a year, which is a significant achievement. You currently sell on social media with stable sales but want to reach more customers. Let's look at your strengths and areas for improvement."
    2.  **SWOT Analysis:** Generate 2-3 bullet points for each category (Strengths, Weaknesses, Opportunities, Threats), adapted for a business that is already running.
    3.  **Growth Viability Traffic Light:** Assign a status indicating how ready the business is to be scaled up.
        - 🟢 **Verde:** "Negocio listo para escalar." Explain why it's strong and ready for growth.
        - 🟡 **Amarillo:** "Negocio con potencial, pero requiere reforzar X puntos." Explain the key areas that need work before scaling.
        - 🔴 **Rojo:** "Negocio en riesgo si no se ajusta." Be honest about core issues (e.g., low sales, limited time) and suggest optimizing processes or exploring a more profitable niche before investing more.
    4.  **Final Recommendation:** Provide a final recommendation with two paths. Use the text: "✅ Sí, quiero potenciar mi negocio → presiona el botón Ir a mi panel de control, 🔄 Prefiero replantear mi estrategia → presiona el botón Reformular mi negocio".


    Structure your response strictly as a JSON object matching the defined output schema.
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
