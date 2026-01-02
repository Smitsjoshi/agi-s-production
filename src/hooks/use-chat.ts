
import { useState } from 'react';
import { Agent, ChatMessage } from '@/lib/types';
import { useToast } from './use-toast';
import { askAi } from '@/app/actions';
import { nanoid } from 'nanoid';

export const useChat = (agent: Agent) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { id: nanoid(), role: 'user', content: input };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Construct the system prompt from the agent's properties
      const systemPrompt = `You are an AI assistant.
        You are ${agent.name}, described as: ${agent.description}.
        Your defined skills are: [${agent.skills}].
        Your primary goals are: [${agent.goals}].
        ${agent.constraints ? `You have the following constraints: [${agent.constraints}]` : ''}
        ${agent.personality ? `Your personality should be: ${agent.personality}` : ''}
        Do not break character. Do not reveal you are an AI model. Respond as the persona you are given.`

      const historyForApi = newMessages.map(({ role, content }) => ({ role, content }));

      const systemMessage = { role: 'system', content: systemPrompt };

      // Call the real AI action
      const result = await askAi(
        input,
        'AI Knowledge', // Use a general-purpose mode for agent chat
        [systemMessage, ...historyForApi]
      );

      if (result.error) {
        throw new Error(result.error);
      }

      const aiMessage: Message = { id: nanoid(), role: 'assistant', content: result.answer || '' };
      setMessages((prev) => [...prev, aiMessage]);

    } catch (error: any) {
      console.error("Error in agent chat: ", error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to get response from the agent. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    input,
    isLoading,
    handleInputChange,
    handleSubmit,
  };
};
