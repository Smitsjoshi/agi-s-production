'use server';
/**
 * @fileOverview Implements the "Crucible" flow, an AI Red Team for strategy simulation.
 *
 * - crucibleFlow - The main flow that critiques a user's plan from multiple adversary perspectives.
 */

import { ai } from '@/ai/genkit';
import { CrucibleInputSchema, CrucibleOutputSchema, type CrucibleInput, type CrucibleOutput } from '@/lib/types';
import { ADVERSARY_PERSONAS } from '@/lib/personas';
import { z } from 'zod';


const cruciblePrompt = ai.definePrompt({
    name: 'cruciblePrompt',
    input: { schema: CrucibleInputSchema.extend({ personaDescriptions: z.string() }) },
    output: { schema: CrucibleOutputSchema },
    prompt: `You are "Crucible," a master strategist AI that runs Red Team simulations to pressure-test ideas.

Your task is to analyze the user's plan and critique it from the perspectives of several chosen adversaries. Be critical, insightful, and constructive. Uncover hidden risks, flawed assumptions, and potential blind spots.

**User's Plan:**
{{{plan}}}

**Adversary Personas to Simulate:**
{{{personaDescriptions}}}

First, generate a high-level **executiveSummary** that synthesizes the most critical risks from all perspectives.

Then, for each persona, generate a detailed **critique** object containing:
1.  **personaName**: The name of the adversary.
2.  **keyConcerns**: A list of 2-3 short, hard-hitting bullet points.
3.  **analysis**: A detailed paragraph explaining the persona's reasoning, focusing on the specific vulnerabilities they would exploit or the core flaws they see.

Structure your entire response as a single JSON object conforming to the output schema.`,
});

export const crucibleFlow = ai.defineFlow(
  {
    name: 'crucibleFlow',
    inputSchema: CrucibleInputSchema,
    outputSchema: CrucibleOutputSchema,
  },
  async (input) => {
    // Get full persona details from their IDs
    const selectedPersonas = ADVERSARY_PERSONAS.filter(p => input.personas.includes(p.id));
    const personaDescriptions = selectedPersonas.map(p => `- ${p.name}: ${p.description}`).join('\n');

    const promptInput = {
        ...input,
        personaDescriptions,
    };

    const { output } = await cruciblePrompt(promptInput);

    if (!output) {
        throw new Error('Crucible AI failed to generate a critique.');
    }

    return output;
  }
);
