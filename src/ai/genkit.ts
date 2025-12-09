import { genkit, z } from 'genkit';
import { openAI } from 'genkitx-openai';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

export const ai = genkit({
  plugins: [
    openAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
      models: [{
        name: 'llama-3.3-70b-versatile',
        info: {
          label: 'Llama 3.3 70B Versatile',
          versions: ['llama-3.3-70b-versatile'],
          supports: {
            multiturn: true,
            tools: true,
            media: false,
            systemRole: true,
            output: ['text', 'json'],
          },
        },
        configSchema: z.object({
          temperature: z.number().optional(),
        }),
      }],
    }),
  ],
  model: 'openai/llama-3.3-70b-versatile', // Using Groq's Llama 3.3 70B
});
