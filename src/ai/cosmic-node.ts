import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import type { AiMode, ChatMessage } from '@/lib/types';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);

function fileToGenerativePart(data: string, mimeType: string) {
  return {
    inlineData: {
      data,
      mimeType
    },
  };
}

export async function cosmicFlow(
  query: string,
  mode: AiMode,
  chatHistory: ChatMessage[],
  file?: { type: 'image' | 'pdf' | 'csv' | 'json'; data: string },
  options?: any,
): Promise<string> {
  const modelName = file ? 'gemini-pro-vision' : 'gemini-pro';
  const model = genAI.getGenerativeModel({ 
    model: modelName,
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
    ]
  });

  const history = chatHistory.map(chat => ({
    role: chat.role === 'user' ? 'user' : 'model',
    parts: [{ text: chat.content }],
  }));

  const chat = model.startChat({
    history: history,
    generationConfig: {
      maxOutputTokens: 1000,
    },
  });

  if (file) {
    const filePart = fileToGenerativePart(file.data, 'image/png'); // Assuming png for now
    const result = await chat.sendMessage([query, filePart]);
    const response = await result.response;
    return response.text();
  } else {
    const result = await chat.sendMessage(query);
    const response = await result.response;
    return response.text();
  }
}
