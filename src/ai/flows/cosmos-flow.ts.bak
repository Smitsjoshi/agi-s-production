'use server';
/**
 * @fileOverview Implements the "Cosmos" flow, an AI for generating fictional universes.
 *
 * - cosmosFlow - The main flow that generates a structured lorebook for a fictional world.
 */

import { ai } from '@/ai/genkit';
// import { googleAI } from '@genkit-ai/google-genai'; // Package missing
import { CosmosInputSchema, CosmosOutputSchema } from '@/lib/types';

export const cosmosFlow = ai.defineFlow(
  {
    name: 'cosmosFlow',
    inputSchema: CosmosInputSchema,
    outputSchema: CosmosOutputSchema,
  },
  async (input) => {
    throw new Error("Cosmos flow is currently disabled due to missing dependencies.");
  }
);
