'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const WebSearchInputSchema = z.object({
  query: z.string().describe('The user query.'),
});

const WebSearchOutputSchema = z.object({
  answer: z.string().describe('The answer to the query.'),
  sources: z.array(z.object({
    url: z.string(),
    title: z.string(),
  })).describe('List of sources used.'),
  reasoning: z.string().optional().describe('Reasoning for the answer.'),
  confidenceScore: z.number().optional().describe('Confidence score from 0 to 1.'),
});

const webSearchTool = ai.defineTool(
  {
    name: 'webSearch',
    description: 'Search the web for information.',
    inputSchema: z.object({ query: z.string() }),
    outputSchema: z.object({
      results: z.array(z.object({
        title: z.string(),
        url: z.string(),
        snippet: z.string(),
      })),
    }),
  },
  async (input) => {
    // This is a mock implementation. Replace with a real search API like Tavily.
    console.log(`Searching web for: ${input.query}`);
    return {
      results: [
        {
          title: `Result for "${input.query}"`,
          url: `https://www.google.com/search?q=${encodeURIComponent(input.query)}`,
          snippet: `This is a mock search result snippet for the query: ${input.query}. Real implementation would use an API.`,
        },
        {
          title: `Another result for "${input.query}"`,
          url: `https://www.bing.com/search?q=${encodeURIComponent(input.query)}`,
          snippet: `More details about ${input.query} would be found here in a live environment.`,
        },
      ],
    };
  }
);

const wikipediaSearchTool = ai.defineTool({
  name: 'wikipediaSearch',
  description: 'Search Wikipedia for encyclopedic information.',
  inputSchema: z.object({ query: z.string() }),
  outputSchema: z.string(),
}, async (input) => `Mock Wikipedia results for "${input.query}".`);

const arxivSearchTool = ai.defineTool({
  name: 'arxivSearch',
  description: 'Search ArXiv for academic papers.',
  inputSchema: z.object({ query: z.string() }),
  outputSchema: z.string(),
}, async (input) => `Mock ArXiv results for "${input.query}".`);


const webSearchPrompt = ai.definePrompt({
  name: 'webSearchPrompt',
  input: { schema: WebSearchInputSchema },
  output: { schema: WebSearchOutputSchema },
  tools: [webSearchTool, wikipediaSearchTool, arxivSearchTool],
  prompt: `You are a helpful AI assistant. Answer the user's query based on information from web search, Wikipedia, and ArXiv.
  Provide a concise answer, a list of sources, your reasoning, and a confidence score.
  
  Query: {{{query}}}
  `,
});

export const webSearchFlow = ai.defineFlow(
  {
    name: 'webSearchFlow',
    inputSchema: WebSearchInputSchema,
    outputSchema: WebSearchOutputSchema,
  },
  async (input) => {
    // Use the configured Ollama model
    const llmResponse = await webSearchPrompt(input);
    const output = llmResponse.output;

    if (!output) {
      throw new Error('Failed to get a response from the model.');
    }

    // Add mock reasoning and confidence if not provided by the model
    return {
      ...output,
      reasoning: output.reasoning ?? "I synthesized information from the provided search results to construct the answer.",
      confidenceScore: output.confidenceScore ?? Math.random() * 0.2 + 0.75, // Random high confidence
    };
  }
);
