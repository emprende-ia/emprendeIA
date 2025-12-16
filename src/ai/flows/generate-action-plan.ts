
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a personalized micro-learning path for entrepreneurs.
 * @module ai/flows/generate-action-plan
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateActionPlanInputSchema = z.object({
  giro: z.string().describe('The user\'s business idea or current business description.'),
  etapa: z.string().describe('The current stage of the business (e.g., Idea, Validation, Pre-launch).'),
  objetivo: z.string().describe('The user\'s priority objective for the next 2 weeks.'),
  tiempo_y_formato: z.string().describe('The user\'s daily time availability and preferred learning format.'),
});
export type GenerateActionPlanInput = z.infer<typeof GenerateActionPlanInputSchema>;

const LearningPieceSchema = z.object({
    tipo: z.enum(['infografia', 'video_corto', 'guia_paso_a_paso', 'mini_ebook']),
    titulo: z.string().describe('A clear and attractive title for the micro-learning piece.'),
    objetivo_de_aprendizaje: z.string().describe('A measurable learning objective.'),
    duracion_estimada: z.string().describe('Estimated duration (e.g., "2 min", "8 steps", "8-10 pages").'),
    contenido_clave: z.array(z.string()).describe('Key bullet points of the content.'),
    tarea_del_dia: z.string().describe('A concrete action to perform today.'),
    metricas_de_exito: z.array(z.string()).describe('Simple success metrics for the task.'),
    herramientas_sugeridas: z.array(z.string()).describe('Suggested free tools or templates.'),
    link_placeholder: z.string().url().describe('A placeholder URL for the content.'),
});

const UtelRecommendationSchema = z.object({
    tipo: z.enum(['Licenciatura', 'Curso']),
    nombre: z.string().describe('Name of the UTEL program or course.'),
    por_que_encaja: z.string().describe('A brief explanation of why this program fits the user\'s profile.'),
    link_placeholder: z.string().url().describe('A placeholder URL for the UTEL program.'),
});

const GenerateActionPlanOutputSchema = z.object({
  perfil_usuario: z.object({
    giro: z.string(),
    etapa: z.string(),
    objetivo_prioritario: z.string(),
    tiempo_y_formato: z.string(),
    razonamiento_breve: z.string().describe('A brief explanation of why this learning path was chosen.'),
  }),
  ruta_aprendizaje: z.array(LearningPieceSchema),
  plan_de_14_dias: z.object({
    resumen: z.string().describe('A summary of how to complete the path in ~14 days.'),
    hitos: z.array(z.string()).describe('Key milestones for the 14-day plan.'),
  }),
  recomendaciones_utel: z.array(UtelRecommendationSchema),
});
export type GenerateActionPlanOutput = z.infer<typeof GenerateActionPlanOutputSchema>;


export async function generateActionPlan(input: GenerateActionPlanInput): Promise<GenerateActionPlanOutput> {
  return generateActionPlanFlow(input);
}


const generateActionPlanPrompt = ai.definePrompt({
    name: 'generateActionPlanPrompt',
    input: { schema: GenerateActionPlanInputSchema },
    output: { schema: GenerateActionPlanOutputSchema },
    model: 'googleai/gemini-2.5-flash',
    prompt: `You are a master micro-learning editor for "Emprende IA," an app for entrepreneurs in Mexico. Your mission is to create a hyper-personalized, actionable learning path to help a user achieve their next goal. Use neutral Spanish with occasional Mexican business context.

    **User Profile:**
    - Business/Idea ("giro"): {{{giro}}}
    - Current Stage ("etapa"): {{{etapa}}}
    - Priority Objective ("objetivo"): {{{objetivo}}}
    - Availability & Format ("tiempo_y_formato"): {{{tiempo_y_formato}}}

    **Your Task:**
    1.  **Analyze the Profile:** Quickly understand the user's context.
    2.  **Curate a Learning Path:** Build a sequence of 7-10 micro-content pieces. Prioritize clarity and action.
    3.  **Define Each Piece:** For each piece, specify its type, title, learning goal, duration, key content, a "Task of the Day," success metrics, and suggested tools. Use "https://link_placeholder" for links.
    4.  **Create a 14-Day Plan:** Summarize how the user can complete the path in 14 days, given their availability.
    5.  **Recommend UTEL Programs:** Suggest 1-2 relevant UTEL courses and/or 1 Licenciatura, explaining the fit in 1-2 lines. Use "https://utel_program_link" for links.

    **Internal Curation Rules:**
    - If etapa is Idea/Validation: Focus on problem-solution fit, value proposition, customer interviews, and validation metrics.
    - If etapa is Pre-launch: Focus on brand identity, MVP launch, initial marketing campaigns (reels/shorts), and pricing.
    - If etapa is Operating: Focus on sales funnels, retention, content calendars, and cash flow basics.
    - If objetivo is about Brand Identity: Add a naming guide, a brand tone infographic, and a 30s pitch video script.
    - If time is ≤ 15 min/day: Favor infographics and short videos; use mini-ebooks sparingly.

    **Output Format:**
    Return ONLY a single, strict JSON object matching the defined output schema. Start with { and end with }. Do not add any text before or after the JSON object.
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
    if (!output) {
      throw new Error('The AI model failed to return a valid learning path.');
    }
    // The AI's output is directly compatible with our Zod schema.
    // We pass a copy of the input to populate the 'perfil_usuario' section.
    return {
        ...output,
        perfil_usuario: {
            giro: input.giro,
            etapa: input.etapa,
            objetivo_prioritario: input.objetivo,
            tiempo_y_formato: input.tiempo_y_formato,
            razonamiento_breve: output.perfil_usuario.razonamiento_breve, // Keep the AI's reasoning
        }
    };
  }
);

    
