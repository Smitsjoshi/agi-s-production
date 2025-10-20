
import { ualRegistry } from '../registry';
import { Action } from '../types';

const openWebsiteAction: Action = {
  name: 'openWebsite',
  description: 'Opens a website in a new tab.',
  parameters: [
    {
      name: 'url',
      type: 'string',
      description: 'The URL of the website to open.',
      required: true,
    },
  ],
  execute: async (args: { url: string }) => {
    if (typeof window !== 'undefined') {
      window.open(args.url, '_blank');
      return `Successfully opened ${args.url}`;
    }
    return 'Could not open URL. This action can only be run in a browser.';
  },
};

ualRegistry.register(openWebsiteAction);
