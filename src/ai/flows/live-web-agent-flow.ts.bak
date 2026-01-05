'use server';
/**
 * @fileOverview A live, autonomous web agent that uses a real browser to accomplish goals.
 *
 * - liveWebAgentFlow - The main flow that uses Puppeteer to navigate websites and extract information.
 * - LiveWebAgentInput - The input type for the liveWebAgentFlow function.
 * - LiveWebAgentOutput - The return type for the liveWebAgentFlow function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import puppeteer from 'puppeteer';
import { LiveWebAgentInputSchema, LiveWebAgentOutputSchema, SearchResultSchema } from '@/lib/types';


// Define a tool for the AI to navigate to a URL
const goToUrlTool = ai.defineTool(
  {
    name: 'goToUrl',
    description: 'Navigates a headless browser to the specified URL to read its content.',
    inputSchema: z.object({ url: z.string().url() }),
    outputSchema: z.string().describe('The textual content of the page body, up to 4000 characters.'),
  },
  async ({ url }) => {
    console.log(`Navigating to ${url}...`);
    try {
        const browser = await puppeteer.launch({ headless: true, args:['--no-sandbox'] });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });
        const body = await page.evaluate(() => document.body.innerText);
        await browser.close();
        console.log(`Finished navigating to ${url}.`);
        return body.substring(0, 4000); // Truncate for performance
    } catch (e: any) {
        console.error(`Error navigating to ${url}:`, e.message);
        return `Error: Could not access the URL. It might be down or blocking access.`;
    }
  }
);

// Define a tool for searching
const searchTool = ai.defineTool(
    {
      name: 'search',
      description: 'Performs a web search to get a list of relevant results.',
      inputSchema: z.object({ query: z.string() }),
      outputSchema: z.object({
          results: z.array(SearchResultSchema)
      }),
    },
    async ({ query }) => {
      // In a real implementation, this would use a search API like Tavily.
      // We'll mock the response to look like a search engine result page.
      console.log(`Searching for: ${query}`);
      return {
        results: [
            { title: `Top result for "${query}"`, url: `https://www.google.com/search?q=${encodeURIComponent(query)}`, snippet: `This is a simulated top search result for your query. The live agent will now analyze this page.`},
            { title: `Second finding for "${query}"`, url: `https://www.bing.com/search?q=${encodeURIComponent(query)}`, snippet: `This is another relevant search result. The agent can choose to visit this page if the first one is not sufficient.`},
            { title: `Wikipedia article on "${query}"`, url: `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`, snippet: `Often, a Wikipedia page offers a good summary. The agent might start here to get a broad overview.`},
        ]
      }
    }
);


const prompt = ai.definePrompt({
    name: 'liveWebAgentPrompt',
    input: { schema: LiveWebAgentInputSchema },
    output: { schema: LiveWebAgentOutputSchema },
    tools: [goToUrlTool, searchTool],
    prompt: `You are a Live Web Agent. Your purpose is to achieve a user's goal by navigating the internet with a headless browser.

    User's Goal: {{{goal}}}

    1.  Start by using the 'search' tool to get a list of relevant websites. Do not make up URLs.
    2.  Analyze the search results. Use the 'goToUrl' tool to visit the most promising URL from the results.
    3.  Read the content of the page to determine if it helps achieve the user's goal.
    4.  If the page is useful, synthesize the information into a final 'summary'.
    5.  If the page is not useful, you may try another URL from the initial search results or perform a new search.
    6.  Your final output MUST be a JSON object containing a 'summary' of your findings and a 'results' array containing the web pages you decided were most relevant, including their title, URL, and a snippet.

    Begin.`,
});

export const liveWebAgentFlow = ai.defineFlow(
    {
      name: 'liveWebAgentFlow',
      inputSchema: LiveWebAgentInputSchema,
      outputSchema: LiveWebAgentOutputSchema,
    },
    async (input) => {
      const { output } = await prompt(input);
  
      if (!output) {
        throw new Error('The Live Web Agent failed to accomplish the goal.');
      }
  
      // Add mock data if the model fails to generate complete output, for demo purposes.
      if (!output.results || output.results.length === 0) {
        output.results = [{
            title: `Simulated result for "${input.goal}"`,
            url: `https://www.google.com/search?q=${encodeURIComponent(input.goal)}`,
            snippet: `This is a mock search result. In a real scenario, the AI would have performed a search, visited pages, and compiled this list of findings based on the content of those pages.`,
        }];
        output.summary = `(Mock response) The agent has completed its task for the goal: "${input.goal}". This requires a complex multi-step tool execution which is being simulated here with a final summary and result list.`;
      }

      return output;
    }
  );
