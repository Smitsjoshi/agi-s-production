'use client';

import { ChatInterface } from "@/components/chat/chat-interface";
import type { Agent } from "@/lib/types";
import { notFound } from "next/navigation";
import { allAgents } from "@/lib/agents";
import { use, useEffect, useState } from "react";
import { storage, STORAGE_KEYS } from "@/lib/storage";

export default function AgentChatPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap the params Promise using React.use()
  const { id } = use(params);

  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const builtInAgent = allAgents.find(a => a.id === id);

    if (builtInAgent) {
      setAgent(builtInAgent);
      setIsLoading(false);
      return;
    }

    const customAgents = storage.get<Agent[]>(STORAGE_KEYS.CUSTOM_AGENTS, []);
    const customAgent = customAgents.find(a => a.id === id);

    if (customAgent) {
      setAgent(customAgent);
    }

    setIsLoading(false);
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!agent) {
    notFound();
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-muted/30 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
            🤖
          </div>
          <div>
            <h1 className="font-headline text-2xl font-bold">{agent.name}</h1>
            <p className="text-sm text-muted-foreground">{agent.description}</p>
          </div>
        </div>
        {agent.systemPrompt && (
          <div className="mt-3 text-xs text-muted-foreground bg-background/50 p-2 rounded">
            <strong>Expertise:</strong> {agent.systemPrompt.substring(0, 150)}...
          </div>
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatInterface />
      </div>
    </div>
  );
}
