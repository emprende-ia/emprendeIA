
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI({
      // Explicitly pass the API key from environment variables
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
      // Specify the API version.
      apiVersion: 'v1beta',
    }),
  ],
});
