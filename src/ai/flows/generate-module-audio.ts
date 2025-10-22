
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating an audio explanation from text.
 * It's a reusable utility for creating audio introductions or help snippets.
 * @module ai/flows/generate-module-audio
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/google-genai';
import wav from 'wav';

const GenerateModuleAudioInputSchema = z.object({
  textToSpeak: z.string().min(10, { message: 'El texto debe tener al menos 10 caracteres.' }).describe('The text to be converted into speech.'),
});
export type GenerateModuleAudioInput = z.infer<typeof GenerateModuleAudioInputSchema>;

const GenerateModuleAudioOutputSchema = z.object({
  audioUrl: z.string().url().describe('The data URI of the generated WAV audio.'),
});
export type GenerateModuleAudioOutput = z.infer<typeof GenerateModuleAudioOutputSchema>;

export async function generateModuleAudio(input: GenerateModuleAudioInput): Promise<GenerateModuleAudioOutput> {
  return generateModuleAudioFlow(input);
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

const generateModuleAudioFlow = ai.defineFlow(
  {
    name: 'generateModuleAudioFlow',
    inputSchema: GenerateModuleAudioInputSchema,
    outputSchema: GenerateModuleAudioOutputSchema,
  },
  async ({ textToSpeak }) => {
    
    // Step 1: Convert the provided text into speech using a professional female voice.
    const { media } = await ai.generate({
        model: googleAI.model('gemini-2.5-flash-preview-tts'),
        prompt: textToSpeak,
        config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'vindemiatrix' }, // A professional and clear female voice
                },
            },
        },
    });

    if (!media?.url) {
        throw new Error("Audio generation failed, no media was returned.");
    }
    
    // Step 2: The TTS model returns raw PCM data in a data URI. We need to convert it to WAV.
    const pcmData = Buffer.from(media.url.substring(media.url.indexOf(',') + 1), 'base64');
    const wavData = await toWav(pcmData);

    return {
      audioUrl: `data:audio/wav;base64,${wavData}`,
    };
  }
);
