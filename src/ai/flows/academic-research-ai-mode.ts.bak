'use server';

/**
 * @fileOverview Implements the Academic Research AI mode flow, which searches Wikipedia, ArXiv, and PubMed
 *  and provides a response including hardcoded safety disclaimers for sensitive topics like health and law.
 *
 * - academicResearch - A function that handles the academic research process.
 * - AcademicResearchInput - The input type for the academicResearch function.
 * - AcademicResearchOutput - The return type for the academicResearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AcademicResearchInputSchema = z.object({
  query: z.string().describe('The academic research query.'),
});
export type AcademicResearchInput = z.infer<typeof AcademicResearchInputSchema>;

const AcademicResearchOutputSchema = z.object({
  answer: z.string().describe('The answer to the academic research query.'),
  sources: z.array(z.string()).describe('The sources used to generate the answer.'),
  reasoning: z.string().describe('The reasoning behind the answer.'),
  confidenceScore: z.number().describe('The confidence score of the answer.'),
});
export type AcademicResearchOutput = z.infer<typeof AcademicResearchOutputSchema>;

export async function academicResearch(input: AcademicResearchInput): Promise<AcademicResearchOutput> {
  return academicResearchFlow(input);
}

const webSearchTool = ai.defineTool({
  name: 'webSearch',
  description: 'Useful for searching the web for information.',
  inputSchema: z.object({
    query: z.string().describe('The query to search for.'),
  }),
  outputSchema: z.string(),
},
async (input) => {
  // Replace this with actual web search implementation
  return `Web search results for: ${input.query}`;
});

const wikipediaSearchTool = ai.defineTool({
  name: 'wikipediaSearch',
  description: 'Useful for searching Wikipedia for information.',
  inputSchema: z.object({
    query: z.string().describe('The query to search for on Wikipedia.'),
  }),
  outputSchema: z.string(),
},
async (input) => {
  // Replace this with actual Wikipedia search implementation
  return `Wikipedia search results for: ${input.query}`;
});

const arxivSearchTool = ai.defineTool({
  name: 'arxivSearch',
  description: 'Useful for searching ArXiv for academic papers.',
  inputSchema: z.object({
    query: z.string().describe('The query to search for on ArXiv.'),
  }),
  outputSchema: z.string(),
},
async (input) => {
  // Replace this with actual ArXiv search implementation
  return `ArXiv search results for: ${input.query}`;
});

const pubmedSearchTool = ai.defineTool({
  name: 'pubmedSearch',
  description: 'Useful for searching PubMed for medical research papers.',
  inputSchema: z.object({
    query: z.string().describe('The query to search for on PubMed.'),
  }),
  outputSchema: z.string(),
},
async (input) => {
  // Replace this with actual PubMed search implementation
  return `PubMed search results for: ${input.query}`;
});

const prompt = ai.definePrompt({
  name: 'academicResearchPrompt',
  input: {schema: AcademicResearchInputSchema},
  output: {schema: AcademicResearchOutputSchema},
  tools: [webSearchTool, wikipediaSearchTool, arxivSearchTool, pubmedSearchTool],
  prompt: `You are an AI assistant that provides answers based on academic research.

  Answer the following query: {{query}}

  Include relevant sources used to generate the answer.

  Explain the reasoning behind the answer.

  Provide a confidence score (0-1) for the answer.

  If the query is related to health or law, include the following safety disclaimers:
  "This information is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare provider for any questions you may have regarding a medical condition."
  "This information is for educational purposes only and does not constitute legal advice. Consult with a qualified legal professional for advice on any legal issue."`,
});

const academicResearchFlow = ai.defineFlow(
  {
    name: 'academicResearchFlow',
    inputSchema: AcademicResearchInputSchema,
    outputSchema: AcademicResearchOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
