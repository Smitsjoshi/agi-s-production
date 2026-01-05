'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud, FileJson, FileSpreadsheet, Send, Loader2,
  BookCheck, MoreVertical, Trash2, Plus, Sparkles,
  Search, ShieldAlert, FileText, ChevronRight,
  MessageSquare, LayoutDashboard, BarChart3, Quote
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  generateSynthesisAction
} from '@/app/actions';
import type {
  ChatMessage,
  SynthesisOutput,
  SynthesisContentBlock,
  SynthesisInput
} from '@/lib/types';
import { nanoid } from 'nanoid';
import {
  Bar, BarChart as RechartsBarChart, ResponsiveContainer,
  XAxis, YAxis, Tooltip, Legend, Pie, PieChart, Cell
} from 'recharts';
import { ChatMessageDisplay } from '@/components/chat/chat-message';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type FileState = {
  id: string;
  name: string;
  dataType: 'csv' | 'json' | 'pdf';
  data: string;
};

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export default function SynthesisPage() {
  const [files, setFiles] = useState<FileState[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState<SynthesisOutput | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persistence
  useEffect(() => {
    const savedFiles = localStorage.getItem('synthesis_files');
    if (savedFiles) {
      try {
        setFiles(JSON.parse(savedFiles));
      } catch (e) {
        console.error("Failed to load saved files", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('synthesis_files', JSON.stringify(files));
  }, [files]);

  const processFile = (fileToProcess: File) => {
    const dataType = fileToProcess.name.endsWith('.csv') ? 'csv' : fileToProcess.name.endsWith('.json') ? 'json' : fileToProcess.name.endsWith('.pdf') ? 'pdf' : null;
    if (!dataType) {
      toast({ variant: 'destructive', title: 'Invalid File Type', description: 'Please upload a CSV, JSON, or PDF file.' });
      return;
    }

    // Check for duplicates
    if (files.some(f => f.name === fileToProcess.name)) {
      toast({ title: 'Already Exists', description: `${fileToProcess.name} is already in your sources.` });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const fileContent = e.target?.result as string;
      const newFile: FileState = {
        id: nanoid(),
        name: fileToProcess.name,
        dataType: dataType as 'csv' | 'json' | 'pdf',
        data: fileContent,
      };
      setFiles(prev => [...prev, newFile]);
      toast({ title: 'Source Added', description: `${fileToProcess.name} is ready for analysis.` });
    };

    if (dataType === 'pdf') {
      reader.readAsDataURL(fileToProcess);
    } else {
      reader.readAsText(fileToProcess);
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || files.length === 0) return;

    const userMessage: ChatMessage = { id: nanoid(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setInput('');

    try {
      const synthesisInput: SynthesisInput = {
        query: input,
        files: files.map(f => ({
          name: f.name,
          dataType: f.dataType,
          data: f.data
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
      console.error(error);
      toast({ variant: 'destructive', title: 'Intelligence Error', description: error.message || 'Failed to cross-reference data sources.' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderContentBlock = (block: SynthesisContentBlock, index: number) => {
    switch (block.type) {
      case 'text':
        return <p key={index} className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed">{block.content}</p>;
      case 'chart':
        return (
          <Card key={index} className="my-4 overflow-hidden border-primary/10 bg-primary/5">
            <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b border-primary/10">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                {block.title}
              </CardTitle>
              <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{block.chartType}</Badge>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={260}>
                {block.chartType === 'pie' ? (
                  <PieChart>
                    <Pie data={block.data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {block.data.map((entry, i) => (
                        <Cell key={`cell-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                    />
                    <Legend iconType="circle" />
                  </PieChart>
                ) : (
                  <RechartsBarChart data={block.data}>
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
                    />
                    <Legend iconType="circle" />
                    {Object.keys(block.data[0] || {}).filter(key => key !== 'name').map((key, i) => (
                      <Bar key={key} dataKey={key} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[2, 2, 0, 0]} />
                    ))}
                  </RechartsBarChart>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );
      case 'table':
        return (
          <Card key={index} className="my-4 overflow-hidden border-border bg-card">
            <CardHeader className="py-3 px-4 border-b">
              <CardTitle className="text-sm font-semibold">{block.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      {block.headers.map(header => <th key={header} className="p-2 text-left font-medium text-muted-foreground">{header}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b hover:bg-muted/30 transition-colors">
                        {row.map((cell, cellIndex) => <td key={cellIndex} className="p-2">{cell}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )
      default:
        return null;
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background">
      {/* Source Sidebar */}
      <aside className="w-80 border-r bg-muted/10 flex flex-col hidden lg:flex">
        <div className="p-4 border-b bg-background/50 backdrop-blur-md flex items-center justify-between">
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4 text-primary" />
            Data Sources
          </h2>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => fileInputRef.current?.click()}>
            <Plus className="h-4 w-4" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) processFile(file);
            }}
            accept=".csv,.json,.pdf"
          />
        </div>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            {files.length === 0 ? (
              <div className="text-center py-8">
                <UploadCloud className="h-10 w-10 mx-auto text-muted-foreground/20 mb-2" />
                <p className="text-xs text-muted-foreground">No sources uploaded yet.</p>
              </div>
            ) : (
              files.map(file => (
                <div key={file.id} className="group relative flex items-center gap-3 p-3 rounded-lg border bg-background hover:border-primary/50 transition-all cursor-pointer">
                  <div className={cn(
                    "h-8 w-8 rounded flex items-center justify-center",
                    file.dataType === 'csv' ? "bg-emerald-500/10 text-emerald-500" : "bg-blue-500/10 text-blue-500"
                  )}>
                    {file.dataType === 'csv' ? <FileSpreadsheet className="h-4 w-4" /> : file.dataType === 'json' ? <FileJson className="h-4 w-4" /> : <BookCheck className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{file.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">{file.dataType}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t bg-background/50">
          <Button className="w-full gap-2 text-xs h-9" variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Plus className="h-3.5 w-3.5" />
            Add Source
          </Button>
        </div>
      </aside>

      {/* Main Analysis Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="p-4 border-b bg-background/50 backdrop-blur-md flex items-center justify-between sticky top-0 z-10 h-14">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <div>
              <h1 className="text-sm font-bold tracking-tight">Intelligence Hub</h1>
              <p className="text-[10px] text-muted-foreground">Deep Synthesis across {files.length} sources</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px] font-mono">GROQ-SYNT-V2</Badge>
          </div>
        </header>

        <ScrollArea className="flex-1">
          <div className="max-w-4xl mx-auto p-6 space-y-8 pb-32">
            {!activeAnalysis && messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center mb-6"
                >
                  <BookCheck className="h-10 w-10 text-primary" />
                </motion.div>
                <h2 className="text-2xl font-bold tracking-tight">Intelligence Synthesis</h2>
                <p className="text-muted-foreground max-w-md mt-2">
                  Upload multiple data sources and ask questions to perform deep cross-referenced analysis.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 w-full max-w-lg">
                  <Card className="p-4 bg-muted/5 border-dashed cursor-pointer hover:bg-muted/10 transition-colors" onClick={() => setInput("What are the key trends across these sources?")}>
                    <div className="text-xs text-primary font-bold mb-1">DISCOVERY</div>
                    <p className="text-[11px] text-muted-foreground italic">"Identify top 3 cross-source trends..."</p>
                  </Card>
                  <Card className="p-4 bg-muted/5 border-dashed cursor-pointer hover:bg-muted/10 transition-colors" onClick={() => setInput("Identify any contradictions or anomalies in the data.")}>
                    <div className="text-xs text-primary font-bold mb-1">HARD-AUDIT</div>
                    <p className="text-[11px] text-muted-foreground italic">"Find contradictions or data anomalies..."</p>
                  </Card>
                </div>
              </div>
            )}

            {/* Dashboard View (Latest Analysis Stats) */}
            {activeAnalysis && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="col-span-1 md:col-span-2 bg-primary/5 border-primary/20">
                    <CardHeader className="py-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          Executive Insights
                        </CardTitle>
                        <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary text-[10px]">LATEST RUN</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {activeAnalysis.keyInsights.map((insight, idx) => (
                        <div key={idx} className="flex gap-3 text-xs">
                          <div className="h-5 w-5 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                            {idx + 1}
                          </div>
                          <p className="flex-1">{insight}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/30 border-dashed">
                    <CardHeader className="py-4">
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Quote className="h-4 w-4" />
                        Grounded Citations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {activeAnalysis.citations?.map((cite, idx) => (
                        <div key={idx} className="p-2 rounded bg-background border text-[10px] space-y-1">
                          <div className="flex items-center gap-1 font-bold text-primary">
                            <FileText className="h-3 w-3" />
                            {cite.source}
                          </div>
                          <p className="text-muted-foreground line-clamp-2">{cite.reference}</p>
                        </div>
                      ))}
                      {(!activeAnalysis.citations || activeAnalysis.citations.length === 0) && (
                        <p className="text-[10px] text-muted-foreground italic">No specific citations generated.</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <Separator />
              </motion.div>
            )}

            {/* Chat History */}
            <div className="space-y-6">
              {messages.map(msg => (
                <div key={msg.id} className={cn(
                  "flex items-start gap-4",
                  msg.role === 'user' ? "flex-row-reverse" : ""
                )}>
                  <div className={cn(
                    "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold",
                    msg.role === 'user' ? "bg-primary text-white" : "bg-muted border"
                  )}>
                    {msg.role === 'user' ? 'U' : 'AI'}
                  </div>
                  <div className={cn(
                    "flex-1 max-w-[85%]",
                    msg.role === 'user' ? "text-right" : ""
                  )}>
                    {msg.role === 'user' ? (
                      <div className="bg-primary/10 border border-primary/20 p-3 rounded-2xl rounded-tr-none text-sm inline-block">
                        {msg.content}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {msg.synthesisBlocks?.map(renderContentBlock)}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-muted border flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="h-24 w-full rounded-2xl bg-muted/50 animate-pulse" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Input Dock */}
        <div className="p-4 border-t bg-background/80 backdrop-blur-xl absolute bottom-0 left-0 right-0 z-20">
          <div className="max-w-4xl mx-auto">
            {activeAnalysis && activeAnalysis.suggestedQuestions.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                {activeAnalysis.suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(q)}
                    className="whitespace-nowrap px-3 py-1.5 rounded-full border bg-background text-[10px] hover:border-primary/50 transition-colors flex items-center gap-1.5"
                  >
                    <Search className="h-3 w-3 text-primary" />
                    {q}
                  </button>
                ))}
              </div>
            )}
            <form onSubmit={handleSubmit} className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative flex items-center gap-2 bg-background border rounded-xl p-1.5 shadow-2xl">
                <Input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={files.length > 0 ? `Ask about your ${files.length} sources...` : "Upload sources to begin..."}
                  className="border-0 focus-visible:ring-0 text-sm h-10 px-4"
                  disabled={isLoading || files.length === 0}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-10 w-10 shrink-0"
                  disabled={isLoading || !input.trim() || files.length === 0}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </form>
            <div className="pt-2 flex items-center justify-between text-[10px] text-muted-foreground px-2">
              <div className="flex items-center gap-1">
                <ShieldAlert className="h-3 w-3" />
                Analysis is grounded in provided sources.
              </div>
              <div>
                Press Enter to execute synthesis
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Drawer (Hidden for now) */}
    </div>
  );
}
