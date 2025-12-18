'use client';

/**
 * AGI-S Canvas - Nebula Interface
 * Premium, glassmorphic, high-end "AI" aesthetic.
 * Inspired by Linear, Raycast, and Vercel dark modes.
 */

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Sparkles, Wand2, Globe, Command, Zap, Layers, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { UALClient } from '@/lib/universal-action-layer';
import type { UALResult, WebAction } from '@/lib/universal-action-layer';
import { cn } from '@/lib/utils';

export default function CanvasPage() {
    const [goal, setGoal] = useState('');
    const [isExecuting, setIsExecuting] = useState(false);
    const [result, setResult] = useState<UALResult | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [plannedActions, setPlannedActions] = useState<WebAction[]>([]);
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
        setPlannedActions([]);
        setErrorDetails(null);

        addLog('Initializing Nebula Engine...');

        try {
            addLog('Synthesizing Plan...');
            await new Promise(resolve => setTimeout(resolve, 600)); // Smooth animation delay

            const actions = await ualClient.planActions(goal, '');
            setPlannedActions(actions);
            addLog(`Plan Created: ${actions.length} Vectors Identified.`);

            addLog('Engaging Universal Action Layer...');
            const taskResult = await ualClient.executeTask({
                goal,
                url: '',
                actions,
            });

            setResult(taskResult);
            if (taskResult.success) {
                addLog('Execution Successful.');
            } else {
                addLog('Execution Finished with Warnings.');
                if (taskResult.error) setErrorDetails(taskResult.error);
            }

        } catch (error: any) {
            const errorMsg = error.message || 'Unknown Error';
            setResult({
                success: false,
                error: errorMsg,
                steps: [`Failed: ${errorMsg}`],
            });
            addLog('Critical System Error.');
            setErrorDetails(errorMsg);
        } finally {
            setIsExecuting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#08090a] text-white font-sans overflow-hidden selection:bg-indigo-500/30 selection:text-white flex flex-col items-center pt-24 pb-12 px-6 relative">

            {/* Ambient Background */}
            <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute top-[10%] right-[10%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none"></div>

            {/* Main Container */}
            <div className="w-full max-w-4xl z-10 flex flex-col gap-8">

                {/* Title Section */}
                <div className="text-center space-y-3 mb-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest text-indigo-300 mb-2">
                        <Sparkles className="h-3 w-3" />
                        <span>v3.0 Nebula</span>
                    </div>
                    <h1 className="text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/50">
                        Universal Action Layer
                    </h1>
                    <p className="text-lg text-white/40 font-light max-w-lg mx-auto leading-relaxed">
                        Command the web with fluid intelligence. Next-gen browser automation.
                    </p>
                </div>

                {/* The Input "Bar" - Glossy & Premium */}
                <div className="relative group max-w-2xl mx-auto w-full">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-700"></div>
                    <div className={`relative bg-[#0F1115] rounded-xl border border-white/10 flex items-center p-2 shadow-2xl transition-all duration-300 ${isExecuting ? 'ring-2 ring-indigo-500/20' : ''}`}>
                        <div className="pl-4 pr-3 text-indigo-400">
                            {isExecuting ? <Loader2 className="h-6 w-6 animate-spin" /> : <Wand2 className="h-6 w-6" />}
                        </div>
                        <Input
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !isExecuting && executeTask()}
                            placeholder="What would you like to automate today?"
                            className="bg-transparent border-0 text-lg h-14 text-white placeholder:text-white/20 focus-visible:ring-0 font-normal tracking-wide"
                            disabled={isExecuting}
                            autoFocus
                        />
                        <Button
                            onClick={executeTask}
                            disabled={isExecuting || !goal.trim()}
                            className="bg-white text-black hover:bg-white/90 h-10 px-5 rounded-lg font-medium transition-all"
                        >
                            Run
                        </Button>
                    </div>
                </div>

                {/* Error Toast */}
                {errorDetails && (
                    <div className="max-w-2xl mx-auto w-full bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-4 animate-in fade-in slide-in-from-top-4 backdrop-blur-md">
                        <div className="bg-red-500/20 p-2 rounded-lg h-fit">
                            <AlertTriangle className="h-5 w-5 text-red-400" />
                        </div>
                        <div>
                            <h3 className="text-red-400 font-medium text-sm">Action Failed</h3>
                            <p className="text-red-400/60 text-xs mt-1 leading-relaxed">{errorDetails}</p>
                            {errorDetails.includes('500') && (
                                <div className="mt-3 inline-block px-3 py-1 bg-red-500/10 border border-red-500/10 rounded text-[10px] text-red-300 mono">
                                    MISSING_VAR: GROQ_API_KEY
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Execution Stage */}
                {(isExecuting || result) && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 mt-8">

                        {/* Left: Console Log */}
                        <div className="lg:col-span-5 flex flex-col gap-4">
                            <div className="flex items-center gap-2 text-xs font-medium text-white/40 uppercase tracking-widest px-1">
                                <Layers className="h-3 w-3" />
                                Neural Process
                            </div>
                            <div className="bg-[#0F1115]/50 border border-white/5 rounded-2xl p-6 h-[300px] overflow-hidden flex flex-col relative backdrop-blur-sm">
                                <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-none" ref={scrollRef}>
                                    {logs.map((log, i) => (
                                        <div key={i} className="flex gap-3 text-sm group">
                                            <span className="text-white/20 text-xs mt-0.5 mono">{(i + 1).toString().padStart(2, '0')}</span>
                                            <span className={cn(
                                                "font-light tracking-wide transition-colors",
                                                log.includes('Failed') ? "text-red-400" :
                                                    log.includes('Successful') ? "text-emerald-400" :
                                                        log.includes('Plan Created') ? "text-indigo-300" :
                                                            "text-white/70"
                                            )}>{log}</span>
                                        </div>
                                    ))}
                                </div>
                                {/* Glass Overlay */}
                                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#0F1115] to-transparent pointer-events-none"></div>
                            </div>
                        </div>

                        {/* Right: Visual Preview */}
                        <div className="lg:col-span-7 flex flex-col gap-4">
                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-2 text-xs font-medium text-white/40 uppercase tracking-widest">
                                    <Globe className="h-3 w-3" />
                                    Viewport
                                </div>
                                {result?.data?.url && (
                                    <a href={result.data.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors">
                                        OPEN EXTERNAL <ArrowUpRight className="h-3 w-3" />
                                    </a>
                                )}
                            </div>

                            <div className="aspect-video bg-[#0F1115] border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative group">
                                {result?.screenshot ? (
                                    <>
                                        <img src={`data:image/png;base64,${result.screenshot}`} alt="Result" className="w-full h-full object-cover opacity-90 transition-opacity duration-500 group-hover:opacity-100" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                                        <div className="absolute bottom-6 left-6 right-6">
                                            <h3 className="text-white font-medium text-lg drop-shadow-lg">{result.data?.title}</h3>
                                            <p className="text-white/50 text-xs mt-1 font-mono bg-black/50 inline-block px-2 py-1 rounded backdrop-blur-md border border-white/5">{result.data?.url}</p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        {isExecuting ? (
                                            <div className="relative">
                                                <div className="w-16 h-16 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                                                <Zap className="absolute inset-0 m-auto h-6 w-6 text-indigo-500 animate-pulse" />
                                            </div>
                                        ) : (
                                            <Command className="h-12 w-12 text-white/10" />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                )}

                {/* Planned Actions Chips */}
                {plannedActions.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-6 delay-300">
                        {plannedActions.map((action, i) => (
                            <div key={i} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-white/60 font-light flex items-center gap-2 hover:bg-white/10 transition-colors cursor-default">
                                <span className="w-1 h-1 rounded-full bg-indigo-500"></span>
                                <span className="uppercase tracking-wider opacity-80">{action.type}</span>
                                {action.selector && <span className="opacity-40 font-mono truncate max-w-[100px]">| {action.selector}</span>}
                            </div>
                        ))}
                    </div>
                )}

            </div>

        </div>
    );
}
