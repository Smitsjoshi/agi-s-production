'use client';

/**
 * AGI-S Canvas - Powered by Universal Action Layer (UAL)™
 * Copyright © 2024-2025 AGI-S Technologies
 * Patent Pending
 */

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, Sparkles, Globe, Zap, ArrowRight, Command, Search, MousePointer2, FileText, LayoutTemplate, Terminal } from 'lucide-react';
import { UALClient } from '@/lib/universal-action-layer';
import type { UALResult, WebAction } from '@/lib/universal-action-layer';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function CanvasPage() {
    const [goal, setGoal] = useState('');
    const [isExecuting, setIsExecuting] = useState(false);
    const [result, setResult] = useState<UALResult | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [plannedActions, setPlannedActions] = useState<WebAction[]>([]);

    const scrollRef = useRef<HTMLDivElement>(null);
    const ualClient = new UALClient();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    const addLog = (message: string) => {
        setLogs(prev => [...prev, message]);
    };

    const executeTask = async () => {
        if (!goal.trim()) return;

        setIsExecuting(true);
        setResult(null);
        setLogs([]);
        setPlannedActions([]);

        addLog('🚀 Activating Universal Action Layer™...');

        try {
            addLog('🧠 Liquid Intelligence™ formulating strategy...');
            const actions = await ualClient.planActions(goal, '');

            setPlannedActions(actions);
            addLog(`✨ Strategy Plan: ${actions.length} autonomous steps generated`);

            await new Promise(resolve => setTimeout(resolve, 800));

            addLog('🌐 Engaging Browser Automation Engine...');
            const taskResult = await ualClient.executeTask({
                goal,
                url: '',
                actions,
            });

            setResult(taskResult);
            if (taskResult.success) {
                addLog('✅ Mission Accomplished');
            } else {
                addLog(`❌ Execution halted: ${taskResult.error}`);
            }

        } catch (error: any) {
            setResult({
                success: false,
                error: error.message,
                steps: [`❌ Error: ${error.message}`],
            });
            addLog(`❌ System Error: ${error.message}`);
        } finally {
            setIsExecuting(false);
        }
    };

    const suggestions = [
        { icon: Search, label: 'Find AI breakthroughs', prompt: 'Search for "Latest AI breakthroughs" on Google' },
        { icon: Globe, label: 'Check tech news', prompt: 'Go to TechCrunch and summarize headers' },
        { icon: LayoutTemplate, label: 'Analyze UI trends', prompt: 'Visit Dribbble and describe trending designs' },
    ];

    const capabilities = [
        { icon: Search, title: 'Deep Search', desc: 'Intelligent query formulation' },
        { icon: MousePointer2, title: 'Precision Control', desc: 'Click, scroll, and interact' },
        { icon: FileText, title: 'Content Extraction', desc: 'Parse and structured data' },
        { icon: Terminal, title: 'Auto-Debug', desc: 'Self-correcting execution' },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 relative overflow-hidden">

            {/* Background Effects */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-16 flex flex-col min-h-[90vh] relative z-10">

                {/* Hero Header */}
                <div className="text-center mb-16 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/50 text-xs font-semibold text-secondary-foreground border border-border/50 backdrop-blur-md shadow-sm">
                        <Sparkles className="h-3 w-3" />
                        <span>Universal Action Layer™</span>
                    </div>

                    <h1 className="text-6xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-gray-200 to-gray-500 drop-shadow-sm">
                        Canvas
                    </h1>

                    <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed">
                        The autonomous interface for the web. <br className="hidden md:block" />
                        Describe your mission, and <span className="text-foreground font-medium">Liquid Intelligence™</span> executes it.
                    </p>
                </div>

                {/* Central Command Input */}
                <div className="relative group max-w-3xl mx-auto w-full mb-16">
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition duration-700"></div>

                    <div className="relative flex items-center bg-card/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl overflow-hidden ring-1 ring-white/5 focus-within:ring-2 focus-within:ring-primary/30 transition-all transform focus-within:scale-[1.01]">
                        <div className="pl-6 text-muted-foreground/70">
                            {isExecuting ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : <Command className="h-6 w-6" />}
                        </div>
                        <Input
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !isExecuting && executeTask()}
                            placeholder="What is your objective?"
                            className="h-20 border-0 bg-transparent text-xl px-6 focus-visible:ring-0 placeholder:text-muted-foreground/40 shadow-none font-light"
                            disabled={isExecuting}
                            autoFocus
                        />
                        <Button
                            onClick={executeTask}
                            disabled={isExecuting || !goal.trim()}
                            size="icon"
                            className="mr-3 h-12 w-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25"
                        >
                            <ArrowRight className="h-6 w-6" />
                        </Button>
                    </div>

                    {/* Quick Suggestions */}
                    {!isExecuting && !result && (
                        <div className="mt-8 flex flex-wrap justify-center gap-3 opacity-0 animate-in fade-in slide-in-from-top-2 duration-700 fill-mode-forwards" style={{ animationDelay: '200ms' }}>
                            {suggestions.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => setGoal(s.prompt)}
                                    className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted/40 hover:bg-muted/80 text-sm font-medium text-muted-foreground hover:text-foreground border border-transparent hover:border-border/50 transition-all cursor-pointer shadow-sm hover:shadow"
                                >
                                    <s.icon className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Capabilities Grid */}
                {!isExecuting && !result && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto w-full opacity-0 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-forwards px-4" style={{ animationDelay: '400ms' }}>
                        {capabilities.map((cap, i) => (
                            <div key={i} className="p-4 rounded-2xl bg-muted/20 border border-white/5 hover:bg-muted/30 transition-colors text-center group">
                                <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <cap.icon className="h-5 w-5 text-primary" />
                                </div>
                                <h3 className="text-sm font-semibold mb-1">{cap.title}</h3>
                                <p className="text-xs text-muted-foreground">{cap.desc}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Execution Interface */}
                {(isExecuting || result) && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-500 w-full">

                        {/* Terminal / Live Logs */}
                        <Card className="lg:col-span-5 bg-[#0a0a0a]/90 backdrop-blur-xl border-white/10 shadow-2xl overflow-hidden flex flex-col h-[500px] rounded-2xl ring-1 ring-white/5">
                            <div className="flex items-center justify-between px-5 py-3 bg-white/5 border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/30"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/30"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/30"></div>
                                    </div>
                                    <span className="text-[10px] font-mono text-muted-foreground/60 tracking-wider ml-2">UAL_CORE_SYSTEM</span>
                                </div>
                                {result && (
                                    <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5 border-0 font-mono tracking-wider", result.success ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400")}>
                                        {result.success ? "STATUS: COMPLETE" : "STATUS: ERROR"}
                                    </Badge>
                                )}
                            </div>
                            <div className="flex-1 p-5 font-mono text-xs overflow-y-auto space-y-3 scrollbar-hide text-gray-300/90 leading-relaxed" ref={scrollRef}>
                                {logs.map((log, i) => (
                                    <div key={i} className="flex gap-3 group">
                                        <span className="text-white/10 select-none group-hover:text-white/30 transition-colors">{`>`}</span>
                                        <span className={cn(
                                            "break-words",
                                            log.includes('❌') ? "text-red-400" :
                                                log.includes('✅') ? "text-emerald-400" :
                                                    log.includes('🧠') ? "text-purple-400 font-semibold" :
                                                        log.includes('🌐') ? "text-blue-400" :
                                                            log.includes('✨') ? "text-amber-400" :
                                                                "text-gray-400"
                                        )}>
                                            {log}
                                        </span>
                                    </div>
                                ))}
                                {isExecuting && (
                                    <div className="animate-pulse flex gap-2">
                                        <span className="text-white/20 select-none">{`_`}</span>
                                        <span className="w-2 h-4 bg-primary/50 block"></span>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Visual Result */}
                        <div className="lg:col-span-7 space-y-6">
                            {/* Browser View */}
                            <div className="relative aspect-video rounded-2xl bg-muted/10 border border-white/10 overflow-hidden shadow-2xl group flex items-center justify-center ring-1 ring-white/5">
                                {result?.screenshot ? (
                                    <>
                                        <img
                                            src={`data:image/png;base64,${result.screenshot}`}
                                            alt="Browser View"
                                            className="w-full h-full object-cover transition duration-700 group-hover:scale-[1.02]"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                                            <div className="text-white w-full">
                                                <h3 className="font-medium text-base mb-1.5 line-clamp-1 text-white/90">{result.data?.title}</h3>
                                                <div className="text-[10px] text-white/60 font-mono truncate bg-white/10 px-2 py-1 rounded-md inline-flex items-center backdrop-blur-md border border-white/5">
                                                    <Globe className="h-3 w-3 mr-1.5 opacity-50" />
                                                    {result.data?.url}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center p-8 space-y-5">
                                        {isExecuting ? (
                                            <div className="relative mx-auto w-20 h-20">
                                                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse"></div>
                                                <div className="relative w-full h-full border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                                                <Globe className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
                                            </div>
                                        ) : (
                                            <div className="w-20 h-20 mx-auto rounded-full bg-white/5 flex items-center justify-center">
                                                <Globe className="h-10 w-10 text-muted-foreground/20" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-medium text-foreground">
                                                {isExecuting ? "Establishing Neural Uplink..." : "Awaiting Visual Feed"}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1.5">
                                                {isExecuting ? "Acquiring viewport stream from engine" : "Execute a task to view the browser"}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Plan Summary */}
                            {plannedActions.length > 0 && (
                                <div className="bg-card/30 border border-white/5 rounded-2xl p-5 backdrop-blur-md">
                                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center">
                                        <Terminal className="h-3 w-3 mr-2" />
                                        Execution Protocol
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {plannedActions.map((action, i) => (
                                            <div key={i} className="flex items-center px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-mono text-muted-foreground">
                                                <span className="opacity-30 mr-2">{String(i + 1).padStart(2, '0')}</span>
                                                <span className={cn(
                                                    "font-semibold uppercase",
                                                    action.type === 'navigate' ? "text-blue-400" :
                                                        action.type === 'click' ? "text-yellow-400" :
                                                            "text-gray-400"
                                                )}>{action.type}</span>
                                                <span className="mx-2 opacity-10">|</span>
                                                <span className="opacity-70 truncate max-w-[100px]">
                                                    {action.selector || action.url || '...'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Footer Brand */}
                <div className="mt-auto pt-16 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] opacity-30 hover:opacity-100 transition-opacity duration-700">
                        Powered by AGI-S Liquid Intelligence™
                    </p>
                </div>

            </div>
        </div>
    );
}
