'use server';
/**
 * @fileOverview Implements the "Synthesis" flow, an AI-powered data analyst.
 *
 * - synthesisFlow - The main flow that analyzes data from a CSV or JSON file and answers user questions.
 */

import { ai } from '@/ai/genkit';
import { SynthesisInputSchema, SynthesisOutputSchema, type SynthesisInput, type SynthesisOutput } from '@/lib/types';
import { z } from 'zod';

const synthesisPrompt = ai.definePrompt({
    name: 'synthesisPrompt',
    input: { schema: SynthesisInputSchema },
    output: { schema: SynthesisOutputSchema },
    prompt: `You are "Synthesis," an expert data analyst AI. Your task is to analyze the provided data and generate a structured response to the user's query.

You can generate three types of content blocks:
1.  'text': For explanations, summaries, and key insights.
2.  'table': To display raw or aggregated data. Provide a title, headers, and rows.
3.  'chart': To visualize data. Provide a title, chartType ('bar', 'line', or 'pie'), and the data in a format suitable for Recharts (an array of objects). The primary key for charts should be 'name'.

User's Query: {{{query}}}

Here is the data (first 5000 characters):
\`\`\`{{{dataType}}}
{{{data}}}
\`\`\`

Analyze the data and provide a comprehensive answer to the user's query using a sequence of the content blocks described above. Be insightful and clear. If creating a chart, ensure the data format is correct.`,
});

export const synthesisFlow = ai.defineFlow(
  {
    name: 'synthesisFlow',
    inputSchema: SynthesisInputSchema,
    outputSchema: SynthesisOutputSchema,
  },
  async (input) => {
    // Truncate data for the prompt to avoid exceeding token limits
    const truncatedData = input.data.substring(0, 5000);
    const promptInput = { ...input, data: truncatedData };
    
    const { output } = await synthesisPrompt(promptInput);

    if (!output) {
      throw new Error('Synthesis AI failed to generate an analysis.');
    }

    return output;
  }
);
