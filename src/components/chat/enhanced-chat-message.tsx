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
}

export function EnhancedChatMessage({
    content,
    role,
    isEnhanced = false,
    enhancedData
}: EnhancedChatMessageProps) {
    const [refinementLevel, setRefinementLevel] = useState([50]);
    const [showWebSources, setShowWebSources] = useState(false);
    const [activeTab, setActiveTab] = useState('quick');

    if (role === 'user') {
        return (
            <div className="flex justify-end mb-4">
                <div className="bg-primary text-primary-foreground rounded-2xl px-4 py-2 max-w-[80%]">
                    <p className="text-sm">{content}</p>
                </div>
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

                        <TabsContent value="quick" className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Target className="h-4 w-4" />
                                <span>Quick Answer (2 sec)</span>
                            </div>
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                <ReactMarkdown>{enhancedData.quick}</ReactMarkdown>
                            </div>
                        </TabsContent>

                        <TabsContent value="deep" className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Brain className="h-4 w-4" />
                                <span>Deep Analysis</span>
                            </div>
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                <ReactMarkdown>{enhancedData.deep}</ReactMarkdown>
                            </div>
                        </TabsContent>

                        <TabsContent value="devils" className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Flame className="h-4 w-4" />
                                <span>Devil's Advocate</span>
                            </div>
                            <div className="prose prose-sm dark:prose-invert max-w-none bg-orange-500/5 border border-orange-500/20 rounded-lg p-4">
                                <ReactMarkdown>{enhancedData.devils}</ReactMarkdown>
                            </div>
                        </TabsContent>

                        <TabsContent value="data" className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <BarChart3 className="h-4 w-4" />
                                <span>Data-Driven</span>
                            </div>
                            <div className="prose prose-sm dark:prose-invert max-w-none">
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
        <div className="mb-4">
            <div className="bg-muted/50 rounded-2xl px-4 py-3 max-w-[90%]">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown
                        components={{
                            code({ node, inline, className, children, ...props }) {
                                const match = /language-(\w+)/.exec(className || '');
                                return !inline && match ? (
                                    <SyntaxHighlighter
                                        style={oneDark}
                                        language={match[1]}
                                        PreTag="div"
                                        {...props}
                                    >
                                        {String(children).replace(/\n$/, '')}
                                    </SyntaxHighlighter>
                                ) : (
                                    <code className={className} {...props}>
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
