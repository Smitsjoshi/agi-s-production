'use client';

import React, { useState, useEffect } from 'react';
import { Cpu, Send, Loader2, Search, Globe, Star, Github, BookOpen as BookOpenIcon, Settings, ArrowRight, ShoppingBag, BookOpen, BarChart3, Library, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { askAi } from '@/app/actions';
import type { LiveWebAgentOutput, SearchResult } from '@/lib/types';
import { motion } from 'framer-motion';

// CORRECTED SearchResultCard to be a proper clickable link
const SearchResultCard = ({ result }: { result: SearchResult }) => {
    // Safely create a URL object to extract the hostname
    let hostname = 'source';
    try {
        hostname = new URL(result.url).hostname;
    } catch (e) {
        console.error('Invalid URL:', result.url);
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4"
        >
            <a 
                href={result.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group block bg-muted/30 border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
                <div className="flex items-center text-sm text-muted-foreground">
                    <Globe className="w-4 h-4 mr-2" />
                    <span>{hostname}</span>
                </div>
                <h3 className="text-blue-500 group-hover:underline text-xl font-medium mt-1">{result.title}</h3>
                {result.snippet && <p className="text-sm text-neutral-400 mt-1">{result.snippet}</p>}
            </a>
        </motion.div>
    );
};


// Skeleton loader for when the agent is working
const ProposalSkeleton = () => (
    <div className="space-y-4">
        <div className="prose prose-sm dark:prose-invert max-w-none">
            <div className="h-6 bg-muted/50 rounded w-1/4 animate-pulse mb-4"></div>
            <div className="h-4 bg-muted/50 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-muted/50 rounded w-5/6 animate-pulse mt-2"></div>
        </div>
        <div className="border-t pt-6">
             <div className="h-6 bg-muted/50 rounded w-1/3 animate-pulse mb-4"></div>
            {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-muted/20 border rounded-lg p-4 mb-4">
                    <div className="h-4 bg-muted/50 rounded w-1/4 animate-pulse mb-3"></div>
                    <div className="h-6 bg-muted/50 rounded w-3/4 animate-pulse mb-3"></div>
                    <div className="h-4 bg-muted/50 rounded w-full animate-pulse"></div>
                </div>
            ))}
        </div>
    </div>
);

export function LiveWebAgentInterface() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agentOutput, setAgentOutput] = useState<LiveWebAgentOutput | null>(null);
  const [currentGoal, setCurrentGoal] = useState('');
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const presets = [
    { name: 'Shopping', icon: ShoppingBag, example: 'Buy me green Nike shoes from Amazon, size 9, price < ₹6,000.' },
    { name: 'Research', icon: Library, example: 'Find the latest research papers on swarm intelligence.' },
    { name: 'Compare', icon: BarChart3, example: 'Compare the new Macbook Pro M3 with the Dell XPS 15.' },
    { name: 'Book', icon: BookOpen, example: 'Book a flight from New York to London for next week.' },
  ];

  const handleSubmit = async (e: React.FormEvent, presetQuery?: string) => {
    e.preventDefault();
    const finalQuery = presetQuery || query;
    if (!finalQuery.trim()) return;

    setCurrentGoal(finalQuery);
    setIsLoading(true);
    setAgentOutput(null);
    setQuery('');

    try {
      const result: LiveWebAgentOutput = await askAi(finalQuery, 'Canvas', []);
      setAgentOutput(result);

    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'The AI agent failed its task. This can happen due to website restrictions or complex navigation. Please try a simpler goal.',
      });
       // Reset to initial state on error
      setCurrentGoal('');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNewConversation = () => {
      setAgentOutput(null);
      setCurrentGoal('');
      setQuery('');
  }

  if (!isClient) {
    return <div className="h-full w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col items-center p-4">
        <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col">
            {/* Browser Header */}
            <div className="bg-muted border border-b-0 border-border rounded-t-xl shadow-2xl flex-shrink-0">
                <div className="h-11 px-4 flex items-center gap-2 border-b border-border">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="flex-1 ml-4 bg-background h-7 rounded-md flex items-center px-3">
                        <Search className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm text-foreground ml-2 truncate">
                            {isLoading ? `Agent is working on: "${currentGoal}"` : (agentOutput?.summary || currentGoal || 'Ready for new goal...')}
                        </p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNewConversation} title="Start New Goal">
                        <Cpu className="h-4 w-4" />
                    </Button>
                </div>
                 <div className="h-10 px-2 flex items-center gap-1 border-b border-border">
                    <Button variant="ghost" size="sm" className="h-8"><Star className="mr-2 h-4 w-4" /> Bookmarks</Button>
                    <Button variant="ghost" size="sm" className="h-8"><Github className="mr-2 h-4 w-4" /> GitHub</Button>
                    <Button variant="ghost" size="sm" className="h-8"><BookOpenIcon className="mr-2 h-4 w-4" /> Wikipedia</Button>
                </div>
            </div>

            {/* Browser Content */}
            <div className="bg-background border border-t-0 border-border rounded-b-xl p-4 sm:p-8 flex-1 overflow-y-auto">
                 {isLoading ? (
                    <ProposalSkeleton />
                ) : agentOutput ? (
                    <div className="space-y-6">
                        <div>
                            <h2 className="font-headline text-2xl font-bold text-foreground mb-4">Agent's Summary</h2>
                            <p className="prose prose-sm dark:prose-invert max-w-none text-foreground">{agentOutput.summary}</p>
                        </div>
                        <div className="border-t pt-6">
                            <h3 className="font-headline text-xl font-semibold text-foreground mb-4">Action Proposals</h3>
                            {agentOutput.results?.length > 0 ? (
                                agentOutput.results.map((result, index) => (
                                    <SearchResultCard key={result.url || index} result={result} />
                                ))
                            ) : (
                                <p className='text-muted-foreground'>The agent did not find any specific web pages to recommend.</p>
                            )}
                        </div>
                    </div>
                ) : (
                    // A. Live Web Action Input Card (Initial View)
                    <div className="flex flex-col items-center justify-center h-full">
                         <div className="bg-background border rounded-xl shadow-lg p-6 w-full max-w-3xl">
                            <form onSubmit={handleSubmit}>
                                <Textarea
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Buy me green Nike shoes from Amazon, size 9, price < ₹6,000."
                                    className="w-full h-32 text-lg p-4 border-2 focus-visible:ring-primary/50 resize-none bg-muted/20"
                                    disabled={isLoading}
                                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }}}
                                />
                                <div className="mt-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {presets.map(preset => (
                                            <Button key={preset.name} type="button" variant="outline" size="sm" className="flex items-center gap-2" onClick={(e) => handleSubmit(e, preset.example)} disabled={isLoading}>
                                                <preset.icon className="w-4 h-4" />
                                                {preset.name}
                                            </Button>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button type="button" variant="ghost" size="icon" disabled={isLoading}>
                                            <Settings className="w-5 h-5" />
                                        </Button>
                                        <Button 
                                            type="submit"
                                            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-base px-6 py-3 rounded-lg shadow-md disabled:bg-muted disabled:text-muted-foreground"
                                            disabled={!query.trim() || isLoading}
                                        >
                                            Execute Task
                                            <ArrowRight className="w-5 h-5 ml-2" />
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}
