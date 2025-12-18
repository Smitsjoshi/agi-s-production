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
import { Loader2, Play, Sparkles, Globe, Zap, ArrowRight, Command } from 'lucide-react';
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
            addLog(`❌ Critical System Error: ${error.message}`);
        } finally {
            setIsExecuting(false);
        }
    };

    const suggestions = [
        'Search for "Latest AI breakthroughs" on Google',
        'Go to GitHub and find trending repositories',
        'Check the price of Ethereum on CoinMarketCap',
    ];

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
            <div className="max-w-4xl mx-auto px-4 py-12 flex flex-col min-h-[90vh]">

                {/* Minimal Hero Header */}
                <div className="text-center mb-12 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 text-xs font-medium text-muted-foreground border border-border/40 backdrop-blur-sm">
                        <Sparkles className="h-3 w-3 text-primary" />
                        <span>Universal Action Layer™</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
                        Canvas
                    </h1>
                    <p className="text-xl text-muted-foreground font-light max-w-lg mx-auto">
                        Your autonomous agent for the web. <br /> Just describe the mission.
                    </p>
                </div>

                {/* Central Command Input */}
                <div className="relative group max-w-2xl mx-auto w-full mb-12 z-20">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-blue-500/20 to-purple-500/20 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                    <div className="relative flex items-center bg-card border border-border/50 shadow-2xl rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                        <div className="pl-4 text-muted-foreground">
                            {isExecuting ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : <Command className="h-6 w-6" />}
                        </div>
                        <Input
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !isExecuting && executeTask()}
                            placeholder="What do you want to achieve?"
                            className="h-16 border-0 bg-transparent text-lg px-4 focus-visible:ring-0 placeholder:text-muted-foreground/50 shadow-none"
                            disabled={isExecuting}
                            autoFocus
                        />
                        <Button
                            onClick={executeTask}
                            disabled={isExecuting || !goal.trim()}
                            size="icon"
                            className="mr-2 h-10 w-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
                        >
                            <ArrowRight className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Suggestions */}
                    {!isExecuting && !result && (
                        <div className="mt-4 flex flex-wrap justify-center gap-2 opacity-0 animate-in fade-in slide-in-from-top-2 duration-700 fill-mode-forwards" style={{ animationDelay: '200ms' }}>
                            {suggestions.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => setGoal(s)}
                                    className="px-3 py-1.5 text-xs rounded-full bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground border border-transparent hover:border-border transition-colors cursor-pointer"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Execution Interface */}
                {(isExecuting || result) && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-500">

                        {/* Terminal / Live Logs */}
                        <Card className="bg-black/95 border-border/20 shadow-xl overflow-hidden flex flex-col h-[400px]">
                            <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/20"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20"></div>
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/20"></div>
                                    </div>
                                    <span className="text-[10px] font-mono text-muted-foreground ml-2">UAL_ENGINE_V1</span>
                                </div>
                                {result && (
                                    <Badge variant="outline" className={cn("text-[10px] h-5 border-none", result.success ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500")}>
                                        {result.success ? "COMPLETE" : "ERROR"}
                                    </Badge>
                                )}
                            </div>
                            <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-2 scrollbar-hide text-gray-300" ref={scrollRef}>
                                {logs.map((log, i) => (
                                    <div key={i} className="flex gap-3">
                                        <span className="text-white/20 select-none">{`>`}</span>
                                        <span className={cn(
                                            "break-words",
                                            log.includes('❌') ? "text-red-400" :
                                                log.includes('✅') ? "text-green-400" :
                                                    log.includes('🧠') ? "text-purple-400 font-semibold" :
                                                        "text-gray-300"
                                        )}>
                                            {log}
                                        </span>
                                    </div>
                                ))}
                                {isExecuting && (
                                    <div className="animate-pulse flex gap-2">
                                        <span className="text-white/20 select-none">{`>`}</span>
                                        <span className="w-2 h-4 bg-primary/50 block"></span>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Visual Result */}
                        <div className="space-y-4">
                            {/* Browser View */}
                            <div className="relative aspect-video rounded-xl bg-muted/20 border border-border/40 overflow-hidden shadow-2xl group flex items-center justify-center">
                                {result?.screenshot ? (
                                    <>
                                        <img
                                            src={`data:image/png;base64,${result.screenshot}`}
                                            alt="Browser View"
                                            className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                                            <div className="text-white w-full">
                                                <h3 className="font-medium text-sm mb-1 line-clamp-1">{result.data?.title}</h3>
                                                <div className="text-xs text-white/60 font-mono truncate bg-white/10 px-2 py-1 rounded inline-block">
                                                    {result.data?.url}
                                                </div>
                                            </div>
                                        </div>
                                        <Badge className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 backdrop-blur border-none text-white text-[10px]">
                                            1280x720
                                        </Badge>
                                    </>
                                ) : (
                                    <div className="text-center p-6 space-y-4">
                                        {isExecuting ? (
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
                                                <Globe className="relative h-16 w-16 text-primary animate-spin-slow duration-[3s]" />
                                            </div>
                                        ) : (
                                            <Globe className="h-16 w-16 text-muted-foreground/20" />
                                        )}
                                        <p className="text-sm text-muted-foreground font-medium animate-pulse">
                                            {isExecuting ? "Browser session actived..." : "Waiting for visual feed"}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Plan Summary */}
                            {plannedActions.length > 0 && (
                                <div className="bg-card/50 border border-border/40 rounded-xl p-4 backdrop-blur-sm">
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Action Strategy</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {plannedActions.map((action, i) => (
                                            <Badge key={i} variant="secondary" className="text-[10px] font-mono border-border/50">
                                                {i + 1}. {action.type}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Footer Brand */}
                <div className="mt-auto pt-12 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest opacity-40">
                        Powered by Liquid Intelligence™
                    </p>
                </div>

            </div>
        </div>
    );
}
