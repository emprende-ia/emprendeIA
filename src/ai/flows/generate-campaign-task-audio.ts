
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating an audio explanation for a marketing campaign task.
 * @module ai/flows/generate-campaign-task-audio
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/google-genai';
import wav from 'wav';

const GenerateCampaignTaskAudioInputSchema = z.object({
  campaignTitle: z.string().describe('The title of the marketing campaign.'),
  campaignChannel: z.string().describe('The marketing channel for the campaign.'),
  campaignMessage: z.string().describe('The key message of the campaign.'),
  taskToExplain: z.string().describe('The specific task that needs an audio explanation.'),
});
export type GenerateCampaignTaskAudioInput = z.infer<typeof GenerateCampaignTaskAudioInputSchema>;

const GenerateCampaignTaskAudioOutputSchema = z.object({
  audioUrl: z.string().url().describe('The data URI of the generated WAV audio.'),
});
export type GenerateCampaignTaskAudioOutput = z.infer<typeof GenerateCampaignTaskAudioOutputSchema>;

export async function generateCampaignTaskAudio(input: GenerateCampaignTaskAudioInput): Promise<GenerateCampaignTaskAudioOutput> {
  return generateCampaignTaskAudioFlow(input);
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

const generateCampaignTaskAudioFlow = ai.defineFlow(
  {
    name: 'generateCampaignTaskAudioFlow',
    inputSchema: GenerateCampaignTaskAudioInputSchema,
    outputSchema: GenerateCampaignTaskAudioOutputSchema,
  },
  async (input) => {
    // Step 1: Generate a friendly, expert script from the task details.
    const scriptPrompt = `
      You are an expert marketing coach speaking to an entrepreneur. Your tone is encouraging, clear, and action-oriented.
      Your task is to create a short audio script (around 150 words) to help the user understand and complete a specific marketing task.
      Your entire output must be the script itself, in Spanish.

      The user is working on the campaign "${input.campaignTitle}" on the channel "${input.campaignChannel}". The key message is "${input.campaignMessage}".
      
      The specific task they need help with is: "${input.taskToExplain}"

      Explain what this task means in simple terms, why it's important for their campaign, and give them a concrete tip to get started.
      Example structure: "¡Hola! Esta tarea es clave para tu campaña. Se trata de... Es importante porque te ayudará a... Un buen primer paso es... ¡Vamos con todo!"
    `;

    const { text: script } = await ai.generate({
      prompt: scriptPrompt,
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
                    prebuiltVoiceConfig: { voiceName: 'Algenib' },
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
