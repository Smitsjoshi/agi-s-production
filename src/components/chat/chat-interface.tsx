'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Send, Loader2, Bot, BrainCircuit, Code, FlaskConical, Microscope, PlusCircle, Briefcase, Globe, Feather, Dices, Palette, Soup, TrendingUp, GitCompareArrows, Scale, Cpu, Workflow, Mic, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import useLocalStorage from '@/hooks/use-local-storage';
import { askAi } from '@/app/actions';
import type { ChatMessage, AiMode } from '@/lib/types';
import { ChatMessageDisplay } from '@/components/chat/chat-message';
import { nanoid } from 'nanoid';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';
import { useSound } from '@/hooks/use-sound';
import { Logo } from '../logo';
import { useSpeechToText } from '@/hooks/use-speech-to-text';

const AI_MODE_DETAILS: Record<AiMode, { icon: React.ElementType, description: string, isPersona?: boolean }> = {
  'AI Knowledge': { icon: BrainCircuit, description: 'Quick, web-powered answers.' },
  'CodeX': { icon: Code, description: 'An elite 10x developer and pair programmer.' },
  'Academic Research': { icon: Microscope, description: 'Search academic sources.' },
  'Deep Dive': { icon: FlaskConical, description: 'In-depth, multi-source analysis.' },
  'Canvas': { icon: Cpu, description: 'Your goal-oriented autonomous web agent.' },
  'Blueprint': { icon: Workflow, description: 'Deconstructs goals into actionable plans.' },
  // Personas
  'The Strategist': { icon: Briefcase, description: 'A seasoned MBA and startup consultant.', isPersona: true },
  'The Globetrotter': { icon: Globe, description: 'An elite travel concierge for detailed itineraries.', isPersona: true },
  'The Storyteller': { icon: Feather, description: 'A creative co-author for writers and marketers.', isPersona: true },
  'The Game Master': { icon: Dices, description: 'An imaginative Dungeon Master for TTRPGs.', isPersona: true },
  'The Designer': { icon: Palette, description: 'A senior UI/UX designer for app concepts.', isPersona: true },
  'The Gourmet': { icon: Soup, description: 'A personal chef and nutritionist for custom meal plans.', isPersona: true },
  'The Forecaster': { icon: TrendingUp, description: 'A trend analyst and data-driven futurist.', isPersona: true },
  'Comparison Analyst': { icon: GitCompareArrows, description: 'An unbiased evaluator for side-by-side comparisons.', isPersona: true },
  'The Ethicist': { icon: Scale, description: 'Analyzes complex moral and ethical dilemmas.', isPersona: true },
  'Synthesis': { icon: Code, description: 'Placeholder' }, // Added to satisfy type, not shown in UI
  'Crucible': { icon: Code, description: 'Placeholder' }, // Added to satisfy type, not shown in UI
};

const MAIN_AI_MODES = ['AI Knowledge', 'CodeX', 'Academic Research', 'Deep Dive', 'Canvas', 'Blueprint'] as AiMode[];
const PERSONAS = Object.keys(AI_MODE_DETAILS).filter(key => AI_MODE_DETAILS[key as AiMode].isPersona) as AiMode[];


export function ChatInterface() {
  const [messages, setMessages] = useLocalStorage<ChatMessage[]>('chat-history', []);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<AiMode>('AI Knowledge');
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<{ name: string; type: 'image' | 'pdf'; data: string } | null>(null);
  const [isClient, setIsClient] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const playSendSound = useSound('/sounds/send.mp3');
  const playReceiveSound = useSound('/sounds/receive.mp3');
  const playErrorSound = useSound('/sounds/error.mp3');

  const { isListening, startListening, stopListening } = useSpeechToText({
    onTranscript: (transcript) => {
      setInput((prevInput) => prevInput + transcript);
    },
  });


  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);
  
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'assistant') {
      playReceiveSound();
    }
  }, [messages, playReceiveSound]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileType = selectedFile.type.startsWith('image/') ? 'image' : 'pdf';
        setFile({
          name: selectedFile.name,
          type: fileType,
          data: e.target?.result as string,
        });
        toast({ title: 'File attached', description: selectedFile.name });
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !file) return;
    
    playSendSound();

    const userMessage: ChatMessage = { id: nanoid(), role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setIsLoading(true);
    setInput('');
    setFile(null);

    try {
      const result = await askAi(input, mode, newMessages, file || undefined);
      const assistantMessage: ChatMessage = {
        id: nanoid(),
        role: 'assistant',
        content: result.answer || result.componentCode || result.summary,
        sources: result.sources,
        reasoning: result.reasoning,
        confidenceScore: result.confidenceScore,
        liveWebAgentOutput: result.visitedPages ? result : undefined,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      playErrorSound();
      const currentMessages = [...newMessages]; // Use the latest state
      const userMessageIndex = currentMessages.findIndex(m => m.id === userMessage.id);
      if (userMessageIndex !== -1) {
          // If there's an error, we keep the user message, but don't add the assistant one.
          // This ensures the user message is visible.
          setMessages(currentMessages.slice(0, userMessageIndex + 1));
      }
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const ModeIcon = AI_MODE_DETAILS[mode]?.icon || BrainCircuit;

  if (!isClient) {
    return null;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-4 md:p-6 space-y-6">
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center h-full text-center relative">
                  <div className="liquid-glow"></div>
                  <div className="relative z-10 p-4 bg-primary/10 rounded-full border-4 border-primary/20 mb-4">
                      <Cpu size={40} className="text-primary" />
                  </div>
                  <div className="flex items-center justify-center gap-2 z-10">
                    <h2 className="font-headline text-2xl font-semibold">Welcome to</h2>
                    <Logo className="h-10 text-2xl" />
                  </div>
                  <p className="text-muted-foreground z-10 font-medium text-lg mt-2">One Interface. Infinite Capabilities.</p>
                  <p className="text-muted-foreground z-10 max-w-2xl mx-auto mt-4">
                      AGI-S is built to be the one-stop solution for all your AI needs. This may result in a comprehensive application with many pages and powerful offerings, but our core goal is to fulfill all your requirements in one place, providing a truly integrated and seamless experience.
                  </p>
              </div>
            )}
            {messages.map((msg) => (
              <ChatMessageDisplay key={msg.id} message={msg} />
            ))}
            {isLoading && messages[messages.length-1]?.role === 'user' && (
              <ChatMessageDisplay message={{ id: 'loading', role: 'assistant', content: '' }} isLoading={true} />
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="border-t bg-background/95 p-2 backdrop-blur-sm sticky bottom-0">
        <div className="relative rounded-lg border bg-background">
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 p-1"
          >
             <Popover>
              <PopoverTrigger asChild>
                  <Button variant="outline" className="shrink-0 w-44 justify-start font-medium" disabled={isLoading}>
                      <ModeIcon className="h-4 w-4 mr-2 text-primary" />
                      <span className="flex-1 text-left truncate text-sm">{mode}</span>
                  </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[26rem] p-0 mb-2">
                <ScrollArea className="h-[32rem]">
                <div className="p-4 grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">AI Modes</h4>
                    <p className="text-sm text-muted-foreground">
                      Select a specialized AI agent for your task.
                    </p>
                  </div>
                   <div className="grid gap-2">
                    {MAIN_AI_MODES.map((m) => {
                      const { icon: Icon, description } = AI_MODE_DETAILS[m];
                      return (
                        <div
                          key={m}
                          onClick={() => setMode(m)}
                          className={cn(
                            'flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors',
                             mode === m ? 'bg-secondary' : 'hover:bg-muted/50'
                          )}
                        >
                            <Icon className="h-5 w-5 mt-0.5 text-primary" />
                            <div>
                                <p className="font-medium text-sm">{m}</p>
                                <p className="text-xs text-muted-foreground">{description}</p>
                            </div>
                        </div>
                      );
                    })}
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Personas</h4>
                     <p className="text-sm text-muted-foreground">
                      Chat with a specialized persona.
                    </p>
                  </div>
                   <div className="grid gap-2">
                    {PERSONAS.map((m) => {
                      const { icon: Icon, description } = AI_MODE_DETAILS[m];
                      return (
                        <div
                          key={m}
                          onClick={() => setMode(m)}
                          className={cn(
                            'flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors',
                             mode === m ? 'bg-secondary' : 'hover:bg-muted/50'
                          )}
                        >
                            <Icon className="h-5 w-5 mt-0.5 text-primary" />
                            <div>
                                <p className="font-medium text-sm">{m}</p>
                                <p className="text-xs text-muted-foreground">{description}</p>
                            </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask ${mode}...`}
              className="chat-input flex-1 resize-none border-0 shadow-none focus-visible:ring-0 text-base py-3"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              disabled={isLoading}
              rows={1}
            />
             <Button
                type="button"
                variant={isListening ? "destructive" : "ghost"}
                size="icon"
                className="shrink-0 h-8 w-8"
                onClick={() => {
                  if (isListening) {
                    stopListening();
                  } else {
                    startListening();
                  }
                }}
                disabled={isLoading}
              >
                <Mic className="h-4 w-4" />
              </Button>
             <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 h-8 w-8"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <Image className="h-4 w-4" />
              </Button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,.pdf" />

              <Button type="submit" size="icon" className="shrink-0 h-8 w-8" disabled={isLoading || (!input.trim() && !file)}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
          </form>
          {file && (
            <div className="p-2 pt-0 text-xs text-muted-foreground">Attached: {file.name}</div>
          )}
        </div>
        <p className="text-xs text-center text-muted-foreground mt-2 px-4">
            AGI-S can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>
  );
}
