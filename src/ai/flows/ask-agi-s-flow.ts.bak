import { ai } from '../genkit';
import { z } from 'zod';

export const askAgiS = ai.defineFlow(
  {
    name: 'askAgiS',
    inputSchema: z.object({ prompt: z.string() }),
    outputSchema: z.object({ response: z.string() }),
  },
  async ({ prompt }) => {
    const result = await ai.generate({
      prompt,
      model: 'ollama/llama3.2',
      config: {
        temperature: 0.7,
      },
    });

    return { response: result.text };
  }
);
