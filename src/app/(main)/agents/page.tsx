'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlusCircle, Search, Star, Clock, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { AgentCard } from '@/components/agents/agent-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Agent } from '@/lib/types';
import { agentCategories } from '@/lib/agents';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { AGENT_TEMPLATES } from '@/lib/agent-templates';
import { ErrorBoundary } from '@/components/error-boundary';
import { CardSkeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';

export default function AgentsPage() {
  const [customAgents, setCustomAgents] = useState<Agent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'recent' | 'usage'>('name');
  const [isLoading, setIsLoading] = useState(true);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const router = useRouter();

  // Load custom agents from localStorage
  useEffect(() => {
    const saved = storage.get<Agent[]>(STORAGE_KEYS.CUSTOM_AGENTS, []);
    setCustomAgents(saved);
    setIsLoading(false);
  }, []);

  // Save custom agents to localStorage
  const saveAgents = (agents: Agent[]) => {
    storage.set(STORAGE_KEYS.CUSTOM_AGENTS, agents);
    setCustomAgents(agents);
  };

  // Create agent from template
  const createFromTemplate = (template: typeof AGENT_TEMPLATES[0]) => {
    const newAgent: Agent = {
      ...template,
      id: nanoid(),
      isCustom: true,
      createdAt: Date.now(),
      usageCount: 0,
    };
    const updated = [newAgent, ...customAgents];
    saveAgents(updated);
    setTemplateDialogOpen(false);
    router.push(`/agents/${newAgent.id}`);
  };

  // Get all agents (built-in + custom)
  const allBuiltInAgents = Object.values(agentCategories).flat();
  const allAgents = [...customAgents, ...allBuiltInAgents];

  // Filter agents
  const filteredAgents = allAgents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort agents
  const sortedAgents = [...filteredAgents].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'recent':
        return (b.lastUsed ?? 0) - (a.lastUsed ?? 0);
      case 'usage':
        return (b.usageCount ?? 0) - (a.usageCount ?? 0);
      default:
        return 0;
    }
  });

  // Separate favorites
  const favoriteAgents = sortedAgents.filter(a => a.isFavorite === true);
  const regularAgents = sortedAgents.filter(a => !a.isFavorite);

  return (
    <ErrorBoundary>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-headline text-3xl font-bold">Meet the Agents</h1>
            <p className="text-muted-foreground">
              Interact with specialized AI agents or create your own.
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Use Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Agent Templates</DialogTitle>
                  <DialogDescription>
                    Choose a pre-configured agent template to get started quickly
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="grid gap-3">
                    {AGENT_TEMPLATES.map((template, index) => (
                      <Card
                        key={index}
                        className="cursor-pointer hover:border-primary transition-colors"
                        onClick={() => createFromTemplate(template)}
                      >
                        <CardContent className="p-4 flex items-start gap-3">
                          <div className="text-3xl">{template.avatar}</div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{template.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {template.description}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
            <Link href="/agents/new">
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Agent
              </Button>
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="recent">Recently Used</SelectItem>
              <SelectItem value="usage">Most Used</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Favorites Section */}
        {favoriteAgents.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <h2 className="font-headline text-2xl font-bold">Favorites</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favoriteAgents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          </div>
        )}

        {/* Custom Agents Section */}
        {customAgents.length > 0 && (
          <div>
            <h2 className="font-headline text-2xl font-bold mb-4">Your Custom Agents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <Card className="flex flex-col items-center justify-center p-6 border-dashed hover:border-primary hover:bg-muted/50 transition-colors">
                <Link href="/agents/new" className="text-center">
                  <PlusCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h2 className="mt-4 font-headline text-lg font-semibold">Create New Agent</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Build a custom AI assistant</p>
                </Link>
              </Card>
              {customAgents
                .filter(agent => !agent.isFavorite)
                .filter(agent =>
                  agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  agent.description.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((agent) => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
            </div>
          </div>
        )}

        {/* Built-in Agents by Category */}
        {Object.entries(agentCategories).map(([category, agents]) => {
          const filteredCategoryAgents = agents.filter(agent =>
            agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            agent.description.toLowerCase().includes(searchQuery.toLowerCase())
          );

          if (filteredCategoryAgents.length === 0) return null;

          return (
            <div key={category}>
              <h2 className="font-headline text-2xl font-bold mb-4">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCategoryAgents.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>
            </div>
          );
        })}

        {/* No Results */}
        {sortedAgents.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
            <p className="mt-4 text-muted-foreground">No agents found matching "{searchQuery}"</p>
            <Button variant="outline" className="mt-4" onClick={() => setSearchQuery('')}>
              Clear Search
            </Button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
