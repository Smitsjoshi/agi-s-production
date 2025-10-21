'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Send, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { HIVE_MIND_AGENTS } from '@/lib/personas';
import { cn } from '@/lib/utils';

const AgentNode = ({ agent, x, y, isActive }: { agent: any, x: number, y: number, isActive: boolean }) => (
  <motion.div
    initial={{ x, y, scale: 0 }}
    animate={{ scale: 1, transition: { delay: Math.random() * 0.5 } }}
    className="absolute flex flex-col items-center text-center"
    style={{ x, y }}
  >
    <motion.div
      className={cn(
        'w-24 h-24 rounded-full flex items-center justify-center border-4 relative',
        isActive ? 'bg-primary/30 border-primary' : 'bg-muted border-muted-foreground/20'
      )}
      animate={{ scale: isActive ? [1, 1.1, 1] : 1 }}
      transition={{ repeat: Infinity, duration: 2 }}
    >
      <agent.icon className={cn('w-12 h-12', isActive ? 'text-primary' : 'text-muted-foreground/50')} />
    </motion.div>
    <p className={cn('mt-3 text-sm font-bold', isActive ? 'text-foreground' : 'text-muted-foreground')}>{agent.name}</p>
    <p className={cn('text-xs max-w-[120px]', isActive ? 'text-muted-foreground' : 'text-muted-foreground/50')}>{agent.description}</p>
  </motion.div>
);

const ConnectionLine = ({ start, end }: { start: { x: number, y: number }, end: { x: number, y: number } }) => {
  const path = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
  return (
    <motion.svg
      className="absolute w-full h-full"
      style={{ top: 0, left: 0, pointerEvents: 'none' }}
    >
      <motion.path
        d={path}
        stroke="url(#gradient)"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeInOut" }}
      />
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#A855F7" stopOpacity="0" />
          <stop offset="100%" stopColor="#A855F7" stopOpacity="1" />
        </linearGradient>
      </defs>
    </motion.svg>
  );
};

export function HiveInterface() {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const agents = HIVE_MIND_AGENTS;
  const radius = 300;

  const agentPositions = useMemo(() => {
    const positions: { [key: string]: { x: number, y: number } } = {};
    agents.forEach((agent, i) => {
        if (agent.id === 'orchestrator') {
            positions[agent.id] = { x: 0, y: 0 };
            return;
        }
      const angle = (i / (agents.length -1)) * 2 * Math.PI;
      positions[agent.id] = {
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle),
      };
    });
    return positions;
  }, [agents, radius]);

  const orchestrator = agents.find(a => a.id === 'orchestrator');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsProcessing(true);
    // Simulate processing time
    setTimeout(() => {
      setIsProcessing(false);
    }, 5000);
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <div className="relative flex-1 flex items-center justify-center">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="relative w-full h-full max-w-6xl max-h-6xl flex items-center justify-center">
          {/* Agent Connections */}
          <AnimatePresence>
            {isProcessing && orchestrator && agents.filter(a => a.id !== 'orchestrator').map(agent => (
              <ConnectionLine key={agent.id} start={agentPositions[orchestrator.id]} end={agentPositions[agent.id]} />
            ))}
          </AnimatePresence>

          {/* Agent Nodes */}
          {agents.map((agent) => (
            <AgentNode
              key={agent.id}
              agent={agent}
              x={agentPositions[agent.id]?.x}
              y={agentPositions[agent.id]?.y}
              isActive={isProcessing || agent.id === 'orchestrator'}
            />
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="border-t bg-background/80 backdrop-blur-sm p-4 flex-shrink-0">
        <form onSubmit={handleFormSubmit} className="max-w-3xl mx-auto flex gap-4 items-center">
          <div className="relative w-full">
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Direct your agent swarm... e.g., 'Analyze the latest market trends for electric vehicles and generate a report.'"
              className="w-full text-lg p-4 pr-16 border-2 focus-visible:ring-primary/50 resize-none bg-muted/50"
              rows={1}
            />
            {query && (
                <Button onClick={() => setQuery('')} variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8">
                    <X className="w-4 h-4" />
                </Button>
            )}
           </div>
          <Button
            type="submit"
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg px-8 py-7 shadow-lg transition-transform transform hover:scale-105"
            disabled={!query.trim() || isProcessing}
          >
            {isProcessing ? (
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                >
                    <Sparkles className="w-6 h-6" />
                </motion.div>
            ) : (
                <Send className="w-6 h-6" />
            )}
          </Button>
        </form>
        <p className="text-xs text-center text-muted-foreground mt-2">Welcome to the AGI-S Hive Mind. Your goals, amplified by a collective intelligence.</p>
      </div>
    </div>
  );
}
