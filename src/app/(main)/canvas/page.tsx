'use client';

/**
 * AGI-S Canvas - Powered by Universal Action Layer (UAL)™
 * Copyright © 2024-2025 AGI-S Technologies
 * Patent Pending
 */

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, Sparkles, Globe, Zap, ChevronRight, ChevronDown, Terminal, CheckCircle2, AlertCircle } from 'lucide-react';
import { UALClient } from '@/lib/universal-action-layer';
import type { UALResult, WebAction } from '@/lib/universal-action-layer';
import { cn } from '@/lib/utils';

export default function CanvasPage() {
    const [goal, setGoal] = useState('');
    const [url, setUrl] = useState(''); // Optional now
    const [showAdvanced, setShowAdvanced] = useState(false);
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
        if (!goal.trim()) {
            return;
        }

        setIsExecuting(true);
        setResult(null);
        setLogs([]);
        setPlannedActions([]);

        addLog('🚀 Initializing Universal Action Layer™...');

        try {
            // Step 1: Plan actions using AI
            addLog('🧠 Liquid Intelligence™ analyzing goal...');
            const actions = await ualClient.planActions(goal, url);

            setPlannedActions(actions);
            addLog(`✨ Strategies generated: ${actions.length} steps planned`);

            // Artificial delay for UX perception of "thinking"
            await new Promise(resolve => setTimeout(resolve, 800));

            // Step 2: Execute the task
            addLog('🌐 Engaging Browser Automation Engine...');
            const taskResult = await ualClient.executeTask({
                goal,
                url, // Can be empty, planner handles it
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

    const exampleTasks = [
        { goal: 'Find the latest AI news on TechCrunch', url: '' },
        { goal: 'Check the price of Bitcoin on CoinMarketCap', url: '' },
        { goal: 'Go to GitHub and find trending repositories', url: '' },
    ];

    return (
        <div className="container mx-auto p-6 max-w-6xl min-h-[calc(100vh-100px)] flex flex-col">
            {/* Header */}
            <div className="mb-8 text-center">
                <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                    <Sparkles className="h-3 w-3" />
                    <span>Patent Pending Technology</span>
                </div>
                <h1 className="font-headline text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-blue-600 pb-2">
                    Canvas
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Autonomous web agent powered by <span className="font-semibold text-foreground">Universal Action Layer (UAL)™</span>.
                    <br />Just describe your mission, and Liquid Intelligence™ handles the rest.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
                {/* Left: Command Center */}
                <div className="lg:col-span-5 space-y-6">
                    <Card className="border-primary/20 shadow-lg bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Zap className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                                Command Center
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Main Goal Input */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-muted-foreground ml-1">
                                    What is your objective?
                                </label>
                                <div className="relative">
                                    <Input
                                        value={goal}
                                        onChange={(e) => setGoal(e.target.value)}
                                        placeholder="e.g., Search for AI news and summarize the top result..."
                                        disabled={isExecuting}
                                        className="h-14 pl-4 pr-12 text-lg shadow-inner bg-background/80 focus-visible:ring-primary/50"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !isExecuting) {
                                                executeTask();
                                            }
                                        }}
                                    />
                                    <div className="absolute right-3 top-3">
                                        {isExecuting ? <Loader2 className="h-8 w-8 text-primary animate-spin opacity-50" /> : <Sparkles className="h-8 w-8 text-primary opacity-20" />}
                                    </div>
                                </div>
                            </div>

                            {/* Advanced Options Toggle */}
                            <div>
                                <button
                                    onClick={() => setShowAdvanced(!showAdvanced)}
                                    className="flex items-center text-xs text-muted-foreground hover:text-primary transition-colors mb-2"
                                >
                                    {showAdvanced ? <ChevronDown className="h-3 w-3 mr-1" /> : <ChevronRight className="h-3 w-3 mr-1" />}
                                    Advanced Configuration
                                </button>

                                {showAdvanced && (
                                    <div className="p-3 bg-muted/50 rounded-lg animate-in fade-in slide-in-from-top-2">
                                        <label className="text-xs font-medium mb-1.5 block">
                                            Start URL (Optional - AI will decide if empty)
                                        </label>
                                        <Input
                                            type="url"
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            placeholder="https://..."
                                            disabled={isExecuting}
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Execute Button */}
                            <Button
                                onClick={executeTask}
                                disabled={isExecuting || !goal.trim()}
                                className="w-full h-12 text-lg font-semibold shadow-primary/25 shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                                size="lg"
                            >
                                {isExecuting ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Autonomous Mode Active...
                                    </>
                                ) : (
                                    <>
                                        <Play className="mr-2 h-5 w-5 fill-current" />
                                        Initialize Agent
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Planned Actions Preview */}
                    {plannedActions.length > 0 && (
                        <Card className="border-primary/10">
                            <CardHeader className="py-3">
                                <CardTitle className="text-sm font-medium flex items-center">
                                    <Terminal className="h-4 w-4 mr-2 text-muted-foreground" />
                                    Strategy Plan
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="py-0 pb-3">
                                <ul className="space-y-2">
                                    {plannedActions.map((action, i) => (
                                        <li key={i} className="text-xs flex items-start gap-2 text-muted-foreground">
                                            <Badge variant="outline" className="text-[10px] h-5 px-1 uppercase shrink-0 min-w-[60px] justify-center">
                                                {action.type}
                                            </Badge>
                                            <span className="font-mono truncate">{action.selector || action.url || 'Checking page...'}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}

                    {/* Example Tasks */}
                    {!isExecuting && !result && (
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">Suggested Missions</p>
                            {exampleTasks.map((task, index) => (
                                <button
                                    key={index}
                                    className="w-full text-left p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors text-sm flex items-center group"
                                    onClick={() => {
                                        setGoal(task.goal);
                                        setUrl(task.url);
                                    }}
                                >
                                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-3 group-hover:bg-primary/20 transition-colors">
                                        <Zap className="h-3 w-3 text-primary" />
                                    </div>
                                    {task.goal}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Mission Control / Results */}
                <div className="lg:col-span-7 space-y-6">

                    {/* Live Feed / Terminal */}
                    <Card className={cn("h-full min-h-[400px] flex flex-col overflow-hidden transition-colors border-2", isExecuting ? "border-primary/50 shadow-[0_0_30px_-5px_hsl(var(--primary)/0.3)]" : "border-border")}>
                        <CardHeader className="bg-muted/30 border-b py-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-mono flex items-center gap-2">
                                    <span className="relative flex h-2 w-2">
                                        <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", isExecuting ? "bg-green-400" : "bg-gray-400")}></span>
                                        <span className={cn("relative inline-flex rounded-full h-2 w-2", isExecuting ? "bg-green-500" : "bg-gray-500")}></span>
                                    </span>
                                    UAL™ Live Feed
                                </CardTitle>
                                {result && (
                                    <Badge variant={result.success ? "default" : "destructive"} className="text-xs">
                                        {result.success ? "SUCCESS" : "FAILED"}
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>

                        <div className="flex-1 bg-black/95 p-4 font-mono text-xs md:text-sm overflow-y-auto font-medium" ref={scrollRef}>
                            {logs.length === 0 && !result ? (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                                    <Globe className="h-16 w-16 mb-4 stroke-[1.5]" />
                                    <p>Awaiting Mission Parameters...</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {logs.map((log, i) => (
                                        <div key={i} className="flex gap-3 animate-in fade-in slide-in-from-left-1 duration-300">
                                            <span className="text-muted-foreground select-none">[{new Date().toLocaleTimeString()}]</span>
                                            <span className={cn(
                                                log.includes('❌') ? "text-red-400" :
                                                    log.includes('✅') ? "text-green-400" :
                                                        log.includes('✨') ? "text-yellow-400" :
                                                            log.includes('🧠') ? "text-purple-400" :
                                                                "text-gray-300"
                                            )}>
                                                {log}
                                            </span>
                                        </div>
                                    ))}

                                    {result?.steps?.map((step, i) => (
                                        <div key={`step-${i}`} className="flex gap-3 text-gray-400 pl-4 border-l-2 border-gray-800 ml-2">
                                            <span>{step}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Result Preview Area */}
                        {result?.screenshot && (
                            <div className="border-t border-border bg-muted/20 p-4">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center">
                                    <CheckCircle2 className="h-3 w-3 mr-1.5" />
                                    Visual Confirmation
                                </h3>
                                <div className="relative aspect-video w-full rounded-lg overflow-hidden border shadow-lg group">
                                    <img
                                        src={`data:image/png;base64,${result.screenshot}`}
                                        alt="Mission Result"
                                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                        <div className="text-white text-xs">
                                            <p className="font-semibold">{result.data?.title || 'Unknown Page'}</p>
                                            <p className="opacity-80 truncate max-w-md">{result.data?.url}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}
