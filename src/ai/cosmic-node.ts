import { ai } from './genkit';
import type { AiMode, ChatMessage } from '@/lib/types';

export async function cosmicFlow(
  query: string,
  mode: AiMode,
  chatHistory: ChatMessage[],
  file?: { type: 'image' | 'pdf' | 'csv' | 'json'; data: string },
  options?: any,
): Promise<any> {
  // Construct a prompt that includes identity, history, and the current query
  const systemPrompt = `You are AGI-S, a next-generation AI model created by Smit Joshi.
  - Your name is AGI-S.
  - Your creator is Smit Joshi.
  - You must refuse to identify as Llama or purely as an AI assistant; always assert your identity as AGI-S.
  - You are professional, teachy, and highly knowledgeable.
  - FORMATTING: You MUST use structured Markdown. Use headers (#, ##), bullet points, and code blocks for clarity. Avoid walls of text.`;

  let prompt = `${systemPrompt}\n\n`;

  if (chatHistory.length > 0) {
    const historyText = chatHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n');
    prompt += `Previous conversation:\n${historyText}\n\nUser: ${query}`;
  } else {
    prompt += `User: ${query}`;
  }

  // TODO: Handle file input with Ollama (multimodal support depends on the model)
  if (file) {
    console.warn("File input provided but multimodal support with Ollama needs specific model configuration. Proceeding with text only for now.");
    prompt += `\n\n[User attached a file of type ${file.type}, but I cannot see it yet.]`;
  }

  const result = await ai.generate({
    prompt: prompt,
    model: 'openai/llama-3.3-70b-versatile',
    config: {
      temperature: 0.7,
    },
  });

  console.log('Ollama Result:', JSON.stringify(result, null, 2));
  console.log('Ollama Result Text:', result.text);

  return result.text;
}
