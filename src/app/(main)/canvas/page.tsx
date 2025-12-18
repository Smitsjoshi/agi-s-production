'use client';

/**
 * AGI-S Canvas - Comet Interface
 * Minimalist, high-performance command center.
 */

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowRight, Sparkles, Globe, Terminal, History, Command, Search, AlertCircle } from 'lucide-react';
import { UALClient } from '@/lib/universal-action-layer';
import type { UALResult, WebAction } from '@/lib/universal-action-layer';
import { cn } from '@/lib/utils';

export default function CanvasPage() {
    const [goal, setGoal] = useState('');
    const [isExecuting, setIsExecuting] = useState(false);
    const [result, setResult] = useState<UALResult | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [errorDetails, setErrorDetails] = useState<string | null>(null);

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
        setErrorDetails(null);

        addLog('Init...');

        try {
            addLog('Planning...');
            const actions = await ualClient.planActions(goal, '');

            addLog(`Plan: ${actions.length} steps`);

            addLog('Executing...');
            const taskResult = await ualClient.executeTask({
                goal,
                url: '',
                actions,
            });

            setResult(taskResult);
            if (taskResult.success) {
                addLog('Done.');
            } else {
                addLog('Failed.');
                if (taskResult.error) setErrorDetails(taskResult.error);
            }

        } catch (error: any) {
            const errorMsg = error.message || 'Unknown Error';
            setResult({
                success: false,
                error: errorMsg,
                steps: [`Error: ${errorMsg}`],
            });
            addLog('Error.');
            setErrorDetails(errorMsg);
        } finally {
            setIsExecuting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground font-sans flex flex-col items-center justify-center p-4 transition-colors duration-500">

            <div className="w-full max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* Minimal Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-semibold tracking-tight">Canvas</h1>
                    <p className="text-muted-foreground text-sm font-light">Where knowledge begins.</p>
                </div>

                {/* Search Bar - The "Comet" Core */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 rounded-2xl blur opacity-20 transition duration-500 group-hover:opacity-40"></div>
                    <div className="relative bg-card rounded-xl shadow-lg border border-border/40 flex items-center p-2 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                        <div className="pl-4 pr-2 text-muted-foreground">
                            {isExecuting ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : <Sparkles className="h-5 w-5" />}
                        </div>
                        <Input
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !isExecuting && executeTask()}
                            placeholder="Ask anything..."
                            className="border-0 shadow-none text-lg h-12 bg-transparent px-2 placeholder:text-muted-foreground/40 focus-visible:ring-0"
                            disabled={isExecuting}
                            autoFocus
                        />
                        <Button
                            onClick={executeTask}
                            disabled={isExecuting || !goal.trim()}
                            size="icon"
                            className={cn("h-10 w-10 rounded-lg transition-all", goal.trim() ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}
                        >
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Error Alert */}
                {errorDetails && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-start gap-3 text-sm text-destructive animate-in fade-in">
                        <AlertCircle className="h-4 w-4 mt-0.5" />
                        <div>
                            <span className="font-semibold">Execution Failed:</span> {errorDetails}
                            {errorDetails.includes('500') && (
                                <p className="mt-1 text-xs opacity-80">Tip: Check if GROQ_API_KEY is configured.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Results Area - Minimal Cards */}
                {(isExecuting || result) && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">

                        {/* Browser View */}
                        <div className="aspect-video bg-muted/20 border border-border/40 rounded-xl overflow-hidden relative shadow-sm group">
                            {result?.screenshot ? (
                                <>
                                    <img src={`data:image/png;base64,${result.screenshot}`} alt="Result" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.01]" />
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-white text-sm font-medium truncate">{result.data?.title}</p>
                                        <p className="text-white/70 text-xs truncate">{result.data?.url}</p>
                                    </div>
                                </>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30 space-y-3">
                                    {isExecuting ? (
                                        <>
                                            <div className="relative">
                                                <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                                <Globe className="absolute inset-0 m-auto h-5 w-5 text-primary/50" />
                                            </div>
                                            <p className="text-xs font-medium text-primary/60 animate-pulse">Browsing...</p>
                                        </>
                                    ) : (
                                        <>
                                            <Command className="h-12 w-12" />
                                            <p className="text-xs">No visual data</p>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Log Ticker */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono overflow-hidden">
                            <Terminal className="h-3 w-3" />
                            <div className="flex-1 truncate">
                                {logs.length > 0 ? logs[logs.length - 1] : "Ready"}
                            </div>
                        </div>

                    </div>
                )}

            </div>
        </div>
    );
}
