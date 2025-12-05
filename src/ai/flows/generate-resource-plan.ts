
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a resource plan and estimated budget for a business idea.
 * @module ai/flows/generate-resource-plan
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateResourcePlanInputSchema = z.object({
  businessDescription: z.string().describe('A description of the business and its required resources.'),
  existingSupplies: z.string().optional().describe('A comma-separated list of supplies the user already owns.'),
});
export type GenerateResourcePlanInput = z.infer<typeof GenerateResourcePlanInputSchema>;

const BudgetItemSchema = z.object({
    category: z.string().describe('The category of the expense (e.g., "Marketing", "Equipo", "Legales").'),
    item: z.string().describe('The specific budget item.'),
    estimatedCost: z.string().describe('A string representing the estimated cost, can be a range (e.g., "$10,000 - $20,000 MXN").'),
    justification: z.string().describe('A brief justification for why this expense is necessary.'),
});

const GenerateResourcePlanOutputSchema = z.object({
  budgetItems: z.array(BudgetItemSchema).describe('A list of estimated budget items.'),
  totalEstimatedCost: z.string().describe('A summary of the total estimated cost range.'),
  summary: z.string().describe('A brief summary with financial recommendations.'),
});
export type GenerateResourcePlanOutput = z.infer<typeof GenerateResourcePlanOutputSchema>;

export async function generateResourcePlan(input: GenerateResourcePlanInput): Promise<GenerateResourcePlanOutput> {
  return generateResourcePlanFlow(input);
}

const generateResourcePlanPrompt = ai.definePrompt({
    name: 'generateResourcePlanPrompt',
    input: { schema: GenerateResourcePlanInputSchema },
    output: { schema: GenerateResourcePlanOutputSchema },
    model: 'googleai/gemini-2.5-flash',
    prompt: `You are a startup financial advisor. Your task is to create an estimated budget for a new business based on the user's description. Your entire output must be in Spanish.

    **Business Description:** {{{businessDescription}}}
    {{#if existingSupplies}}
    **Existing Supplies (to be excluded from budget):** {{{existingSupplies}}}
    {{/if}}

    Based on this description, generate a list of key budget items required to launch and operate the business for the first 3-6 months. For each item, provide:
    1.  **Category:** A logical grouping (e.g., "Equipo y Software", "Marketing y Ventas", "Costos Operativos", "Gastos Legales").
    2.  **Item:** The specific resource or expense.
    3.  **Estimated Cost:** A realistic cost range in Mexican Pesos (MXN) (e.g., "$10,000 - $25,000 MXN").
    4.  **Justification:** A short explanation of why this is important.

    **CRITICAL:** If the user has provided a list of 'Existing Supplies', you MUST OMIT those items from the 'budgetItems' list. Mention in the final 'summary' that you have excluded the items the user already owns.

    After listing the items, provide a **totalEstimatedCost** summary and a brief **summary** with your main recommendations.

    Structure your response as a JSON object with 'budgetItems', 'totalEstimatedCost', and 'summary'.
    `,
});


const generateResourcePlanFlow = ai.defineFlow(
  {
    name: 'generateResourcePlanFlow',
    inputSchema: GenerateResourcePlanInputSchema,
    outputSchema: GenerateResourcePlanOutputSchema,
  },
  async (input) => {
    const { output } = await generateResourcePlanPrompt(input);
    return output!;
  }
);
