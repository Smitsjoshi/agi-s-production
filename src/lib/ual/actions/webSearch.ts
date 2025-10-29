
import { ualRegistry } from '../registry';
import { Action } from '../types';

const webSearchAction: Action = {
  name: 'webSearch',
  description: 'Performs a web search and returns the results as a structured list.',
  parameters: [
    {
      name: 'query',
      type: 'string',
      description: 'The search query.',
      required: true,
    },
    {
      name: 'engine',
      type: 'string',
      description: 'The search engine to use (e.g., google, bing, duckduckgo).',
      required: false,
    },
  ],
  execute: async (args: { query: string; engine?: string }) => {
    const { query, engine = 'google' } = args;

    try {
      const response = await fetch('/api/web-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, engine }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return `Error performing web search: ${errorData.error}`;
      }

      const data = await response.json();
      return JSON.stringify(data.results, null, 2);
    } catch (error) {
      console.error('Error in webSearch action:', error);
      return 'An unexpected error occurred while performing the web search.';
    }
  },
};

ualRegistry.register(webSearchAction);
