
import { ualRegistry } from '../registry';
import { Action } from '../types';

const typeTextAction: Action = {
  name: 'typeText',
  description: 'Types text into a specified element on the page.',
  parameters: [
    {
      name: 'selector',
      type: 'string',
      description: 'The CSS selector of the element to type into.',
      required: true,
    },
    {
      name: 'text',
      type: 'string',
      description: 'The text to type.',
      required: true,
    },
  ],
  execute: async (args: { selector: string; text: string }) => {
    // In a real implementation, this would use a browser automation library
    // to find the element and type the text. For now, we'll simulate it.
    return `Simulating: Typed "${args.text}" into element "${args.selector}"`;
  },
};

ualRegistry.register(typeTextAction);
