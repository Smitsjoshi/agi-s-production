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
    // Basic validation
    if (!query && !file) {
      throw new Error("Either a query or a file must be provided.");
    }

    // Here, you would add more complex logic based on the `mode` and `file` type.
    // For this example, we'll keep it simple and just use the cosmicFlow.
    
    const result = await cosmicFlow(query);

    // Save chat to Firestore
    await addChatMessage({
      query,
      answer: result,
      timestamp: new Date(),
    });

    return { answer: result };

  } catch (error: any) {
    console.error("[askAi Error]", error);
    // Log the error to your preferred logging service

    return { 
      error: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'An unexpected error occurred. Please try again.'
    };
  }
}
