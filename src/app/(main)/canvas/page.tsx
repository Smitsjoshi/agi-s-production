'use client';

/**
 * AGI-S Canvas - Ethereal Interface
 * Modern, glowing, high-tech AI aesthetic.
 */

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Globe, Zap, Activity, Radio, Cpu, Command, AlertTriangle } from 'lucide-react';
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

        addLog('✨ AGI-S Engine Initializing...');

        try {
            addLog('🧠 Thinking... (Liquid Intelligence)');

            // Simulate "Thinking" delay for UX
            await new Promise(resolve => setTimeout(resolve, 800));

            const actions = await ualClient.planActions(goal, '');

            setPlannedActions(actions);
            addLog(`⚡ Strategy Formulated: ${actions.length} Steps`);

            addLog('🌍 Automating Browser...');
            const taskResult = await ualClient.executeTask({
                goal,
                url: '',
                actions,
            });

            setResult(taskResult);
            if (taskResult.success) {
                addLog('✅ Task Completed Successfully');
            } else {
                addLog('⚠️ Task Completed with Warnings');
                if (taskResult.error) setErrorDetails(taskResult.error);
            }

        } catch (error: any) {
            const errorMsg = error.message || 'Unknown Error';
            setResult({
                success: false,
                error: errorMsg,
                steps: [`❌ Failed: ${errorMsg}`],
            });
            addLog(`❌ Critical Failure`);
            setErrorDetails(errorMsg);
        } finally {
            setIsExecuting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#030014] text-white font-sans selection:bg-purple-500/30 selection:text-white overflow-hidden relative">

            {/* Dynamic Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 flex flex-col min-h-screen">

                {/* Head-Up Display (HUD) Header */}
                <div className="flex justify-between items-center mb-12 border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-tr from-blue-500 to-purple-600 p-2 rounded-lg shadow-lg shadow-purple-500/20">
                            <Cpu className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-100 to-purple-200 tracking-tight text-xl">AGI-S CANVAS</h1>
                            <p className="text-[10px] text-blue-200/50 uppercase tracking-widest">Autonomous Neural Interface</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-mono">
                        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5 text-blue-300/80">
                            <Activity className="h-3 w-3 animate-pulse" />
                            <span>SYSTEM_ONLINE</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5 text-purple-300/80">
                            <Radio className="h-3 w-3" />
                            <span>V.2.5.0</span>
                        </div>
                    </div>
                </div>

                {/* Main Control Unit */}
                <div className="flex flex-col flex-1 gap-8">

                    {/* Input Field - Glowing & Modern */}
                    <div className="w-full relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                        <div className="relative bg-[#0a0a10]/90 backdrop-blur-xl rounded-xl border border-white/10 flex items-center p-2 shadow-2xl">
                            <div className="pl-4 pr-3 text-blue-400">
                                {isExecuting ? <Loader2 className="h-6 w-6 animate-spin" /> : <Sparkles className="h-6 w-6" />}
                            </div>
                            <Input
                                value={goal}
                                onChange={(e) => setGoal(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !isExecuting && executeTask()}
                                placeholder="Describe your objective..."
                                className="bg-transparent border-0 text-lg h-14 text-white placeholder:text-blue-200/30 focus-visible:ring-0 font-light"
                                disabled={isExecuting}
                                autoFocus
                            />
                            <Button
                                onClick={executeTask}
                                disabled={isExecuting || !goal.trim()}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 h-12 px-6 rounded-lg shadow-lg shadow-purple-500/20 transition-all font-medium tracking-wide"
                            >
                                <span className="mr-2">INITIATE</span>
                                <Zap className="h-4 w-4 fill-white" />
                            </Button>
                        </div>
                    </div>

                    {/* Error Banner */}
                    {errorDetails && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                            <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="text-red-400 font-medium text-sm">Execution Interrupted</h3>
                                <p className="text-red-400/70 text-xs mt-1">{errorDetails}</p>
                                {errorDetails.includes('500') && (
                                    <p className="text-red-300 text-xs mt-2 font-mono bg-red-900/20 px-2 py-1 rounded">
                                        HINT: Check if GROQ_API_KEY is missing in your environment.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Split View: Console & Visual */}
                    {(isExecuting || result) && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 animate-in fade-in slide-in-from-bottom-6 duration-700">

                            {/* Left: Holographic Console */}
                            <div className="lg:col-span-4 flex flex-col">
                                <div className="bg-[#0a0a10]/80 border border-white/5 rounded-t-xl p-3 flex items-center justify-between">
                                    <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">Neural Logs</span>
                                    <div className="flex gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    </div>
                                </div>
                                <div className="flex-1 bg-black/60 border-x border-b border-white/5 rounded-b-xl p-4 font-mono text-xs overflow-y-auto min-h-[400px]" ref={scrollRef}>
                                    {logs.map((log, i) => (
                                        <div key={i} className="mb-2 pl-3 border-l-2 border-white/10 hover:border-blue-500/50 transition-colors">
                                            <span className={cn(
                                                "block break-words",
                                                log.includes('❌') ? "text-red-400" :
                                                    log.includes('✅') ? "text-green-400" :
                                                        log.includes('✨') ? "text-purple-300" :
                                                            log.includes('⚡') ? "text-yellow-300" :
                                                                "text-blue-100/70"
                                            )}>{log}</span>
                                        </div>
                                    ))}
                                    {isExecuting && (
                                        <div className="flex items-center gap-2 text-blue-500/50 mt-4 animate-pulse">
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                            <span>Processing...</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right: Visual Uplink & Plan */}
                            <div className="lg:col-span-8 flex flex-col gap-6">

                                {/* Browser Visualizer */}
                                <div className="relative aspect-video bg-[#050505] border border-white/10 rounded-xl overflow-hidden shadow-2xl group ring-1 ring-white/5">
                                    {/* Overlay Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#030014] via-transparent to-transparent opacity-80 z-10 pointer-events-none"></div>

                                    {result?.screenshot ? (
                                        <>
                                            <img src={`data:image/png;base64,${result.screenshot}`} alt="Feed" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                                            <div className="absolute bottom-4 left-4 z-20">
                                                <h3 className="text-white font-medium text-lg drop-shadow-md">{result.data?.title}</h3>
                                                <div className="mt-1 inline-flex items-center gap-2 px-2 py-1 bg-white/10 backdrop-blur-md rounded text-xs text-blue-200 border border-white/10">
                                                    <Globe className="h-3 w-3" />
                                                    {result.data?.url}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-white/20">
                                            {isExecuting ? (
                                                <div className="relative">
                                                    <div className="absolute inset-0 bg-blue-500/30 blur-3xl animate-pulse"></div>
                                                    <Globe className="h-16 w-16 text-blue-500 animate-spin-slow duration-[10s]" />
                                                </div>
                                            ) : (
                                                <Command className="h-16 w-16 opacity-20" />
                                            )}
                                            <p className="mt-4 text-sm font-light tracking-wide">VISUAL UPLINK STANDBY</p>
                                        </div>
                                    )}

                                    {/* Tech Corners */}
                                    <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-blue-500/50"></div>
                                    <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-blue-500/50"></div>
                                    <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-blue-500/50"></div>
                                    <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-blue-500/50"></div>
                                </div>

                                {/* Strategic Plan Cards */}
                                {plannedActions.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {plannedActions.map((action, i) => (
                                            <div key={i} className="bg-white/5 border border-white/5 p-3 rounded-lg backdrop-blur-sm hover:bg-white/10 transition-colors cursor-default group">
                                                <div className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Step {String(i + 1).padStart(2, '0')}</div>
                                                <div className="text-sm font-medium text-blue-100 group-hover:text-white transition-colors capitalize">{action.type}</div>
                                                <div className="text-[10px] text-white/50 truncate font-mono mt-1">{action.selector || action.url || 'N/A'}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                            </div>
                        </div>
                    )}

                </div>

            </div>
        </div>
    );
}
