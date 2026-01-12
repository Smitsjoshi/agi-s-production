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
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface ExpertiseContent {
    summary: string;
    standard: string;
    technical: string;
}

interface EnhancedAnswer {
    quick: ExpertiseContent;
    deep: ExpertiseContent;
    devils: ExpertiseContent;
    data: ExpertiseContent;
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
    currentDetailLevel?: number;
}

export function EnhancedChatMessage({
    content,
    role,
    isEnhanced = false,
    enhancedData,
    isLoading = false,
    currentDetailLevel = 50
}: EnhancedChatMessageProps) {
    const [showWebSources, setShowWebSources] = useState(false);
    const [activeTab, setActiveTab] = useState('quick');

    // Helper to get content based on detail level
    const getExpertiseContent = (expertise: ExpertiseContent) => {
        if (!expertise) return '';
        if (currentDetailLevel < 33) return expertise.summary;
        if (currentDetailLevel < 66) return expertise.standard;
        return expertise.technical;
    };

    if (role === 'user') {
        return (
            <div className="flex justify-end mb-4">
                <div className="bg-primary text-primary-foreground rounded-2xl px-4 py-2 max-w-[80%] shadow-lg">
                    {content}
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex gap-4 mb-4 items-start animate-pulse">
                <div className="p-2 bg-muted rounded-xl">
                    <Sparkles className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="bg-muted rounded-2xl px-4 py-3 w-full max-w-[90%] h-32" />
            </div>
        );
    }

    // KILLER FEATURE 1: Multi-Perspective Answers
    if (isEnhanced && enhancedData) {
        const currentExpLabel = currentDetailLevel < 33 ? 'Simplified' : currentDetailLevel < 66 ? 'Balanced' : 'Professional';
        const currentExpColor = currentDetailLevel < 33 ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' :
            currentDetailLevel < 66 ? 'text-amber-500 bg-amber-500/10 border-amber-500/20' :
                'text-rose-500 bg-rose-500/10 border-rose-500/20';

        return (
            <div className="mb-8 overflow-visible relative group/amsg">
                {/* Visual Feedback Badge */}
                <div className={cn(
                    "absolute -top-3 right-8 z-20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm transition-all duration-500 opacity-0 group-hover/amsg:opacity-100",
                    currentExpColor
                )}>
                    {currentExpLabel} Refinement Active
                </div>

                <Card className="p-0 overflow-hidden bg-gradient-to-br from-background via-background to-primary/[0.02] border-primary/10 shadow-2xl shadow-primary/5 rounded-[2rem]">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <div className="px-6 pt-6 pb-2 border-b border-primary/5 bg-background/50 backdrop-blur-sm">
                            <TabsList className="grid w-full grid-cols-4 h-11 bg-muted/30 p-1 rounded-2xl">
                                <TabsTrigger value="quick" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all duration-300 gap-2">
                                    <Target className="h-4 w-4" />
                                    <span className="hidden sm:inline font-bold text-[11px] uppercase tracking-wider">Quick</span>
                                </TabsTrigger>
                                <TabsTrigger value="deep" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all duration-300 gap-2">
                                    <Brain className="h-4 w-4" />
                                    <span className="hidden sm:inline font-bold text-[11px] uppercase tracking-wider">Deep</span>
                                </TabsTrigger>
                                <TabsTrigger value="devils" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-orange-500 transition-all duration-300 gap-2">
                                    <Flame className="h-4 w-4" />
                                    <span className="hidden sm:inline font-bold text-[11px] uppercase tracking-wider">Alt</span>
                                </TabsTrigger>
                                <TabsTrigger value="data" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-blue-500 transition-all duration-300 gap-2">
                                    <BarChart3 className="h-4 w-4" />
                                    <span className="hidden sm:inline font-bold text-[11px] uppercase tracking-wider">Data</span>
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="p-6 md:p-8">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`${activeTab}-${currentDetailLevel < 33 ? 's' : currentDetailLevel < 66 ? 'm' : 't'}`}
                                    initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
                                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                    exit={{ opacity: 0, y: -10, filter: 'blur(8px)' }}
                                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                                >
                                    <TabsContent value="quick" className="m-0 space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/10" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40 whitespace-nowrap">Core Synthesis</span>
                                            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/10" />
                                        </div>
                                        <div className="prose-dominance">
                                            <MarkdownRenderer content={getExpertiseContent(enhancedData.quick)} />
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="deep" className="m-0 space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/10" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40 whitespace-nowrap">Comprehensive Insight</span>
                                            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/10" />
                                        </div>
                                        <div className="prose-dominance">
                                            <MarkdownRenderer content={getExpertiseContent(enhancedData.deep)} />
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="devils" className="m-0 space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-orange-500/10" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500/40 whitespace-nowrap">Adversarial Logic</span>
                                            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-orange-500/10" />
                                        </div>
                                        <div className="prose-dominance p-6 bg-orange-500/[0.02] border border-orange-500/10 rounded-3xl shadow-inner">
                                            <MarkdownRenderer content={getExpertiseContent(enhancedData.devils)} />
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="data" className="m-0 space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-blue-500/10" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500/40 whitespace-nowrap">Evidence & Metrics</span>
                                            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-blue-500/10" />
                                        </div>
                                        <div className="prose-dominance">
                                            <MarkdownRenderer content={getExpertiseContent(enhancedData.data)} />
                                        </div>
                                    </TabsContent>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </Tabs>

                    {/* Web Search Sources */}
                    {enhancedData.webSources && enhancedData.webSources.length > 0 && (
                        <div className="px-6 pb-6 border-t border-primary/5 bg-primary/[0.01]">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowWebSources(!showWebSources)}
                                className="w-full flex justify-between items-center text-muted-foreground hover:text-primary mt-4 h-10 rounded-xl"
                            >
                                <div className="flex items-center gap-2">
                                    <Globe className="h-4 w-4" />
                                    <span className="text-xs font-bold uppercase tracking-wider">External Sources</span>
                                </div>
                                {showWebSources ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>

                            <AnimatePresence>
                                {showWebSources && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
                                            {enhancedData.webSources.map((source, i) => (
                                                <a
                                                    key={i}
                                                    href={source.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-3 bg-muted/20 border border-primary/5 rounded-xl hover:bg-muted/40 transition-all group/source"
                                                >
                                                    <p className="text-xs font-black truncate text-foreground group-hover/source:text-primary transition-colors">{source.title}</p>
                                                    <p className="text-[10px] text-muted-foreground truncate mt-1">{source.url}</p>
                                                </a>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </Card>
            </div>
        );
    }

    // Regular message (fallback)
    return (
        <div className="mb-8 group">
            <div className="bg-background/40 backdrop-blur-xl rounded-[2.5rem] px-8 py-7 max-w-[95%] border border-primary/10 shadow-xl shadow-primary/[0.02] transition-all duration-500 hover:border-primary/20 hover:shadow-primary/[0.05]">
                <div className="prose-dominance">
                    <MarkdownRenderer content={content} />
                </div>
            </div>
        </div>
    );
}

function MarkdownRenderer({ content }: { content: string }) {
    if (!content) return null;

    return (
        <div className="prose-custom max-w-none">
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                    h1: ({ children }) => <h1 className="text-3xl font-black tracking-tighter text-foreground mb-8 mt-4">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-2xl font-black tracking-tight text-foreground/90 mb-6 mt-10 flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-primary/20 rounded-full" />
                        {children}
                    </h2>,
                    h3: ({ children }) => <h3 className="text-lg font-black tracking-tight text-foreground/80 mb-4 mt-8">{children}</h3>,
                    p: ({ children }) => <p className="leading-[1.8] text-[1.05rem] text-foreground/80 mb-6 font-medium tracking-tight whitespace-pre-wrap">{children}</p>,
                    ul: ({ children }) => <ul className="space-y-3 mb-8 list-none pl-0">{children}</ul>,
                    li: ({ children }) => (
                        <li className="flex gap-4 items-start group/li text-[1rem] text-foreground/80 leading-relaxed font-medium">
                            <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-primary/30 group-hover/li:bg-primary transition-colors duration-300 shrink-0" />
                            <span>{children}</span>
                        </li>
                    ),
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-primary/20 pl-6 my-8 italic text-foreground/60 text-lg leading-relaxed bg-primary/[0.02] py-4 rounded-r-2xl font-medium">
                            {children}
                        </blockquote>
                    ),
                    table: ({ children }) => (
                        <div className="my-10 overflow-hidden border border-primary/10 rounded-2xl shadow-sm bg-background/50 backdrop-blur-md">
                            <table className="w-full border-collapse text-left text-sm">{children}</table>
                        </div>
                    ),
                    thead: ({ children }) => <thead className="bg-primary/5 text-primary font-bold uppercase tracking-widest text-[10px]">{children}</thead>,
                    th: ({ children }) => <th className="px-6 py-4 border-b border-primary/10">{children}</th>,
                    td: ({ children }) => <td className="px-6 py-4 border-b border-primary/5 text-foreground/70">{children}</td>,
                    strong: ({ children }) => <strong className="font-black text-primary/90">{children}</strong>,
                    code(props) {
                        const { children, className, node, ...rest } = props;
                        const match = /language-(\w+)/.exec(className || '');
                        return match ? (
                            <div className="my-10 rounded-[2rem] overflow-hidden border border-primary/10 shadow-2xl shadow-primary/5 group/code">
                                <div className="bg-muted/40 px-6 py-4 flex items-center justify-between border-b border-primary/5 backdrop-blur-md">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-primary/10 rounded-lg">
                                            <Code2 className="h-3.5 w-3.5 text-primary" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">{match[1]}</span>
                                    </div>
                                    <div className="flex gap-2 opacity-50 transition-opacity duration-500 group-hover/code:opacity-100">
                                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500/30" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/30" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/30" />
                                    </div>
                                </div>
                                <SyntaxHighlighter
                                    style={oneDark as any}
                                    language={match[1]}
                                    PreTag="div"
                                    customStyle={{ margin: 0, padding: '2rem', background: 'transparent' }}
                                >
                                    {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                            </div>
                        ) : (
                            <code className={cn("bg-primary/10 text-primary px-2 py-0.5 rounded-lg text-sm font-bold font-mono border border-primary/5", className)} {...rest}>
                                {children}
                            </code>
                        );
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
