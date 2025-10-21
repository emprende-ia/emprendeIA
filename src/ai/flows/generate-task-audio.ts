'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating an audio explanation for a learning task.
 * @module ai/flows/generate-task-audio
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/googleai';
import wav from 'wav';

const GenerateTaskAudioInputSchema = z.object({
  taskTitle: z.string().describe('The title of the learning task.'),
  taskObjective: z.string().describe('The learning objective for the task.'),
  taskContent: z.string().describe('The key content points of the task.'),
  taskAction: z.string().describe('The specific action or "tarea del día" for the user.'),
});
export type GenerateTaskAudioInput = z.infer<typeof GenerateTaskAudioInputSchema>;

const GenerateTaskAudioOutputSchema = z.object({
  audioUrl: z.string().url().describe('The data URI of the generated WAV audio.'),
});
export type GenerateTaskAudioOutput = z.infer<typeof GenerateTaskAudioOutputSchema>;

export async function generateTaskAudio(input: GenerateTaskAudioInput): Promise<GenerateTaskAudioOutput> {
  return generateTaskAudioFlow(input);
}

// This helper function converts PCM audio data from the TTS model to a WAV file format,
// which is necessary for playback in most web browsers.
async function toWav(pcmData: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
        const writer = new wav.Writer({
            channels: 1,
            sampleRate: 24000, // Gemini TTS model's output sample rate
            bitDepth: 16,
        });

        const buffers: Buffer[] = [];
        writer.on('data', (chunk) => buffers.push(chunk));
        writer.on('end', () => resolve(Buffer.concat(buffers).toString('base64')));
        writer.on('error', reject);

        writer.write(pcmData);
        writer.end();
    });
}

const generateTaskAudioFlow = ai.defineFlow(
  {
    name: 'generateTaskAudioFlow',
    inputSchema: GenerateTaskAudioInputSchema,
    outputSchema: GenerateTaskAudioOutputSchema,
  },
  async (input) => {
    // Step 1: Generate a friendly, expert script from the task details.
    const scriptPrompt = `
      You are an expert business coach, speaking to an entrepreneur. Your tone is encouraging, clear, and practical.
      Your task is to create a short audio script (around 150-200 words) to help the user complete a specific task.
      Do not use technical jargon. Explain things as you would to a smart friend.
      Your entire output must be the script itself, in Spanish.

      The user needs help with the following task:
      - Título: ${input.taskTitle}
      - Objetivo: ${input.taskObjective}
      - Contenido Clave: ${input.taskContent}
      - Acción a realizar: ${input.taskAction}

      Start by encouraging them, then clearly explain what they need to do and why it's important, focusing on the action.
      Example structure: "¡Hola! No te preocupes, esta tarea es más sencilla de lo que parece y es clave para... Para empezar, enfócate en... Esto te ayudará a... Recuerda, lo importante es dar el primer paso. ¡Mucho éxito!"
    `;

    const { text: script } = await ai.generate({
      prompt: scriptPrompt,
      model: 'googleai/gemini-2.5-flash',
    });

    if (!script) {
        throw new Error('Failed to generate audio script.');
    }

    // Step 2: Convert the generated script into speech.
    const { media } = await ai.generate({
        model: googleAI.model('gemini-2.5-flash-preview-tts'),
        prompt: script,
        config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Algenib' }, // A pleasant, professional voice
                },
            },
        },
    });

    if (!media?.url) {
        throw new Error("Audio generation failed, no media was returned.");
    }
    
    // The TTS model returns raw PCM data in a data URI. We need to convert it to WAV.
    const pcmData = Buffer.from(media.url.substring(media.url.indexOf(',') + 1), 'base64');
    const wavData = await toWav(pcmData);

    return {
      audioUrl: `data:audio/wav;base64,${wavData}`,
    };
  }
);
