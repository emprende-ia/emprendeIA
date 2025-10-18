'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a step-by-step action plan for a business idea.
 * @module ai/flows/generate-action-plan
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateActionPlanInputSchema = z.object({
  businessIdea: z.string().describe('The user\'s business idea.'),
});
export type GenerateActionPlanInput = z.infer<typeof GenerateActionPlanInputSchema>;

const ActionStepSchema = z.object({
    step: z.number().describe('The step number.'),
    title: z.string().describe('A short, clear title for the step.'),
    description: z.string().describe('A detailed description of the actions to take in this step.'),
});

const GenerateActionPlanOutputSchema = z.object({
  plan: z.array(ActionStepSchema).describe('A list of detailed steps to bring the business idea to life.'),
});
export type GenerateActionPlanOutput = z.infer<typeof GenerateActionPlanOutputSchema>;

export async function generateActionPlan(input: GenerateActionPlanInput): Promise<GenerateActionPlanOutput> {
  return generateActionPlanFlow(input);
}

const generateActionPlanPrompt = ai.definePrompt({
    name: 'generateActionPlanPrompt',
    input: { schema: GenerateActionPlanInputSchema },
    output: { schema: GenerateActionPlanOutputSchema },
    prompt: `You are an expert business consultant from Silicon Valley, specialized in launching successful startups. Your entire output must be in Spanish.

    A user has a business idea and needs a clear, actionable, step-by-step guide to get started.

    **Business Idea:** {{{businessIdea}}}

    Your task is to generate a comprehensive action plan with 5 to 7 logical steps. For each step, provide:
    1.  A short, clear title.
    2.  A detailed description of what to do in that phase, offering practical advice and examples.

    Structure your response as a JSON object with a 'plan' array, where each object in the array represents a step and contains 'step', 'title', and 'description'.
    `,
});


const generateActionPlanFlow = ai.defineFlow(
  {
    name: 'generateActionPlanFlow',
    inputSchema: GenerateActionPlanInputSchema,
    outputSchema: GenerateActionPlanOutputSchema,
  },
  async (input) => {
    const { output } = await generateActionPlanPrompt(input);
    return output!;
  }
);
