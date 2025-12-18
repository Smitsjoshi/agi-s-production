'use client';

/**
 * AGI-S Canvas - Professional Interface
 * Desgined for clarity and focused execution.
 */

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowRight, CornerDownLeft, Sparkles, Globe, Terminal, Activity, CheckCircle2 } from 'lucide-react';
import { UALClient } from '@/lib/universal-action-layer';
import type { UALResult, WebAction } from '@/lib/universal-action-layer';
import { cn } from '@/lib/utils';

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

        addLog('Initializing Agent...');

        try {
            addLog('Planning actions...');
            const actions = await ualClient.planActions(goal, '');

            setPlannedActions(actions);
            addLog(`Plan created: ${actions.length} steps.`);

            await new Promise(resolve => setTimeout(resolve, 500));

            addLog('Executing task...');
            const taskResult = await ualClient.executeTask({
                goal,
                url: '',
                actions,
            });

            setResult(taskResult);
            if (taskResult.success) {
                addLog('Completed successfully.');
            } else {
                addLog(`Failed: ${taskResult.error}`);
            }

        } catch (error: any) {
            setResult({
                success: false,
                error: error.message,
                steps: [`Error: ${error.message}`],
            });
            addLog(`System Error: ${error.message}`);
        } finally {
            setIsExecuting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#09090b] text-foreground font-sans flex flex-col items-center pt-24 px-4 transition-colors">

            {/* Centered Input Area (Perplexity Style) */}
            <div className="w-full max-w-2xl space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-semibold tracking-tight">Where to?</h1>
                    <p className="text-muted-foreground text-sm">Universal Action Layer™ is ready.</p>
                </div>

                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 rounded-2xl blur opacity-20 transition duration-500 group-hover:opacity-40"></div>
                    <div className="relative bg-white dark:bg-[#18181b] rounded-xl shadow-sm border border-border/40 flex items-center p-2 focus-within:ring-2 focus-within:ring-primary/10 transition-shadow">
                        <Input
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !isExecuting && executeTask()}
                            placeholder="Ask UAL to browse the web..."
                            className="border-0 shadow-none text-lg h-14 bg-transparent px-4 placeholder:text-muted-foreground/40 focus-visible:ring-0"
                            disabled={isExecuting}
                            autoFocus
                        />
                        <Button
                            onClick={executeTask}
                            disabled={isExecuting || !goal.trim()}
                            size="icon"
                            className={cn("h-10 w-10 rounded-lg transition-all", goal.trim() ? "bg-black dark:bg-white text-white dark:text-black" : "bg-muted text-muted-foreground")}
                        >
                            {isExecuting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>

                {!isExecuting && !result && (
                    <div className="flex justify-center gap-4 text-xs text-muted-foreground/60">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/30 bg-white/50 dark:bg-white/5">
                            <Globe className="h-3 w-3" />
                            <span>Browsing</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/30 bg-white/50 dark:bg-white/5">
                            <Terminal className="h-3 w-3" />
                            <span>Planning</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/30 bg-white/50 dark:bg-white/5">
                            <Sparkles className="h-3 w-3" />
                            <span>Intelligence</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Results Area */}
            {(isExecuting || result) && (
                <div className="w-full max-w-5xl mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                    {/* Left: Process */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
                            <span>Activity Log</span>
                            {isExecuting && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
                        </div>
                        <div className="bg-white dark:bg-[#18181b] border border-border/40 rounded-xl p-6 min-h-[300px] shadow-sm relative overflow-hidden">
                            <div className="space-y-4 font-mono text-xs text-muted-foreground" ref={scrollRef}>
                                {logs.map((log, i) => (
                                    <div key={i} className="flex gap-3 items-start">
                                        <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-border shrink-0"></div>
                                        <span className={cn(
                                            log.includes('Failed') || log.includes('Error') ? "text-red-500" :
                                                log.includes('Completed') ? "text-green-500" :
                                                    "text-foreground/80"
                                        )}>{log}</span>
                                    </div>
                                ))}
                            </div>
                            {/* Plan Visualization */}
                            {plannedActions.length > 0 && (
                                <div className="mt-8 pt-6 border-t border-border/40">
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">Strategy</p>
                                    <div className="flex flex-wrap gap-2">
                                        {plannedActions.slice(0, 5).map((action, i) => (
                                            <div key={i} className="px-2 py-1 rounded bg-muted/50 border border-border/50 text-[10px] font-medium text-foreground/70">
                                                {action.type}
                                            </div>
                                        ))}
                                        {plannedActions.length > 5 && (
                                            <div className="px-2 py-1 rounded bg-muted/50 text-[10px] text-muted-foreground">+{plannedActions.length - 5}</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Output */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
                            <span>Browser View</span>
                            {result?.success && <span className="text-green-500 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Ready</span>}
                        </div>
                        <div className="aspect-video bg-white dark:bg-[#18181b] border border-border/40 rounded-xl overflow-hidden shadow-sm flex items-center justify-center relative group">
                            {result?.screenshot ? (
                                <>
                                    <img src={`data:image/png;base64,${result.screenshot}`} alt="Result" className="w-full h-full object-cover" />
                                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-xs font-medium truncate">{result.data?.title}</p>
                                        <p className="text-[10px] opacity-70 truncate">{result.data?.url}</p>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center space-y-3">
                                    <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mx-auto">
                                        {isExecuting ? <Activity className="h-5 w-5 text-primary animate-pulse" /> : <Globe className="h-5 w-5 text-muted-foreground/30" />}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {isExecuting ? "Connecting to visual feed..." : "No active session"}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            )}

            {/* Footer */}
            <div className="fixed bottom-6 text-center">
                <p className="text-[10px] text-muted-foreground/40 font-medium tracking-widest uppercase">
                    Designed by AGI-S
                </p>
            </div>

        </div>
    );
}
