
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a detailed action plan for a marketing campaign.
 * @module ai/flows/generate-campaign-plan
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { CampaignPlanSchema, type CampaignPlan } from '@/lib/firestore/marketing-campaigns';

const GenerateCampaignPlanInputSchema = z.object({
  campaignTitle: z.string().describe("The title of the marketing campaign idea."),
  campaignChannel: z.string().describe("The marketing channel for the campaign."),
  campaignMessage: z.string().describe("The key message of the campaign."),
  campaignAudience: z.string().describe("The target audience for the campaign."),
});
export type GenerateCampaignPlanInput = z.infer<typeof GenerateCampaignPlanInputSchema>;


export type CampaignPlanOutput = z.infer<typeof CampaignPlanSchema>;

export async function generateCampaignPlan(input: GenerateCampaignPlanInput): Promise<CampaignPlanOutput> {
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
