'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, History } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { askAi } from '@/app/actions';

interface SimMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function ContinuumPage() {
  const [messages, setMessages] = useState<SimMessage[]>([
    { role: 'assistant', content: "Welcome to the Continuum Engine. I can simulate any historical event, 'What If' scenario, or future timeline. What shall we simulate today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages]);

  const handleSimulate = async () => {
    if (!input.trim()) return;
    const userQuery = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userQuery }]);
    setIsLoading(true);

    try {
      const response = await askAi(
        `You are the Continuum Engine.
             Task: Simulate the requested scenario in vivid detail.
             User Request: "${userQuery}"
             
             Structure:
             1. Title of the Timeline
             2. The Divergence Point (if applicable)
             3. Immediate Consequences (Year 1-5)
             4. Long-term Impact (Year 50+)
             5. Conclusion
             
             Keep it immersive and narrative.`,
        'AGI-S S-1',
        messages.map(m => ({ role: m.role, content: m.content })) // Pass context if type allows, or just simple
      );

      const content = response.answer || "Simulation failed. The timeline is unstable.";
      setMessages(prev => [...prev, { role: 'assistant', content }]);

    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Error: Paradox detected. Simulation aborted." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black text-green-500 font-mono p-4">
      <div className="text-center mb-4 border-b border-green-500/30 pb-4">
        <h1 className="text-2xl font-bold flex items-center justify-center gap-2"><History /> CONTINUUM SIMULATOR</h1>
        <p className="text-xs opacity-70">TIMELINE: UNSTABLE // MODE: INTERACTIVE</p>
      </div>

      <div className="flex-1 overflow-hidden relative border border-green-500/20 rounded-lg bg-black/50">
        <ScrollArea className="h-full p-4" ref={scrollRef}>
          <div className="space-y-6">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex gap-4 max-w-4xl mx-auto", m.role === 'user' ? "flex-row-reverse" : "")}>
                <Avatar className="h-8 w-8 border border-green-500/50 bg-black">
                  <AvatarFallback className="bg-black text-green-500">{m.role === 'user' ? 'USR' : 'AI'}</AvatarFallback>
                </Avatar>
                <div className={cn("p-4 rounded-sm border", m.role === 'user' ? "border-green-500/50 bg-green-900/10" : "border-green-500/20 bg-black")}>
                  <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-4 max-w-4xl mx-auto">
                <Avatar className="h-8 w-8 border border-green-500/50 bg-black"><AvatarFallback>AI</AvatarFallback></Avatar>
                <div className="p-4 flex items-center gap-2 text-green-500 animate-pulse">
                  <Loader2 className="h-4 w-4 animate-spin" /> Calculating Probabilities...
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="mt-4 max-w-4xl mx-auto w-full flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSimulate()}
          placeholder="Enter simulation parameters (e.g., 'What if dinosaurs never went extinct?')"
          className="bg-black border-green-500/50 text-green-500 placeholder:text-green-500/30 focus-visible:ring-green-500 inputs-are-usable"
        />
        <Button onClick={handleSimulate} disabled={isLoading} variant="outline" className="border-green-500/50 text-green-500 hover:bg-green-900/20">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
