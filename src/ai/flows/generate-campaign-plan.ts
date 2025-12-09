
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a detailed action plan for a marketing campaign.
 * @module ai/flows/generate-campaign-plan
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Define the schema locally to avoid Genkit/Zod resolution issues with imported schemas.
const CampaignPlanSchema = z.object({
    strategy: z.string().describe("A brief, one-paragraph summary of the overall strategy for this campaign."),
    contentSuggestions: z.array(z.string()).describe("A list of 3-5 specific content ideas to create for this campaign (e.g., 'Un Reel mostrando el proceso artesanal', 'Un carrusel con testimonios de clientes')."),
    actionableTasks: z.array(z.string()).describe("A list of 5-7 concrete, actionable tasks to execute the campaign (e.g., 'Definir paleta de colores para la campaña', 'Escribir 3 borradores de copy para anuncios', 'Contactar a 2 micro-influencers')."),
    kpis: z.array(z.string()).describe("A list of 2-3 key performance indicators (KPIs) to measure the campaign's success (e.g., 'Tasa de interacción', 'Número de seguidores nuevos', 'Ventas generadas desde el link en bio')."),
});
// Re-export the type for use in other files.
export type CampaignPlan = z.infer<typeof CampaignPlanSchema>;


const GenerateCampaignPlanInputSchema = z.object({
  campaignTitle: z.string().describe("The title of the marketing campaign idea."),
  campaignChannel: z.string().describe("The marketing channel for the campaign."),
  campaignMessage: z.string().describe("The key message of the campaign."),
  campaignAudience: z.string().describe("The target audience for the campaign."),
});
export type GenerateCampaignPlanInput = z.infer<typeof GenerateCampaignPlanInputSchema>;


export async function generateCampaignPlan(input: GenerateCampaignPlanInput): Promise<CampaignPlan> {
  return generateCampaignPlanFlow(input);
}

const generateCampaignPlanPrompt = ai.definePrompt({
    name: 'generateCampaignPlanPrompt',
    input: { schema: GenerateCampaignPlanInputSchema },
    output: { schema: CampaignPlanSchema },
    prompt: `You are an expert marketing campaign manager. A user has chosen a campaign idea and needs a detailed, actionable plan. Your entire output must be in Spanish.

    **Campaign Idea Details:**
    - **Title:** {{{campaignTitle}}}
    - **Channel:** {{{campaignChannel}}}
    - **Key Message:** {{{campaignMessage}}}
    - **Target Audience:** {{{campaignAudience}}}

    **Your Task:**
    Based on the campaign idea, generate a simple but effective action plan. The plan should be easy to follow for a solo entrepreneur with a limited budget.

    1.  **Strategy:** Write a short paragraph outlining the core strategy.
    2.  **Content Suggestions:** Provide a list of 3-5 concrete content ideas.
    3.  **Actionable Tasks:** Create a checklist of 5-7 clear, simple tasks the user needs to perform to launch this campaign. Start with foundational tasks and move towards execution.
    4.  **KPIs:** List 2-3 simple metrics the user should track to know if the campaign is working.

    Structure your response strictly as a JSON object matching the defined output schema.
    `,
});


const generateCampaignPlanFlow = ai.defineFlow(
  {
    name: 'generateCampaignPlanFlow',
    inputSchema: GenerateCampaignPlanInputSchema,
    outputSchema: CampaignPlanSchema, 
  },
  async (input) => {
    const { output } = await generateCampaignPlanPrompt(input);
    if (!output) {
        throw new Error('Failed to generate a campaign plan.');
    }
    return output;
  }
);
