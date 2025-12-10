// This file is deprecated - all AI logic is now in actions.ts using direct HTTP calls
// Keeping this file to avoid breaking imports, but it's no longer used

export async function cosmicFlow(
  query: string,
  mode: any,
  chatHistory: any[],
  file?: any,
  options?: any,
): Promise<string> {
  // This function is no longer used
  // All AI calls are handled directly in actions.ts
  throw new Error('cosmicFlow is deprecated. Use askAi from actions.ts instead.');
}
