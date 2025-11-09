'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GitMerge, Cpu, Search, Code, CornerDownLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-is-mobile';

type LogEntry = {
  source: string;
  message: string;
  color: string;
};

const initialLog: LogEntry[] = [
  { source: 'SYSTEM', message: 'Nexus Collective Online. Awaiting directive.', color: 'text-green-400' },
  { source: 'SYSTEM', message: 'Agents available: Coordinator, Research, Coder.', color: 'text-green-400' },
];

export function NexusInterface() {
  const [log, setLog] = useState<LogEntry[]>(initialLog);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const endOfLogRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    endOfLogRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log]);

  const addLogEntry = (entry: Omit<LogEntry, 'color'> & { color?: string }) => {
    const color = entry.color || 'text-gray-400';
    setLog(prevLog => [...prevLog, { ...entry, color }]);
  };

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const command = input;
    addLogEntry({ source: 'USER', message: command, color: 'text-cyan-400' });
    setInput('');
    setIsProcessing(true);

    // Simulate agent activity
    setTimeout(() => addLogEntry({ source: 'COORDINATOR', message: `Received directive: "${command}"`, color: 'text-yellow-400' }), 500);
    setTimeout(() => addLogEntry({ source: 'COORDINATOR', message: 'Analyzing directive and assigning tasks...', color: 'text-yellow-400' }), 1000);
    setTimeout(() => addLogEntry({ source: 'RESEARCH', message: 'Task received. Beginning data acquisition.', color: 'text-blue-400' }), 2000);
    setTimeout(() => addLogEntry({ source: 'RESEARCH', message: 'Fetching market data... [|||||-----] 50%', color: 'text-blue-400' }), 3500);
    setTimeout(() => addLogEntry({ source: 'RESEARCH', message: 'Fetching complete. Analyzing findings.', color: 'text-blue-400' }), 5000);
    setTimeout(() => addLogEntry({ source: 'CODER', message: 'Task received. Awaiting research findings to begin prototype.', color: 'text-purple-400' }), 5500);
    setTimeout(() => addLogEntry({ source: 'COORDINATOR', message: 'Research complete. Synthesizing results.', color: 'text-yellow-400' }), 6500);
    setTimeout(() => addLogEntry({ source: 'SYSTEM', message: 'Directive complete. Awaiting new directive.', color: 'text-green-400' }), 8000);
    setTimeout(() => setIsProcessing(false), 8000);
  };

  return (
    <div className="flex flex-col h-full bg-black text-green-400 font-mono crt p-2 sm:p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center border-b-2 border-green-400/50 pb-2 mb-4 text-lg">
        <div className="flex items-center gap-2">
          <GitMerge className="w-6 h-6"/>
          <h1>AGENT NEXUS</h1>
        </div>
        {!isMobile && (
          <div className="flex gap-4 text-sm md:text-base mt-2 md:mt-0">
            <span><Cpu size={18}/> CPU: 12%</span>
            <span><Search size={18}/> Research: Idle</span>
            <span><Code size={18}/> Coder: Idle</span>
          </div>
        )}
      </div>

      {/* Log Display */}
      <div className="flex-1 overflow-y-auto pr-2 sm:pr-4">
        {log.map((entry, index) => (
          <div key={index} className="flex gap-2 text-sm sm:text-base">
            <span className={cn('w-20 sm:w-24 flex-shrink-0', entry.color)}>[{entry.source}]</span>
            <p className="flex-1 break-words whitespace-pre-wrap">{entry.message}</p>
          </div>
        ))}
        {isProcessing && <div className="w-full text-center animate-pulse">[PROCESSING...]</div>}
        <div ref={endOfLogRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleCommand} className="mt-4 flex gap-2 items-center">
        <CornerDownLeft className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 flex-shrink-0" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isProcessing ? '[PROCESSING...]' : 'Enter directive...'}
          className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-base sm:text-lg"
          disabled={isProcessing}
        />
      </form>
    </div>
  );
}
