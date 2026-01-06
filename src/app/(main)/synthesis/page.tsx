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
  scrapeWebPage,
  generateAudioOverviewAction,
  generateVideoOverviewAction,
  generateMindMapAction,
  generateFlashcardsAction,
  generateQuizAction,
  generateInfographicAction,
  generateSlideDeckAction,
  generateReportAction,
  generateCriticalAnalysisAction,
  generateExecutiveSummaryAction
} from '@/app/actions';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type {
  ChatMessage,
  SynthesisOutput,
  Source,
  SourceType,
  AudioOverview,
  VideoOverview,
  MindMap,
  FlashcardDeck,
  Quiz,
  Infographic,
  SlideDeck,
  Report
} from '@/lib/types';
import { nanoid } from 'nanoid';
import { ChatMessageDisplay } from '@/components/chat/chat-message';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const EnhancedMarkdown = ({ content = '' }: { content: string }) => {
  const processedContent = content.replace(/<br\s*\/?>/gi, '\n');
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:mb-4">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};

export default function SynthesisPage() {
  const { toast } = useToast();
  const [sources, setSources] = useState<Source[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState<SynthesisOutput | null>(null);
  const [showSourceInput, setShowSourceInput] = useState<SourceType | null>(null);
  const [sourceUrl, setSourceUrl] = useState('');

  // Studio Results State
  const [studioResult, setStudioResult] = useState<{
    type: string;
    data: any;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

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

  // Studio feature handlers
  const handleStudioFeature = async (feature: string) => {
    if (sources.length === 0) return;

    setIsGenerating(feature);
    try {
      const sourcePayload = sources.map(s => ({ name: s.name, content: s.content }));
      let result;

      switch (feature) {
        case 'Audio Overview':
          result = await generateAudioOverviewAction(sourcePayload);
          break;
        case 'Video Overview':
          result = await generateVideoOverviewAction(sourcePayload);
          break;
        case 'Mind Map':
          result = await generateMindMapAction(sourcePayload);
          break;
        case 'Flashcards':
          result = await generateFlashcardsAction(sourcePayload);
          break;
        case 'Quiz':
          result = await generateQuizAction(sourcePayload);
          break;
        case 'Infographic':
          result = await generateInfographicAction(sourcePayload);
          break;
        case 'Slide Deck':
          result = await generateSlideDeckAction(sourcePayload);
          break;
        case 'Reports':
          result = await generateReportAction(sourcePayload);
          break;
        case 'Critical Analysis':
          result = await generateCriticalAnalysisAction(sourcePayload);
          break;
        case 'Executive Summary':
          result = await generateExecutiveSummaryAction(sourcePayload);
          break;
      }

      if (result && result.success) {
        setStudioResult({ type: feature, data: result.data });
        toast({ title: 'Success', description: `${feature} generated successfully.` });
      } else {
        throw new Error(result?.error || 'Failed to generate content');
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsGenerating(null);
    }
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
    <div className="h-screen flex bg-background overflow-hidden">
      {/* LEFT SIDEBAR - Sources */}
      <div className="w-[300px] border-r flex flex-col min-h-0 bg-muted/20 backdrop-blur-sm">
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
      <div className="flex-1 flex flex-col min-h-0 bg-card/5">
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

      {/* STUDIO RESULT VIEWER OVERLAY */}
      <AnimatePresence>
        {studioResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background border rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b flex items-center justify-between bg-muted/50">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h2 className="font-bold text-lg">{studioResult.type}</h2>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setStudioResult(null)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <ScrollArea className="flex-1 p-6">
                <StudioResultDisplay result={studioResult} />
              </ScrollArea>

              <div className="p-4 border-t bg-muted/30 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setStudioResult(null)}>Close</Button>
                <Button onClick={() => window.print()}>Export PDF</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RIGHT SIDEBAR - Studio */}
      <div className="w-[320px] border-l flex flex-col min-h-0 bg-muted/30 backdrop-blur-sm shadow-inner">
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
                  disabled={sources.length === 0 || !!isGenerating}
                >
                  {isGenerating === 'Audio Overview' ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
                  ) : 'Create Audio Overview'}
                </Button>
              </div>
            </Card>

            {/* Feature Grid */}
            <div className="grid grid-cols-2 gap-2">
              <StudioCard
                icon={<Film className="h-4 w-4" />}
                title="Video Overview"
                onClick={() => handleStudioFeature('Video Overview')}
                disabled={sources.length === 0 || !!isGenerating}
                loading={isGenerating === 'Video Overview'}
              />
              <StudioCard
                icon={<Map className="h-4 w-4" />}
                title="Mind Map"
                onClick={() => handleStudioFeature('Mind Map')}
                disabled={sources.length === 0 || !!isGenerating}
                loading={isGenerating === 'Mind Map'}
              />
              <StudioCard
                icon={<FileBarChart className="h-4 w-4" />}
                title="Reports"
                onClick={() => handleStudioFeature('Reports')}
                disabled={sources.length === 0 || !!isGenerating}
                loading={isGenerating === 'Reports'}
              />
              <StudioCard
                icon={<CreditCard className="h-4 w-4" />}
                title="Flashcards"
                onClick={() => handleStudioFeature('Flashcards')}
                disabled={sources.length === 0 || !!isGenerating}
                loading={isGenerating === 'Flashcards'}
              />
              <StudioCard
                icon={<HelpCircle className="h-4 w-4" />}
                title="Quiz"
                onClick={() => handleStudioFeature('Quiz')}
                disabled={sources.length === 0 || !!isGenerating}
                loading={isGenerating === 'Quiz'}
              />
              <StudioCard
                icon={<BarChart3 className="h-4 w-4" />}
                title="Infographic"
                onClick={() => handleStudioFeature('Infographic')}
                disabled={sources.length === 0 || !!isGenerating}
                loading={isGenerating === 'Infographic'}
              />
              <StudioCard
                icon={<Presentation className="h-4 w-4" />}
                title="Slide Deck"
                onClick={() => handleStudioFeature('Slide Deck')}
                disabled={sources.length === 0 || !!isGenerating}
                loading={isGenerating === 'Slide Deck'}
              />
              <StudioCard
                icon={<BookOpen className="h-4 w-4" />}
                title="Critique"
                onClick={() => handleStudioFeature('Critical Analysis')}
                disabled={sources.length === 0 || !!isGenerating}
                loading={isGenerating === 'Critical Analysis'}
              />
              <StudioCard
                icon={<FileText className="h-4 w-4" />}
                title="Summary"
                onClick={() => handleStudioFeature('Executive Summary')}
                disabled={sources.length === 0 || !!isGenerating}
                loading={isGenerating === 'Executive Summary'}
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

// Studio Result Display Component
function StudioResultDisplay({ result }: { result: { type: string, data: any } }) {
  const { type, data } = result;

  switch (type) {
    case 'Audio Overview':
      return (
        <div className="space-y-6">
          <Card className="p-8 bg-gradient-to-br from-primary/5 to-purple-500/5 text-center border-primary/20 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Mic className="h-32 w-32" />
            </div>
            <div className="flex flex-col items-center gap-6 relative z-10 transition-all duration-700">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center shadow-lg shadow-primary/20 animate-pulse">
                <Mic className="h-10 w-10 text-primary-foreground" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-2xl tracking-tight">Living Discussion</h3>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest opacity-80">Jordan & Taylor Synthesis</p>
              </div>

              <div className="flex items-center gap-4 w-full justify-center mt-2">
                <Button
                  size="lg"
                  className="rounded-full px-8 bg-primary hover:scale-105 transition-transform"
                  onClick={() => {
                    const utter = new SpeechSynthesisUtterance(data.script);
                    utter.rate = 0.9;
                    utter.pitch = 1.0;
                    window.speechSynthesis.speak(utter);
                  }}
                >
                  <Plus className="h-5 w-5 mr-2 rotate-45" /> Start Discussion
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-8"
                  onClick={() => window.speechSynthesis.cancel()}
                >
                  Stop
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground italic">Note: Using browser-native synthesis for low-latency feedback</p>
            </div>
          </Card>
          <div className="space-y-4">
            <h4 className="font-bold text-lg flex items-center gap-2 text-primary/80">
              <FileText className="h-5 w-5" />
              Intelligence Transcript
            </h4>
            <div className="p-6 border rounded-xl bg-card/60 backdrop-blur-sm whitespace-pre-wrap leading-relaxed text-sm shadow-inner italic text-muted-foreground border-primary/10">
              {data.script}
            </div>
          </div>
        </div>
      );

    case 'Mind Map':
      return (
        <div className="space-y-6">
          <div className="p-4 border rounded-lg bg-card font-mono text-xs overflow-auto max-h-[300px]">
            <pre>{data.mermaidSyntax}</pre>
          </div>
          <div className="grid gap-4">
            <MindMapNodeDisplay node={data.rootNode} />
          </div>
        </div>
      );

    case 'Flashcards':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.cards.map((card: any) => (
            <div key={card.id} className="group h-48 [perspective:1000px]">
              <div className="relative h-full w-full rounded-xl transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] border bg-card">
                <div className="absolute inset-0 flex items-center justify-center p-6 text-center [backface-visibility:hidden]">
                  <p className="font-medium">{card.front}</p>
                </div>
                <div className="absolute inset-0 h-full w-full rounded-xl bg-primary/10 p-6 text-center [transform:rotateY(180deg)] [backface-visibility:hidden] flex items-center justify-center">
                  <p className="text-sm">{card.back}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      );

    case 'Quiz':
      return (
        <div className="space-y-8">
          {data.questions.map((q: any, i: number) => (
            <div key={q.id} className="space-y-4 p-4 border rounded-lg">
              <p className="font-bold">{i + 1}. {q.question}</p>
              <div className="grid grid-cols-1 gap-2">
                {q.options.map((opt: string, optIdx: number) => (
                  <Button
                    key={optIdx}
                    variant="outline"
                    className="justify-start h-auto py-2 px-4 whitespace-normal text-left"
                  >
                    {opt}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      );

    case 'Infographic':
      return (
        <div className="space-y-6">
          <img src={data.imageUrl} alt={data.title} className="w-full rounded-xl shadow-lg border" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.dataPoints.map((dp: any, i: number) => (
              <Card key={i} className="p-4 flex flex-col items-center text-center">
                <Badge className="mb-2">{dp.type}</Badge>
                <div className="text-2xl font-bold text-primary mb-1">{dp.value}</div>
                <div className="text-xs text-muted-foreground">{dp.label}</div>
              </Card>
            ))}
          </div>
        </div>
      );

    case 'Critical Analysis':
    case 'Executive Summary':
    case 'Reports':
      return (
        <div className="prose prose-sm dark:prose-invert max-w-none animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl font-extrabold mb-6 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">{data.title}</h1>
          <section className="mb-10 p-8 bg-primary/5 border border-primary/10 rounded-2xl shadow-inner">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Key Insight Summary
            </h2>
            <p className="text-lg leading-relaxed text-foreground/80">{data.executiveSummary}</p>
          </section>
          <div className="space-y-12">
            {data.sections.map((section: any, i: number) => (
              <section key={i} className="group transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-1px flex-1 bg-gradient-to-r from-primary/20 to-transparent" />
                  <h3 className="text-2xl font-bold whitespace-nowrap">{section.heading}</h3>
                  <div className="h-1px flex-1 bg-gradient-to-l from-primary/20 to-transparent" />
                </div>
                <div className="p-4 rounded-xl border border-transparent group-hover:bg-primary/5 group-hover:border-primary/5 transition-all">
                  <EnhancedMarkdown content={section.content} />
                </div>
              </section>
            ))}
          </div>
        </div>
      );

    case 'Slide Deck':
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">{data.title}</h2>
          <div className="space-y-4">
            {data.slides.map((slide: any, i: number) => (
              <Card key={i} className="p-8 aspect-video border-2 flex flex-col justify-center bg-muted/20 relative overflow-hidden">
                <div className="absolute top-4 right-4 text-muted-foreground text-sm">Slide {i + 1}</div>
                <h3 className="text-2xl font-bold mb-6 text-center border-b pb-4">{slide.title}</h3>
                <ul className="list-disc pl-6 space-y-3">
                  {slide.content.map((point: string, j: number) => (
                    <li key={j} className="text-lg">{point}</li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      );

    case 'Video Overview':
      return (
        <div className="space-y-6">
          <div className="aspect-video relative rounded-xl overflow-hidden border shadow-xl">
            <img src={data.thumbnailUrl} alt="Video Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group hover:bg-black/40 transition-colors">
              <Button size="lg" className="rounded-full h-16 w-16">
                <Video className="h-8 w-8" />
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            {data.slides.map((s: any, i: number) => (
              <div key={i} className="flex gap-4 p-3 border rounded-lg">
                <div className="font-bold text-primary">{s.timestamp}s</div>
                <div>
                  <div className="font-bold">{s.title}</div>
                  <ul className="text-sm text-muted-foreground list-disc pl-4">
                    {s.content.map((p: string, j: number) => <li key={j}>{p}</li>)}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )

    default:
      return <div>Feature display not implemented yet.</div>;
  }
}

function MindMapNodeDisplay({ node, depth = 0 }: { node: any, depth?: number }) {
  return (
    <div style={{ marginLeft: `${depth * 20}px` }} className="space-y-2">
      <div className="p-2 border rounded bg-card flex items-center gap-2">
        <Badge variant="outline">{node.level}</Badge>
        <span className="font-medium">{node.label}</span>
      </div>
      {node.children && node.children.map((child: any) => (
        <MindMapNodeDisplay key={child.id || child.label} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

// Studio Card Component
function StudioCard({
  icon,
  title,
  onClick,
  disabled,
  loading
}: {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "p-3 rounded-lg border bg-card hover:bg-accent transition-colors text-left relative overflow-hidden",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        loading && "animate-pulse"
      )}
    >
      <div className="flex flex-col gap-1">
        <div className="text-primary">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
        </div>
        <span className="text-[10px] font-medium leading-tight">{title}</span>
      </div>
    </button>
  );
}
