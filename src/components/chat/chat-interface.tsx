'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Send, Loader2, Bot, BrainCircuit, Code, FlaskConical, Microscope, PlusCircle, Briefcase, Globe, Feather, Dices, Palette, Soup, TrendingUp, GitCompareArrows, Scale, Cpu, Workflow, Mic, Image, ArrowRight, Star, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import useLocalStorage from '@/hooks/use-local-storage';
import { askAi } from '@/app/actions';
import type { ChatMessage, AiMode, Agent } from '@/lib/types';
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
  'Synthesis': { icon: Code, description: 'Placeholder' }, // Added to satisfy type
  'Crucible': { icon: Code, description: 'Placeholder' }, // Added to satisfy type
  'Cosmos': { icon: Star, description: 'Generate entire fictional universes.' },
  'Catalyst': { icon: BookOpen, description: 'Personalized learning paths.' },
};

const MAIN_AI_MODES = ['AI Knowledge', 'CodeX', 'Academic Research', 'Deep Dive', 'Canvas', 'Blueprint'] as AiMode[];
const PERSONAS = Object.keys(AI_MODE_DETAILS).filter(key => AI_MODE_DETAILS[key as AiMode].isPersona) as AiMode[];

interface ChatInterfaceProps {
  agentId?: string;
  agentConfig?: Agent;
}

export function ChatInterface({ agentId, agentConfig }: ChatInterfaceProps = {}) {
  const storageKey = agentId ? `chat-history-${agentId}` : 'chat-history';
  const [messages, setMessages] = useLocalStorage<ChatMessage[]>(storageKey, []);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<AiMode>('AI Knowledge');
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<{ name: string; type: 'image' | 'pdf'; data: string } | null>(null);
  const [isClient, setIsClient] = useState(false);

  const [slashCommandOpen, setSlashCommandOpen] = useState(false);
  const [slashFilter, setSlashFilter] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const allModes = [...MAIN_AI_MODES, ...PERSONAS];
  const filteredModes = allModes.filter(m =>
    m.toLowerCase().includes(slashFilter.toLowerCase())
  );

  const playSendSound = useSound('/sounds/send.mp3');
  const playReceiveSound = useSound('/sounds/receive.mp3');
  const playErrorSound = useSound('/sounds/error.mp3');

  const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  const { isListening, startListening, stopListening } = useSpeechToText({
    onTranscript: (transcript) => {
      setInput((prevInput) => prevInput + transcript);
    },
  });


  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const handleNewChat = () => {
      setMessages([]);
    };
    window.addEventListener('new-chat', handleNewChat);
    return () => {
      window.removeEventListener('new-chat', handleNewChat);
    };
  }, [setMessages]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        setTimeout(() => {
          viewport.scrollTop = viewport.scrollHeight;
        }, 100);
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'assistant') {
      playReceiveSound();
    }
  }, [messages, playReceiveSound]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);

    if (value.startsWith('/')) {
      setSlashCommandOpen(true);
      setSlashFilter(value.substring(1));
      setSelectedIndex(0);
    } else {
      setSlashCommandOpen(false);
    }
  };

  const selectMode = (selectedMode: AiMode) => {
    setMode(selectedMode);
    setInput('');
    setSlashCommandOpen(false);
    toast({ title: `Switched to ${selectedMode}` });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (slashCommandOpen) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredModes.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredModes.length) % filteredModes.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (filteredModes.length > 0) {
          selectMode(filteredModes[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        setSlashCommandOpen(false);
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

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

    // Capture current values
    const currentInput = input;
    const currentFile = file;

    // clear input immediately
    setInput('');
    setFile(null);
    setSlashCommandOpen(false);

    const userMessage: ChatMessage = { id: generateId(), role: 'user', content: currentInput };

    // Optimistically add user message
    setMessages((prev: ChatMessage[]) => [...prev, userMessage]);
    setIsLoading(true);

    // Play sound safely
    try {
      playSendSound();
    } catch (err) {
      console.error("Error playing sound:", err);
    }

    try {
      // Use the captured values for the API call
      // Pass the *updated* messages array logic (current prev + userMessage) is handled by the backend/action usually requesting full history.
      const messagesForApi = [...messages, userMessage];

      // UNIVERSAL ACTION LAYER (UAL) INTEGRATION
      if (mode === 'Canvas') {
        const { UALAgentLoop } = await import('@/lib/ual/ual-agent-loop'); // Dynamic import
        const assistantMsgId = generateId();

        // Create initial placeholder message
        const initialAssistantMsg: ChatMessage = {
          id: assistantMsgId,
          role: 'assistant',
          content: 'Initialize Autonomous Web Agent...',
          agentSteps: [],
        };

        setMessages((prev: ChatMessage[]) => [...prev, initialAssistantMsg]);

        const loop = new UALAgentLoop();
        await loop.run(currentInput, (step) => {
          setMessages((prev: ChatMessage[]) => {
            const newMsgs = [...prev];
            const msgIndex = newMsgs.findIndex(m => m.id === assistantMsgId);
            if (msgIndex !== -1) {
              const msg = { ...newMsgs[msgIndex] };
              msg.agentSteps = [...(msg.agentSteps || []), step];

              // Update main content based on state
              if (step.type === 'completed') {
                msg.content = step.message;
              } else if (step.type === 'failed') {
                msg.content = `**Task Failed**: ${step.message}`;
              } else {
                msg.content = step.message; // Detailed status as main content during execution
              }
              newMsgs[msgIndex] = msg;
            }
            return newMsgs;
          });
        });

        return; // Exit normally after loop finishes
      }

      // STANDARD AI CHAT
      const result = await askAi(currentInput, mode, messagesForApi, currentFile || undefined);

      if (result.error) {
        throw new Error(result.error);
      }

      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: result.answer || result.componentCode || '',
        reasoning: result.reasoning,
      };

      setMessages((prev: ChatMessage[]) => [...prev, assistantMessage]);

    } catch (error) {
      console.error(error);
      try {
        playErrorSound();
      } catch (err) {
        console.error("Error playing error sound:", err);
      }

      const errorMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: '**Error:** I apologize, but I encountered an error. Please try again.',
      };
      setMessages((prev: ChatMessage[]) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const ModeIcon = AI_MODE_DETAILS[mode]?.icon || BrainCircuit;

  if (!isClient) {
    return null;
  }

  return (
    <div className="flex h-full flex-col tour-chat-interface">
      <div className="flex-1 overflow-y-auto">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-4 md:p-6 space-y-8 max-w-4xl mx-auto">
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center opacity-40 hover:opacity-100 transition-opacity duration-700">
                <Logo className="h-12 w-auto mb-6 grayscale opacity-80" />
                <h1 className="text-xl font-medium tracking-tight text-foreground/80">One Interface. Infinite Capabilities.</h1>
              </div>
            )}
            {messages.map((msg) => (
              <ChatMessageDisplay key={msg.id} message={msg} />
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <ChatMessageDisplay message={{ id: 'loading', role: 'assistant', content: '' }} isLoading={true} />
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="p-4 md:p-6 max-w-4xl mx-auto w-full">
        {slashCommandOpen && (
          <div className="absolute bottom-full left-4 mb-2 w-64 bg-popover border rounded-md shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2">
            <div className="p-2 border-b text-xs font-medium text-muted-foreground">
              Select Mode
            </div>
            <ScrollArea className="h-48">
              <div className="p-1">
                {filteredModes.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground text-center">No modes found</div>
                ) : (
                  filteredModes.map((m, index) => {
                    const { icon: Icon } = AI_MODE_DETAILS[m];
                    return (
                      <div
                        key={m}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-sm cursor-pointer text-sm",
                          index === selectedIndex ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                        )}
                        onClick={() => selectMode(m)}
                        onMouseEnter={() => setSelectedIndex(index)}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{m}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>
        )}
        <div className="relative rounded-xl border bg-background/50 focus-within:ring-1 focus-within:ring-ring transition-all shadow-sm">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-2 p-3"
          >
            <Textarea
              value={input}
              onChange={handleInputChange}
              placeholder={`Ask ${mode}...`}
              className="chat-input flex-1 resize-none border-0 shadow-none focus-visible:ring-0 text-base min-h-[60px] bg-transparent p-2"
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              rows={1}
            />

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 gap-2 text-muted-foreground hover:text-foreground font-normal" disabled={isLoading}>
                      <ModeIcon className="h-4 w-4" />
                      <span className="text-xs">{mode}</span>
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
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-sm">{m}</p>
                                  </div>
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
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-sm">{m}</p>
                                  </div>
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

                <Button
                  type="button"
                  variant={isListening ? "destructive" : "ghost"}
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
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
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                >
                  <Image className="h-4 w-4" />
                </Button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,.pdf" />
              </div>

              <div className="flex items-center gap-2">
                {file && (
                  <span className="text-xs text-muted-foreground truncate max-w-[150px]">{file.name}</span>
                )}
                <Button type="submit" size="icon" className="h-8 w-8 rounded-lg bg-foreground text-background hover:bg-foreground/90" disabled={isLoading || (!input.trim() && !file)}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </form>
        </div>
        <p className="text-[10px] text-center text-muted-foreground/40 mt-3">
          AGI-S can make mistakes.
        </p>
      </div>
    </div>
  );
}
