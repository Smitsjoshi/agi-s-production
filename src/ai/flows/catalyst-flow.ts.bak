'use server';
/**
 * @fileOverview Implements the "Catalyst" flow, an AI for generating personalized learning paths.
 *
 * - catalystFlow - The main flow that generates a structured curriculum for a learning goal.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { CatalystInputSchema, CatalystOutputSchema, type CatalystInput, type CatalystOutput } from '@/lib/types';
import { z } from 'zod';


// Tool to search for external learning resources
const findResourcesTool = ai.defineTool({
    name: 'findLearningResources',
    description: 'Searches the web for high-quality learning resources like articles, videos, or courses for a given topic.',
    inputSchema: z.object({
        topic: z.string().describe('The specific topic to search resources for.'),
        resourceType: z.enum(['Video', 'Article']).describe('The type of resource to find.'),
    }),
    outputSchema: z.object({
        title: z.string(),
        url: z.string().url(),
    }),
}, async ({ topic, resourceType }) => {
    // Mock implementation
    console.log(`Searching for ${resourceType} on ${topic}`);
    const query = encodeURIComponent(`${topic} ${resourceType} tutorial`);
    return {
        title: `A Top-rated ${resourceType} for ${topic}`,
        url: `https://www.google.com/search?q=${query}`,
    }
});


// This prompt orchestrates the entire curriculum generation.
const catalystCurriculumPrompt = ai.definePrompt({
  name: 'catalystCurriculumPrompt',
  input: { schema: CatalystInputSchema },
  output: { schema: CatalystOutputSchema },
  tools: [findResourcesTool],
  prompt: `You are "Catalyst", an expert AI curriculum designer. Your task is to create a comprehensive, structured, and personalized learning path for a user based on their stated goal.

  **User's Goal:**
  {{{goal}}}

  **Instructions:**
  1.  **Deconstruct the Goal:** Break down the user's goal into 3-4 logical, high-level learning **modules**.
  2.  **Flesh out Modules:** For each module:
      a.  Define 2-3 specific **concepts** a beginner must understand.
      b.  For each concept, write a clear and concise **explanation**.
      c.  For each concept, use the \`findLearningResources\` tool to find one relevant **Video** and one **Article**. You must call the tool for each resource.
      d.  Create a simple, practical **project** that allows the user to apply the concepts from that module. Provide a title and a description for the project.
      e.  Generate a 2-question multiple-choice **quiz** to test understanding of the module's concepts. Each question should have 3-4 options, and you must specify the correct answer.
  3.  **Final Output:** Assemble everything into a single JSON object that conforms to the output schema. Generate a creative and motivating 'title' and 'description' for the overall learning path.`,
});

export const catalystFlow = ai.defineFlow(
  {
    name: 'catalystFlow',
    inputSchema: CatalystInputSchema,
    outputSchema: CatalystOutputSchema,
  },
  async (input) => {
    const { output } = await catalystCurriculumPrompt(input);
    if (!output) {
      throw new Error('Catalyst AI failed to generate a learning path.');
    }
    return output;
  }
);
