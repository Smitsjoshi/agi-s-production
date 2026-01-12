'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Target, Brain, Flame, BarChart3, Globe,
    Sparkles, Code2, Image as ImageIcon, ChevronDown, ChevronUp,
    Copy, ThumbsUp, ThumbsDown, Check, Play, ExternalLink, Video,
    X
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
    videos?: Array<{
        title: string;
        description: string;
        videoId: string;
        thumbnail: string;
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

    // Assistant Message Actions Component
    const MessageActions = ({ text }: { text: string }) => {
        const [copied, setCopied] = useState(false);
        const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

        const handleCopy = () => {
            navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        };

        return (
            <div className="flex items-center gap-1 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors hover:bg-primary/10 rounded-lg"
                    onClick={handleCopy}
                >
                    {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "h-8 w-8 transition-colors rounded-lg",
                        feedback === 'up' ? "text-emerald-500 bg-emerald-500/10" : "text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10"
                    )}
                    onClick={() => setFeedback('up')}
                >
                    <ThumbsUp className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "h-8 w-8 transition-colors rounded-lg",
                        feedback === 'down' ? "text-rose-500 bg-rose-500/10" : "text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
                    )}
                    onClick={() => setFeedback('down')}
                >
                    <ThumbsDown className="h-4 w-4" />
                </Button>
            </div>
        );
    };

    // YouTube Player Modal
    const YouTubeModal = ({ videoId, isOpen, onClose }: { videoId: string; isOpen: boolean; onClose: () => void }) => {
        if (!isOpen) return null;
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 pointer-events-auto">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-background/80 backdrop-blur-3xl"
                />
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative w-full max-w-5xl aspect-video bg-black rounded-[2rem] overflow-hidden shadow-2xl border border-primary/20"
                >
                    <iframe
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 h-10 w-10 text-white hover:bg-white/20 rounded-full"
                        onClick={onClose}
                    >
                        <X className="h-6 w-6" />
                    </Button>
                </motion.div>
            </div>
        );
    };

    const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

    // KILLER FEATURE 1: Multi-Perspective Answers
    if (isEnhanced && enhancedData) {
        const currentExpLabel = currentDetailLevel < 33 ? 'Simplified' : currentDetailLevel < 66 ? 'Balanced' : 'Professional';
        const currentExpColor = currentDetailLevel < 33 ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' :
            currentDetailLevel < 66 ? 'text-amber-500 bg-amber-500/10 border-amber-500/20' :
                'text-rose-500 bg-rose-500/10 border-rose-500/20';

        // Helper to get current active perspective content
        const currentText = getExpertiseContent(enhancedData[activeTab as keyof EnhancedAnswer] as ExpertiseContent);

        return (
            <div className="mb-8 overflow-visible relative group/amsg group">
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

                                    <MessageActions text={currentText} />
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </Tabs>

                    {/* CINEMATIC RESEARCH LAYER: WEB & VIDEO */}
                    {(enhancedData.webSources?.length || enhancedData.videos?.length) && (
                        <div className="px-6 pb-8 border-t border-primary/5 bg-primary/[0.01] backdrop-blur-md">
                            <div className="flex items-center gap-3 mt-8 mb-6">
                                <div className="p-2 bg-primary/10 rounded-xl">
                                    <Globe className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary/60 leading-none mb-1">Intelligence Ingress</h4>
                                    <p className="text-sm font-bold text-foreground">Live Web & Video Research</p>
                                </div>
                            </div>

                            {/* VIDEOS GALLERY (WATCHABLE) */}
                            {enhancedData.videos && enhancedData.videos.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                                    {enhancedData.videos.map((video, idx) => (
                                        <motion.div
                                            key={video.videoId}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="group/vid relative bg-muted/30 border border-primary/10 rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-500"
                                        >
                                            <div className="aspect-video relative overflow-hidden bg-muted">
                                                <img
                                                    src={`https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`}
                                                    alt={video.title}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover/vid:scale-110 group-hover/vid:rotate-1"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.videoId}/0.jpg`;
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-black/40 group-hover/vid:bg-black/20 transition-all duration-500" />
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/vid:opacity-100 transition-opacity duration-500">
                                                    <div className="p-3 bg-primary/90 rounded-full shadow-2xl scale-75 group-hover/vid:scale-100 transition-transform duration-500">
                                                        <Play className="h-6 w-6 text-primary-foreground fill-current" />
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setSelectedVideo(video.videoId)}
                                                    className="absolute inset-0 z-10 w-full h-full cursor-pointer"
                                                />
                                            </div>
                                            <div className="p-4 bg-background/40 backdrop-blur-xl border-t border-primary/5">
                                                <p className="text-xs font-black text-foreground line-clamp-1 mb-1 group-hover/vid:text-primary transition-colors">{video.title}</p>
                                                <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed opacity-60 group-hover/vid:opacity-100 transition-opacity">{video.description}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {/* WEB SOURCES (CLICKABLE) */}
                            {enhancedData.webSources && enhancedData.webSources.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {enhancedData.webSources.map((source, i) => (
                                        <a
                                            key={i}
                                            href={source.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group/src flex items-center gap-4 p-4 bg-muted/10 border border-primary/5 rounded-2xl hover:bg-primary/5 hover:border-primary/20 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5"
                                        >
                                            <div className="shrink-0 p-2.5 bg-background border border-primary/10 rounded-xl group-hover/src:bg-primary group-hover/src:border-primary group-hover/src:rotate-12 transition-all duration-500">
                                                <ExternalLink className="h-3.5 w-3.5 text-primary group-hover/src:text-primary-foreground" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h5 className="text-[11px] font-black text-foreground group-hover/src:text-primary transition-colors truncate tracking-tight">{source.title}</h5>
                                                <p className="text-[10px] text-muted-foreground truncate opacity-60 group-hover/src:opacity-100 transition-opacity">{source.url}</p>
                                                <p className="text-[10px] text-muted-foreground line-clamp-1 mt-1 opacity-40 group-hover/src:opacity-80 transition-opacity italic">{source.snippet}</p>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </Card>
                <YouTubeModal
                    videoId={selectedVideo || ''}
                    isOpen={!!selectedVideo}
                    onClose={() => setSelectedVideo(null)}
                />
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
                <MessageActions text={content} />
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
