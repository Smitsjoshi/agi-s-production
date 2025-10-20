
import { ualRegistry } from '../registry';
import { Action } from '../types';

const webSearchAction: Action = {
  name: 'webSearch',
  description: 'Performs a web search on a specified search engine.',
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
    if (typeof window === 'undefined') {
      return 'Could not perform search. This action can only be run in a browser.';
    }

    const { query, engine = 'google' } = args;
    let searchUrl = '';

    switch (engine.toLowerCase()) {
      case 'bing':
        searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
        break;
      case 'duckduckgo':
        searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
        break;
      case 'google':
      default:
        searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        break;
    }

    window.open(searchUrl, '_blank');
    return `Searching for "${query}" on ${engine}.`;
  },
};

ualRegistry.register(webSearchAction);
