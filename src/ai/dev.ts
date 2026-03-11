'use server';
/**
 * @fileOverview Registro de flujos de IA activos en EmprendeIA.
 */
import { config } from 'dotenv';
config();

// Flujos de Negocio y Análisis
import '@/ai/flows/analyze-business-idea.ts';
import '@/ai/flows/analyze-existing-business.ts';
import '@/ai/flows/analyze-breakeven-point.ts';

// Flujos de Identidad y Branding
import '@/ai/flows/generate-digital-identity.ts';
import '@/ai/flows/generate-logo-from-prompt.ts';
import '@/ai/flows/regenerate-brand-elements.ts';

// Flujos de Marketing
import '@/ai/flows/generate-marketing-campaign.ts';
import '@/ai/flows/generate-campaign-plan.ts';

// Flujos de Aprendizaje y Recursos
import '@/ai/flows/generate-action-plan.ts';
import '@/ai/flows/generate-resource-plan.ts';
import '@/ai/flows/suggest-relevant-suppliers.ts';

// Flujos de Audio (TTS)
import '@/ai/flows/generate-module-audio.ts';
import '@/ai/flows/generate-task-audio.ts';
import '@/ai/flows/generate-campaign-task-audio.ts';
