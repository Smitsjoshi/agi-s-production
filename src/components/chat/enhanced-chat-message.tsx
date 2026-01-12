/**
 * Enhanced Chat Message with Killer Features:
 * 1. Multi-Perspective Answers
 * 2. Web Search Integration
 * 3. Refinement Slider
 * 4. Visual Answers
 */

'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Target, Brain, Flame, BarChart3, Globe,
    Sparkles, Code2, Image as ImageIcon, ChevronDown, ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface EnhancedAnswer {
    quick: string;
    deep: string;
    devils: string;
    data: string;
    webSources?: Array<{
        title: string;
        url: string;
        snippet: string;
    }>;
    visualContent?: {
        diagram?: string;
        code?: string;
        image?: string;
    };
}

interface EnhancedChatMessageProps {
    content: string;
    role: 'user' | 'assistant';
    isEnhanced?: boolean;
    enhancedData?: EnhancedAnswer;
    isLoading?: boolean;
}

export function EnhancedChatMessage({
    content,
    role,
    isEnhanced = false,
    enhancedData,
    isLoading = false
}: EnhancedChatMessageProps) {
    const [refinementLevel, setRefinementLevel] = useState([50]);
    const [showWebSources, setShowWebSources] = useState(false);
    const [activeTab, setActiveTab] = useState('quick');

    if (role === 'user') {
        return (
            <div className="flex justify-end mb-4">
                <div className="bg-primary text-primary-foreground rounded-2xl px-4 py-2 max-w-[80%] shadow-sm">
                    <p className="text-sm">{content}</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="mb-6 max-w-[90%]">
                <Card className="p-4 bg-muted/20 border-dashed animate-pulse">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-8 w-24 bg-muted rounded" />
                        <div className="h-8 w-24 bg-muted rounded" />
                        <div className="h-8 w-24 bg-muted rounded" />
                    </div>
                    <div className="space-y-3">
                        <div className="h-4 w-full bg-muted rounded" />
                        <div className="h-4 w-3/4 bg-muted rounded" />
                        <div className="h-20 w-full bg-muted/50 rounded mt-4 flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-primary/40 animate-spin-slow" />
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    // KILLER FEATURE 1: Multi-Perspective Answers
    if (isEnhanced && enhancedData) {
        return (
            <div className="mb-6">
                <Card className="p-4 bg-gradient-to-br from-background to-muted/20">
                    {/* Multi-Perspective Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-4 mb-4">
                            <TabsTrigger value="quick" className="gap-2">
                                <Target className="h-4 w-4" />
                                <span className="hidden sm:inline">Quick</span>
                            </TabsTrigger>
                            <TabsTrigger value="deep" className="gap-2">
                                <Brain className="h-4 w-4" />
                                <span className="hidden sm:inline">Deep</span>
                            </TabsTrigger>
                            <TabsTrigger value="devils" className="gap-2">
                                <Flame className="h-4 w-4" />
                                <span className="hidden sm:inline">Devil's</span>
                            </TabsTrigger>
                            <TabsTrigger value="data" className="gap-2">
                                <BarChart3 className="h-4 w-4" />
                                <span className="hidden sm:inline">Data</span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="quick" className="space-y-4 animate-in fade-in duration-500">
                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-primary/70">
                                <Target className="h-3.5 w-3.5" />
                                <span>Core Response</span>
                            </div>
                            <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-headings:text-foreground/90 prose-p:leading-relaxed prose-p:text-foreground/80">
                                <ReactMarkdown>{enhancedData.quick}</ReactMarkdown>
                            </div>
                        </TabsContent>

                        <TabsContent value="deep" className="space-y-4 animate-in fade-in duration-500">
                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-primary/70">
                                <Brain className="h-3.5 w-3.5" />
                                <span>Comprehensive Analysis</span>
                            </div>
                            <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-headings:text-foreground/90 prose-p:leading-relaxed prose-p:text-foreground/80">
                                <ReactMarkdown>{enhancedData.deep}</ReactMarkdown>
                            </div>
                        </TabsContent>

                        <TabsContent value="devils" className="space-y-4 animate-in fade-in duration-500">
                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-orange-500/70">
                                <Flame className="h-3.5 w-3.5" />
                                <span>Adversarial Perspective</span>
                            </div>
                            <div className="prose prose-slate dark:prose-invert max-w-none bg-orange-500/[0.03] border border-orange-500/10 rounded-2xl p-6 shadow-inner prose-p:text-foreground/80">
                                <ReactMarkdown>{enhancedData.devils}</ReactMarkdown>
                            </div>
                        </TabsContent>

                        <TabsContent value="data" className="space-y-4 animate-in fade-in duration-500">
                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-500/70">
                                <BarChart3 className="h-3.5 w-3.5" />
                                <span>Evidence & Metrics</span>
                            </div>
                            <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-headings:text-foreground/90 prose-p:leading-relaxed prose-p:text-foreground/80">
                                <ReactMarkdown>{enhancedData.data}</ReactMarkdown>
                            </div>
                        </TabsContent>
                    </Tabs>

                    {/* KILLER FEATURE 2: Web Search Sources */}
                    {enhancedData.webSources && enhancedData.webSources.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowWebSources(!showWebSources)}
                                className="w-full justify-between"
                            >
                                <div className="flex items-center gap-2">
                                    <Globe className="h-4 w-4" />
                                    <span>Web Sources ({enhancedData.webSources.length})</span>
                                </div>
                                {showWebSources ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>

                            {showWebSources && (
                                <div className="mt-3 space-y-2">
                                    {enhancedData.webSources.map((source, idx) => (
                                        <a
                                            key={idx}
                                            href={source.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="font-medium text-sm text-primary">{source.title}</div>
                                            <div className="text-xs text-muted-foreground mt-1">{source.snippet}</div>
                                            <div className="text-xs text-muted-foreground/60 mt-1">{source.url}</div>
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* KILLER FEATURE 4: Visual Content */}
                    {enhancedData.visualContent && (
                        <div className="mt-4 pt-4 border-t space-y-3">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <Sparkles className="h-4 w-4 text-primary" />
                                <span>Visual Explanation</span>
                            </div>

                            {enhancedData.visualContent.diagram && (
                                <div className="bg-muted/30 rounded-lg p-4">
                                    <pre className="text-xs overflow-x-auto">
                                        {enhancedData.visualContent.diagram}
                                    </pre>
                                </div>
                            )}

                            {enhancedData.visualContent.code && (
                                <div className="rounded-lg overflow-hidden">
                                    <SyntaxHighlighter
                                        language="javascript"
                                        style={oneDark}
                                        customStyle={{ margin: 0, borderRadius: '0.5rem' }}
                                    >
                                        {enhancedData.visualContent.code}
                                    </SyntaxHighlighter>
                                </div>
                            )}
                        </div>
                    )}
                </Card>

                {/* KILLER FEATURE 3: Refinement Slider */}
                <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium">Detail Level</span>
                        <span className="text-xs text-muted-foreground">
                            {refinementLevel[0] < 33 ? 'Simple (ELI5)' :
                                refinementLevel[0] < 66 ? 'Balanced' :
                                    'Expert (PhD)'}
                        </span>
                    </div>
                    <Slider
                        value={refinementLevel}
                        onValueChange={setRefinementLevel}
                        max={100}
                        step={1}
                        className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Simple</span>
                        <span>Expert</span>
                    </div>
                </div>
            </div>
        );
    }

    // Regular message (fallback)
    return (
        <div className="mb-6 group">
            <div className="bg-muted/30 backdrop-blur-md rounded-3xl px-6 py-5 max-w-[95%] border border-primary/5 shadow-sm transition-all duration-300 hover:bg-muted/40 hover:border-primary/10">
                <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-headings:text-foreground/90 prose-p:leading-relaxed prose-p:text-foreground/80 prose-li:text-foreground/80">
                    <ReactMarkdown
                        components={{
                            code(props) {
                                const { children, className, node, ...rest } = props;
                                const match = /language-(\w+)/.exec(className || '');
                                return match ? (
                                    <div className="my-6 rounded-2xl overflow-hidden border border-primary/10 shadow-lg">
                                        <div className="bg-muted/50 px-4 py-2 flex items-center justify-between border-b border-primary/5">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">{match[1]}</span>
                                            <div className="flex gap-1.5">
                                                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/20" />
                                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20" />
                                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20" />
                                            </div>
                                        </div>
                                        <SyntaxHighlighter
                                            style={oneDark as any}
                                            language={match[1]}
                                            PreTag="div"
                                            customStyle={{ margin: 0, padding: '1.5rem', background: 'transparent' }}
                                        >
                                            {String(children).replace(/\n$/, '')}
                                        </SyntaxHighlighter>
                                    </div>
                                ) : (
                                    <code className={cn("bg-primary/10 text-primary px-1.5 py-0.5 rounded-md text-sm font-mono", className)} {...rest}>
                                        {children}
                                    </code>
                                );
                            },
                        }}
                    >
                        {content}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
}
