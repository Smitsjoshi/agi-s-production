
import { ualRegistry } from '../registry';
import { Action } from '../types';

const listFilesAction: Action = {
  name: 'listFiles',
  description: 'Lists all files in the current project directory.',
  parameters: [],
  execute: async () => {
    // In a real implementation, this would interact with the host environment
    // to list the files. For now, we will return a placeholder.
    return ['file1.txt', 'file2.js', 'folderA'];
  },
};

ualRegistry.register(listFilesAction);
