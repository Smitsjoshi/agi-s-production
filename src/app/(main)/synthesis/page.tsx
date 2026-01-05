'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Upload, FileText, Video, Globe, Plus, X, Send, Loader2,
  Mic, Film, Map, FileBarChart, CreditCard, HelpCircle,
  BarChart3, Presentation, StickyNote, Sparkles, BookOpen
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  generateSynthesisAction,
  extractYouTubeTranscript,
  scrapeWebPage
} from '@/app/actions';
import type {
  ChatMessage,
  SynthesisOutput,
  Source,
  SourceType
} from '@/lib/types';
import { nanoid } from 'nanoid';
import { ChatMessageDisplay } from '@/components/chat/chat-message';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function SynthesisPage() {
  const { toast } = useToast();
  const [sources, setSources] = useState<Source[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState<SynthesisOutput | null>(null);
  const [showSourceInput, setShowSourceInput] = useState<SourceType | null>(null);
  const [sourceUrl, setSourceUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add source handlers
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const type: SourceType = file.name.endsWith('.pdf') ? 'pdf' :
        file.name.endsWith('.csv') ? 'csv' : 'json';

      const newSource: Source = {
        id: nanoid(),
        type,
        name: file.name,
        content,
        addedAt: new Date()
      };

      setSources(prev => [...prev, newSource]);
      toast({ title: 'Source Added', description: `${file.name} added successfully` });
    };

    if (file.name.endsWith('.pdf')) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  };

  const handleYouTubeAdd = async () => {
    if (!sourceUrl) return;
    setIsLoading(true);

    try {
      const result = await extractYouTubeTranscript(sourceUrl);
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to extract transcript');
      }

      const videoIdMatch = sourceUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
      const videoId = videoIdMatch?.[1] || 'video';

      const newSource: Source = {
        id: nanoid(),
        type: 'youtube',
        name: `YouTube: ${videoId}`,
        url: sourceUrl,
        content: result.data,
        metadata: { videoId },
        addedAt: new Date()
      };

      setSources(prev => [...prev, newSource]);
      toast({ title: 'YouTube Added', description: 'Transcript extracted successfully' });
      setSourceUrl('');
      setShowSourceInput(null);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWebAdd = async () => {
    if (!sourceUrl) return;
    setIsLoading(true);

    try {
      const result = await scrapeWebPage(sourceUrl);
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to scrape page');
      }

      const urlObj = new URL(sourceUrl);
      const newSource: Source = {
        id: nanoid(),
        type: 'web',
        name: `Web: ${urlObj.hostname}`,
        url: sourceUrl,
        content: result.data,
        addedAt: new Date()
      };

      setSources(prev => [...prev, newSource]);
      toast({ title: 'Web Page Added', description: 'Content extracted successfully' });
      setSourceUrl('');
      setShowSourceInput(null);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const removeSource = (id: string) => {
    setSources(prev => prev.filter(s => s.id !== id));
  };

  // Chat handler
  const handleSubmit = async () => {
    if (!inputValue.trim() || sources.length === 0) return;

    const userMessage: ChatMessage = {
      id: nanoid(),
      role: 'user',
      content: inputValue,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const synthesisInput = {
        query: inputValue,
        files: sources.map(s => ({
          name: s.name,
          dataType: s.type === 'pdf' ? 'pdf' as const : s.type === 'csv' ? 'csv' as const : 'json' as const,
          data: s.content
        }))
      };

      const result = await generateSynthesisAction(synthesisInput);

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Unknown synthesis error');
      }

      const assistantMessage: ChatMessage = {
        id: nanoid(),
        role: 'assistant',
        content: '',
        synthesisBlocks: result.data.content,
      };

      setMessages(prev => [...prev, assistantMessage]);
      setActiveAnalysis(result.data);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Studio feature handlers (placeholders for now)
  const handleStudioFeature = (feature: string) => {
    toast({
      title: `${feature} Coming Soon`,
      description: 'This feature is being implemented with full AI capabilities'
    });
  };

  const getSourceIcon = (type: SourceType) => {
    switch (type) {
      case 'pdf': return <FileText className="h-4 w-4" />;
      case 'youtube': return <Video className="h-4 w-4" />;
      case 'web': return <Globe className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="h-screen flex bg-background">
      {/* LEFT SIDEBAR - Sources */}
      <div className="w-[300px] border-r flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Sources</h2>
            <Button size="sm" variant="ghost" onClick={() => setShowSourceInput(null)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Add Source Buttons */}
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.csv,.json"
              onChange={handleFileUpload}
            />

            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => setShowSourceInput('youtube')}
            >
              <Video className="h-4 w-4 mr-2" />
              YouTube URL
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => setShowSourceInput('web')}
            >
              <Globe className="h-4 w-4 mr-2" />
              Web Page
            </Button>
          </div>

          {/* URL Input */}
          {showSourceInput && (
            <div className="mt-3 space-y-2">
              <Input
                placeholder={showSourceInput === 'youtube' ? 'YouTube URL' : 'Web Page URL'}
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    showSourceInput === 'youtube' ? handleYouTubeAdd() : handleWebAdd();
                  }
                }}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={showSourceInput === 'youtube' ? handleYouTubeAdd : handleWebAdd}
                  disabled={isLoading}
                >
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowSourceInput(null);
                    setSourceUrl('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Sources List */}
        <ScrollArea className="flex-1 p-4">
          {sources.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-8">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>No sources added yet</p>
              <p className="text-xs mt-1">Add PDFs, YouTube videos, or web pages</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sources.map(source => (
                <motion.div
                  key={source.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group relative p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <div className={cn(
                      "p-2 rounded",
                      source.type === 'pdf' && "bg-red-500/10 text-red-500",
                      source.type === 'youtube' && "bg-blue-500/10 text-blue-500",
                      source.type === 'web' && "bg-green-500/10 text-green-500"
                    )}>
                      {getSourceIcon(source.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{source.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{source.type}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeSource(source.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* CENTER - Chat */}
      <div className="flex-1 flex flex-col">
        {sources.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <Sparkles className="h-16 w-16 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold mb-2">Add a source to get started</h2>
              <p className="text-muted-foreground">
                Upload PDFs, add YouTube videos, or paste web URLs to begin your research
              </p>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 p-6">
              <div className="max-w-3xl mx-auto space-y-4">
                {messages.map(msg => (
                  <ChatMessageDisplay key={msg.id} message={msg} />
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Analyzing sources...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="border-t p-4">
              <div className="max-w-3xl mx-auto flex gap-2">
                <Input
                  placeholder="Ask anything about your sources..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
                  disabled={isLoading}
                />
                <Button onClick={handleSubmit} disabled={isLoading || !inputValue.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* RIGHT SIDEBAR - Studio */}
      <div className="w-[320px] border-l flex flex-col bg-muted/30">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Studio</h2>
          <p className="text-xs text-muted-foreground mt-1">AI-powered tools</p>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {/* Hero Card */}
            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Mic className="h-5 w-5 text-purple-500" />
                  <h3 className="font-semibold">Audio Overview</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Generate a podcast-style discussion of your sources
                </p>
                <Button
                  size="sm"
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
                  onClick={() => handleStudioFeature('Audio Overview')}
                  disabled={sources.length === 0}
                >
                  Create Audio Overview
                </Button>
              </div>
            </Card>

            {/* Feature Grid */}
            <div className="grid grid-cols-2 gap-2">
              <StudioCard
                icon={<Film className="h-4 w-4" />}
                title="Video Overview"
                onClick={() => handleStudioFeature('Video Overview')}
                disabled={sources.length === 0}
              />
              <StudioCard
                icon={<Map className="h-4 w-4" />}
                title="Mind Map"
                onClick={() => handleStudioFeature('Mind Map')}
                disabled={sources.length === 0}
              />
              <StudioCard
                icon={<FileBarChart className="h-4 w-4" />}
                title="Reports"
                onClick={() => handleStudioFeature('Reports')}
                disabled={sources.length === 0}
              />
              <StudioCard
                icon={<CreditCard className="h-4 w-4" />}
                title="Flashcards"
                onClick={() => handleStudioFeature('Flashcards')}
                disabled={sources.length === 0}
              />
              <StudioCard
                icon={<HelpCircle className="h-4 w-4" />}
                title="Quiz"
                onClick={() => handleStudioFeature('Quiz')}
                disabled={sources.length === 0}
              />
              <StudioCard
                icon={<BarChart3 className="h-4 w-4" />}
                title="Infographic"
                onClick={() => handleStudioFeature('Infographic')}
                disabled={sources.length === 0}
              />
              <StudioCard
                icon={<Presentation className="h-4 w-4" />}
                title="Slide Deck"
                onClick={() => handleStudioFeature('Slide Deck')}
                disabled={sources.length === 0}
              />
            </div>

            {/* Add Note Button */}
            <Button variant="outline" className="w-full" disabled={sources.length === 0}>
              <StickyNote className="h-4 w-4 mr-2" />
              Add note
            </Button>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

// Studio Card Component
function StudioCard({
  icon,
  title,
  onClick,
  disabled
}: {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "p-3 rounded-lg border bg-card hover:bg-accent transition-colors text-left",
        "disabled:opacity-50 disabled:cursor-not-allowed"
      )}
    >
      <div className="flex flex-col gap-1">
        <div className="text-primary">{icon}</div>
        <span className="text-xs font-medium">{title}</span>
      </div>
    </button>
  );
}
