
'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing the break-even point for a business.
 * @module ai/flows/analyze-breakeven-point
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const TransactionSchema = z.object({
    description: z.string(),
    amount: z.number(),
    type: z.enum(['income', 'expense']),
    category: z.string(),
    timestamp: z.string().datetime(),
});

const AnalyzeBreakevenPointInputSchema = z.object({
  transactions: z.array(TransactionSchema).describe('A list of all financial transactions (income and expenses).'),
  averageSalePrice: z.number().positive().describe('The average price of a single product or service unit sold.'),
});
export type AnalyzeBreakevenPointInput = z.infer<typeof AnalyzeBreakevenPointInputSchema>;

const AnalyzeBreakevenPointOutputSchema = z.object({
  breakEvenUnits: z.number().describe('The number of units the business needs to sell to break even.'),
  breakEvenRevenue: z.number().describe('The total revenue required to break even.'),
  analysis: z.string().describe('A qualitative analysis of the break-even point with recommendations.'),
  identifiedFixedCosts: z.number().describe('Total fixed costs identified from transactions.'),
  identifiedVariableCostsPerUnit: z.number().describe('Calculated variable cost per unit.'),
});
export type AnalyzeBreakevenPointOutput = z.infer<typeof AnalyzeBreakevenPointOutputSchema>;

export async function analyzeBreakevenPoint(input: AnalyzeBreakevenPointInput): Promise<AnalyzeBreakevenPointOutput> {
  return analyzeBreakevenPointFlow(input);
}

const analyzeBreakevenPointPrompt = ai.definePrompt({
    name: 'analyzeBreakevenPointPrompt',
    input: { schema: AnalyzeBreakevenPointInputSchema },
    output: { schema: AnalyzeBreakevenPointOutputSchema },
    prompt: `You are an expert financial analyst for startups. Your task is to calculate the break-even point based on a list of transactions and an average sale price. Your entire output must be in Spanish.

    **Business Data:**
    - **Transactions:** A JSON array of transactions is provided. Analyze each transaction to classify it.
    - **Average Sale Price per Unit:** {{{averageSalePrice}}}

    **Your Task:**
    1.  **Identify Costs:** Go through all 'expense' transactions. Classify them as either 'Fixed Costs' or 'Variable Costs'.
        - **Fixed Costs** are expenses that don't change with the number of sales (e.g., 'Renta', 'Sueldos', 'Servicios (luz, agua, internet)'). Sum them up to get the Total Fixed Costs.
        - **Variable Costs** are expenses that are directly tied to producing one unit of a product/service (e.g., 'Inventario/Materiales'). Sum them up to get the Total Variable Costs.

    2.  **Calculate Costs per Unit:**
        - Identify the total number of units sold from 'income' transactions, assuming each income corresponds to a number of units sold at the average price. If there are no income transactions, assume 1 unit to avoid division by zero.
        - Calculate the Variable Cost Per Unit by dividing Total Variable Costs by the total number of units sold.

    3.  **Calculate Break-Even Point:**
        - Use the formula: Break-Even Point (in units) = Total Fixed Costs / (Average Sale Price per Unit - Variable Cost Per Unit).
        - Calculate Break-Even Point (in revenue) = Break-Even Point (in units) * Average Sale Price per Unit.

    4.  **Provide Analysis:** Write a brief, clear analysis. Explain what the break-even point means in simple terms and provide 1-2 actionable recommendations. For example, "Necesitas vender X unidades al mes para cubrir tus costos. Para mejorar, podrías intentar reducir tus costos de materiales o aumentar ligeramente tu precio."

    Structure your response strictly as a JSON object matching the defined output schema. Ensure all numeric fields are numbers, not strings.
    `,
});


const analyzeBreakevenPointFlow = ai.defineFlow(
  {
    name: 'analyzeBreakevenPointFlow',
    inputSchema: AnalyzeBreakevenPointInputSchema,
    outputSchema: AnalyzeBreakevenPointOutputSchema,
  },
  async (input) => {
    const { output } = await analyzeBreakevenPointPrompt(input);
    if (!output) {
      throw new Error("The AI model failed to return a valid break-even analysis.");
    }
    return output;
  }
);
