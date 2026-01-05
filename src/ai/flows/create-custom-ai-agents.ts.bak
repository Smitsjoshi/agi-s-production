'use server';

/**
 * @fileOverview A flow for creating custom AI agents with a defined persona, name, and knowledge base URLs.
 *
 * - createCustomAgent - A function that handles the creation of a custom AI agent.
 * - CreateCustomAgentInput - The input type for the createCustomAgent function.
 * - CreateCustomAgentOutput - The return type for the createCustomAgent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreateCustomAgentInputSchema = z.object({
  name: z.string().describe('The name of the custom agent.'),
  persona: z.string().describe('A detailed description of the agent\'s persona.'),
  knowledgeBaseUrls: z
    .array(z.string())
    .describe('A list of specific website URLs for the agent\'s knowledge base.'),
});
export type CreateCustomAgentInput = z.infer<typeof CreateCustomAgentInputSchema>;

const CreateCustomAgentOutputSchema = z.object({
  agentId: z.string().describe('A unique identifier for the created agent.'),
  message: z.string().describe('Confirmation message that the agent has been created.'),
});
export type CreateCustomAgentOutput = z.infer<typeof CreateCustomAgentOutputSchema>;

export async function createCustomAgent(input: CreateCustomAgentInput): Promise<CreateCustomAgentOutput> {
  return createCustomAgentFlow(input);
}

const createCustomAgentPrompt = ai.definePrompt({
  name: 'createCustomAgentPrompt',
  input: {schema: CreateCustomAgentInputSchema},
  output: {schema: CreateCustomAgentOutputSchema},
  prompt: `You are creating a new custom AI agent.

  Agent Name: {{{name}}}
  Agent Persona: {{{persona}}}
  Knowledge Base URLs: {{#each knowledgeBaseUrls}}{{{this}}} {{/each}}

  Create a unique identifier (agentId) for this agent and return a confirmation message.
  Be sure to include all provided input in the output.
  `,
});

const createCustomAgentFlow = ai.defineFlow(
  {
    name: 'createCustomAgentFlow',
    inputSchema: CreateCustomAgentInputSchema,
    outputSchema: CreateCustomAgentOutputSchema,
  },
  async input => {
    const {output} = await createCustomAgentPrompt(input);
    return output!;
  }
);
