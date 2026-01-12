'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Send, Loader2, Bot, BrainCircuit, Code, FlaskConical, Microscope, PlusCircle, Briefcase, Globe, Feather, Dices, Palette, Soup, TrendingUp, GitCompareArrows, Scale, Cpu, Workflow, Mic, Image, ArrowRight, Star, BookOpen, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import useLocalStorage from '@/hooks/use-local-storage';
import { askAi } from '@/app/actions';
import type { ChatMessage, AiMode, Agent } from '@/lib/types';
import { EnhancedChatMessage } from '@/components/chat/enhanced-chat-message';
import { nanoid } from 'nanoid';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';
import { Slider } from '../ui/slider';
import { useSound } from '@/hooks/use-sound';
import { Logo } from '../logo';
import { useSpeechToText } from '@/hooks/use-speech-to-text';

const AI_MODE_DETAILS: Record<AiMode, { icon: React.ElementType, description: string, isPersona?: boolean }> = {
  'AGI-S S-1': { icon: Cpu, description: 'The Bigger Persona. 120B parameters for deep reasoning and complex logic.' },
  'AGI-S S-2': { icon: BrainCircuit, description: 'The Smarter Persona. 17B parameters for ultra-fast, sharp coding and precision.' },
  'CodeX': { icon: Code, description: 'An elite 10x developer and pair programmer.' },
  'Academic Research': { icon: Microscope, description: 'Search academic sources.' },
  'Deep Dive': { icon: FlaskConical, description: 'In-depth, multi-source analysis.' },
  'Cosmos': { icon: Star, description: 'Generate entire fictional universes.' },
  'Catalyst': { icon: BookOpen, description: 'Personalized learning paths.' },
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
  'Enhanced': { icon: Sparkles, description: 'DOMINANCE MODE: Multi-perspective, web search, visual diagrams, and expertise control.' },
  'Synthesis': { icon: Code, description: 'Data integration and synthesis.' },
  'Crucible': { icon: Code, description: 'Idea testing and red-teaming.' },
  // Hidden from UI but required by type
  'Canvas': { icon: Cpu, description: 'External Page' },
  'Blueprint': { icon: Workflow, description: 'External Page' },
};

const MAIN_AI_MODES = ['AGI-S S-1', 'AGI-S S-2', 'Enhanced', 'CodeX', 'Academic Research', 'Deep Dive'] as AiMode[];
const PERSONAS = Object.keys(AI_MODE_DETAILS).filter(key => AI_MODE_DETAILS[key as AiMode].isPersona) as AiMode[];

interface ChatInterfaceProps {
  agentId?: string;
  agentConfig?: Agent;
}

export function ChatInterface({ agentId, agentConfig }: ChatInterfaceProps = {}) {
  const storageKey = agentId ? `chat-history-${agentId}` : 'chat-history';
  const [messages, setMessages] = useLocalStorage<ChatMessage[]>(storageKey, []);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<AiMode>('AGI-S S-1');
  const [isLoading, setIsLoading] = useState(false);
  const [detailLevel, setDetailLevel] = useState([50]);
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

    // 1. RECALL STEP (Total Recall)
    let memoryContext = "";
    try {
      // Dynamic import to avoid circular dep issues during heavy load
      const { memoryService } = await import('@/lib/memory-service');
      const recalledItems = await memoryService.recall(input, 3);

      if (recalledItems.length > 0) {
        console.log("🧠 Memory Recalled:", recalledItems);
        toast({
          title: "🧠 Memory Active",
          description: `Recalled ${recalledItems.length} past items.`,
          duration: 2000,
        });
        memoryContext = `\n\n[RECALLED MEMORY CONTEXT]:\n${recalledItems.map(item => `- ${item.content.substring(0, 100)}...`).join('\n')}`;
      }
    } catch (e) {
      console.error("Memory Recall Failed", e);
    }

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

      // 2. CHOOSE ENDPOINT
      let assistantMessage: ChatMessage;

      if (mode === 'Enhanced') {
        const enhancedResponse = await fetch('/api/ask/enhanced', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: currentInput,
            mode,
            detailLevel: detailLevel[0] // Pass the permanent detail level
          }),
        });

        if (!enhancedResponse.ok) {
          throw new Error('Enhanced API failed');
        }

        const enhancedResult = await enhancedResponse.json();

        assistantMessage = {
          id: generateId(),
          role: 'assistant',
          content: enhancedResult.data.quick, // Use quick as primary content
          isEnhanced: true,
          enhancedData: enhancedResult.data,
        };
      } else {
        // STANDARD AI CHAT
        const result = await askAi(currentInput, mode, messagesForApi, currentFile || undefined);

        if (result.error) {
          throw new Error(result.error);
        }

        assistantMessage = {
          id: generateId(),
          role: 'assistant',
          content: result.answer || result.componentCode || '',
          reasoning: result.reasoning,
        };
      }

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
    <div className="flex h-full flex-col relative tour-chat-interface overflow-hidden">
      {/* 1. MESSAGES AREA (Scrollable) */}
      <div className="flex-1 relative overflow-hidden">
        <ScrollArea className="h-full w-full" ref={scrollAreaRef}>
          <div className="p-4 md:p-6 space-y-8 max-w-4xl mx-auto pb-[280px]"> {/* Large bottom padding for the static input bar */}
            {(messages.length === 0 && !isLoading) ? (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center opacity-40 hover:opacity-100 transition-opacity duration-700">
                <Logo className="h-12 w-auto mb-6 grayscale opacity-80" />
                <h1 className="text-xl font-medium tracking-tight text-foreground/80">One Interface. Infinite Capabilities.</h1>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <EnhancedChatMessage
                    key={msg.id}
                    content={msg.content}
                    role={msg.role as 'user' | 'assistant'}
                    isEnhanced={msg.isEnhanced}
                    enhancedData={msg.enhancedData}
                    currentDetailLevel={detailLevel[0]} // Sync with global slider
                  />
                ))}
                {isLoading && (
                  <EnhancedChatMessage role="assistant" content="" isLoading={true} currentDetailLevel={detailLevel[0]} />
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* 2. STATIC INPUT AREA (Gemini/ChatGPT Style) */}
      <div className="absolute bottom-0 left-0 right-0 z-30 pt-10 pb-4 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none">
        <div className="max-w-4xl mx-auto w-full px-4 md:px-6 pointer-events-auto">
          {slashCommandOpen && (
            <div className="absolute bottom-full left-0 mb-4 w-64 bg-popover border rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 backdrop-blur-xl border-primary/20">
              <div className="p-3 border-b border-primary/10 text-[10px] font-black uppercase tracking-widest text-primary/60">
                Switch Intelligence Mode
              </div>
              <ScrollArea className="h-48">
                <div className="p-1">
                  {filteredModes.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground text-center italic">No modes found...</div>
                  ) : (
                    filteredModes.map((m, index) => {
                      const { icon: Icon } = AI_MODE_DETAILS[m];
                      return (
                        <div
                          key={m}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg cursor-pointer text-sm transition-all duration-200",
                            index === selectedIndex ? "bg-primary/10 text-primary scale-[1.02]" : "hover:bg-muted/50 opacity-70 hover:opacity-100"
                          )}
                          onClick={() => selectMode(m)}
                          onMouseEnter={() => setSelectedIndex(index)}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="font-medium tracking-tight">{m}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
          <div className="relative rounded-2xl border border-primary/10 bg-background/80 backdrop-blur-3xl focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30 transition-all shadow-2xl shadow-primary/5 overflow-hidden">
            {/* COMPACT INTEGRATED REFINEMENT SLIDER */}
            <div className="px-5 py-3 border-b border-primary/5 bg-primary/[0.01] flex items-center justify-between gap-6">
              <div className="flex items-center gap-2 shrink-0">
                <Sparkles className="h-3 w-3 text-primary/50" />
                <span className="text-[9px] font-black uppercase tracking-widest text-primary/40">Expertise</span>
              </div>

              <div className="flex-1 max-w-sm flex items-center gap-4">
                <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-tighter shrink-0">ELI5</span>
                <Slider
                  value={detailLevel}
                  onValueChange={setDetailLevel}
                  max={100}
                  step={1}
                  className="w-full py-1 cursor-pointer"
                />
                <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-tighter shrink-0">PhD</span>
              </div>

              <div className="flex items-center gap-2 shrink-0 min-w-[80px] justify-end">
                <span className={cn(
                  "text-[9px] font-black font-mono px-2 py-0.5 rounded-full border transition-all duration-300",
                  detailLevel[0] < 33 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                    detailLevel[0] < 66 ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                      "bg-rose-500/10 text-rose-500 border-rose-500/20"
                )}>
                  {detailLevel[0] < 33 ? 'BASIC' :
                    detailLevel[0] < 66 ? 'MID' :
                      'PRO'}
                </span>
              </div>
            </div>
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
                        <div className="max-w-4xl mx-auto px-4 md:px-6">
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

                  {/* HUGE VOICE BUTTON */}
                  <div className="flex-1 flex items-center gap-2">
                    <Button
                      type="button"
                      variant={isListening ? "default" : "outline"}
                      size="lg"
                      className={cn(
                        "h-12 px-6 gap-3 font-bold transition-all flex-1 max-w-xs",
                        isListening
                          ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white animate-pulse shadow-lg shadow-red-500/50 border-0"
                          : "border-2 border-primary/40 hover:border-primary hover:bg-primary/10 hover:scale-105"
                      )}
                      onClick={() => {
                        if (isListening) {
                          stopListening();
                          // SMALL DELAY TO LET TRANSCRIPT FINISH AND THEN SUBMIT
                          setTimeout(async () => {
                            if (input.trim()) {
                              // We need to pass the actual event or mock it
                              const mockEvent = { preventDefault: () => { } } as any;
                              await handleSubmit(mockEvent);
                            }
                          }, 600);
                        } else {
                          startListening();
                        }
                      }}
                      disabled={isLoading}
                      title={isListening ? "Stop Listening" : "Start Voice Mode"}
                    >
                      <Mic className={cn("h-6 w-6", isListening && "animate-pulse")} />
                      <span className="text-base font-bold">
                        {isListening ? "🎤 Listening..." : "Voice Chat"}
                      </span>
                    </Button>
                  </div>

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
          <div className="p-2 text-[10px] text-center text-muted-foreground/40 mt-1">
            AGI-S can make mistakes. Check important info.
          </div>
        </div>
      </div>
    </div>
  );
}
