
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating marketing campaign ideas.
 * @module ai/flows/generate-marketing-campaign
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateMarketingCampaignInputSchema = z.object({
  productDescription: z.string().describe('A description of the product or service to market.'),
});
export type GenerateMarketingCampaignInput = z.infer<typeof GenerateMarketingCampaignInputSchema>;

const CampaignIdeaSchema = z.object({
    title: z.string().describe('A catchy title for the campaign idea.'),
    channel: z.string().describe('The recommended marketing channel (e.g., Instagram, Email Marketing, Google Ads).'),
    keyMessage: z.string().describe('The core message of the campaign.'),
    targetAudience: z.string().describe('The specific audience this campaign should target.'),
});

const GenerateMarketingCampaignOutputSchema = z.object({
  campaigns: z.array(CampaignIdeaSchema).describe('A list of 2-3 distinct marketing campaign ideas.'),
});
export type GenerateMarketingCampaignOutput = z.infer<typeof GenerateMarketingCampaignOutputSchema>;

export async function generateMarketingCampaign(input: GenerateMarketingCampaignInput): Promise<GenerateMarketingCampaignOutput> {
  return generateMarketingCampaignFlow(input);
}

const generateMarketingCampaignPrompt = ai.definePrompt({
    name: 'generateMarketingCampaignPrompt',
    input: { schema: GenerateMarketingCampaignInputSchema },
    output: { schema: GenerateMarketingCampaignOutputSchema },
    prompt: `You are a creative marketing strategist. A user needs help generating marketing campaign ideas for their product. Your entire output must be in Spanish.

    **Product/Service Description:** {{{productDescription}}}

    Your task is to generate 2-3 distinct and actionable marketing campaign ideas. For each idea, provide:
    1.  A catchy title.
    2.  The best channel to run the campaign on.
    3.  The key message to communicate.
    4.  The target audience.

    Structure your response as a JSON object with a 'campaigns' array.
    `,
});


const generateMarketingCampaignFlow = ai.defineFlow(
  {
    name: 'generateMarketingCampaignFlow',
    inputSchema: GenerateMarketingCampaignInputSchema,
    outputSchema: GenerateMarketingCampaignOutputSchema,
  },
  async (input) => {
    const { output } = await generateMarketingCampaignPrompt(input);
    return output!;
  }
);
