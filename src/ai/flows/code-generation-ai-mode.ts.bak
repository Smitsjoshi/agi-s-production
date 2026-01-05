'use server';

/**
 * @fileOverview A code generation AI agent that synthesizes HTML/Tailwind components.
 *
 * - generateComponent - A function that handles the component generation process.
 * - GenerateComponentInput - The input type for the generateComponent function.
 * - GenerateComponentOutput - The return type for the generateComponent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateComponentInputSchema = z.object({
  description: z.string().describe('A description of the desired HTML/Tailwind component.'),
});
export type GenerateComponentInput = z.infer<typeof GenerateComponentInputSchema>;

const GenerateComponentOutputSchema = z.object({
  componentCode: z.string().describe('The complete, runnable HTML/Tailwind component code.'),
  reasoning: z.string().describe('The reasoning behind the generated code.'),
  sources: z.array(z.string()).describe('The sources used to generate the code.'),
});
export type GenerateComponentOutput = z.infer<typeof GenerateComponentOutputSchema>;

export async function generateComponent(input: GenerateComponentInput): Promise<GenerateComponentOutput> {
  return generateComponentFlow(input);
}

const webSearchTool = ai.defineTool({
  name: 'webSearch',
  description: 'Search the web for code examples related to the desired component.',
  inputSchema: z.object({
    query: z.string().describe('The search query to use.'),
  }),
  outputSchema: z.string(),
},
async (input) => {
  // Mock implementation of web search.  Replace with actual Tavily API call in real implementation
  return `Search results for ${input.query}:  <div>Example code</div>`;
}
);

const prompt = ai.definePrompt({
  name: 'generateComponentPrompt',
  input: {schema: GenerateComponentInputSchema},
  output: {schema: GenerateComponentOutputSchema},
  tools: [webSearchTool],
  prompt: `You are an expert front-end developer specializing in HTML and Tailwind CSS.

You will generate a complete, runnable HTML/Tailwind component based on the user's description.

First, use the webSearch tool to find relevant code examples online. Be specific in your search query.

Then, synthesize the code, reasoning, and sources into the output.

Description: {{{description}}}
`,
});

const generateComponentFlow = ai.defineFlow(
  {
    name: 'generateComponentFlow',
    inputSchema: GenerateComponentInputSchema,
    outputSchema: GenerateComponentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
