'use server';

import { cosmicFlow } from '@/ai/cosmic-node';
import { addChatMessage } from '@/lib/firebase/firestore';
import type { AiMode } from '@/lib/types';

export async function askAi(
  query: string,
  mode: AiMode,
  chatHistory: any[],
  file?: { type: 'image' | 'pdf' | 'csv' | 'json'; data: string },
  options?: any,
) {
  try {
    const result = await cosmicFlow(query);

    // Save chat to Firestore
    await addChatMessage({
      query,
      answer: result,
      timestamp: new Date(),
    });

    return { answer: result };
  } catch (error: any) {
    console.error(error);
    return { error: error.message || 'An unknown error occurred.' };
  }
}
