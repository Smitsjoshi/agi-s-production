'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SimulationEngine, TimelineEvent } from '@/lib/continuum/simulation-engine';
import { Loader2, RefreshCcw } from 'lucide-react';

export default function ContinuumPage() {
  const [events, setEvents] = useState<TimelineEvent[]>([
    { year: 1969, title: "Moon Landing", description: "Apollo 11 lands on the moon.", intensity: 8, type: 'discovery' },
    { year: 1991, title: "WWW Created", description: "Tim Berners-Lee releases the web.", intensity: 9, type: 'discovery' },
    { year: 2023, title: "AGI Awakening", description: "First autonomous agents emerge.", intensity: 10, type: 'discovery' },
  ]);
  const [loading, setLoading] = useState(false);

  const handleDivergence = async (index: number) => {
    setLoading(true);
    const event = events[index];
    const newTimeline = await SimulationEngine.simulateTimelineChange(events, event.year, "A Time Traveler interfered here.");
    setEvents(newTimeline);
    setLoading(false);
  };

  return (
    <div className="h-full w-full p-8 overflow-y-auto bg-black text-white">
      <h1 className="text-4xl font-light mb-8 tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">CONTINUUM // CHRONOS</h1>

      <div className="relative border-l-2 border-white/20 ml-8 space-y-12 pb-24">
        {events.map((event, i) => (
          <div key={i} className="relative pl-8 group">
            <div className="absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-blue-500 ring-4 ring-black group-hover:bg-purple-500 transition-colors cursor-pointer"
              onClick={() => handleDivergence(i)}
            />
            <div className="flex items-baseline gap-4">
              <span className="text-2xl font-mono text-blue-400">{event.year}</span>
              <h3 className="text-xl font-bold">{event.title}</h3>
            </div>
            <p className="text-white/60 mt-2 max-w-xl">{event.description}</p>

            <Button
              variant="ghost"
              size="sm"
              className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity text-purple-400 hover:text-purple-300 hover:bg-purple-900/20"
              onClick={() => handleDivergence(i)}
            >
              <RefreshCcw className="w-4 h-4 mr-2" /> Diverge Timeline
            </Button>
          </div>
        ))}
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
            <p className="text-purple-300 font-mono animate-pulse">REWRITING CAUSALITY...</p>
          </div>
        </div>
      )}
    </div>
  );
}
