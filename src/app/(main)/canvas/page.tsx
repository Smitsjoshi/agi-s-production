'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Sparkles, Globe, Terminal, Cpu, Search, Link, ThumbsUp, ThumbsDown, Zap, BarChart3, Layers, StopCircle, Play, ChevronRight, Activity, Layout, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UALAgentLoop, AgentStep } from '@/lib/ual/ual-agent-loop';

export default function CanvasPage() {
    const [goal, setGoal] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [steps, setSteps] = useState<AgentStep[]>([]);
    const [currentScreenshot, setCurrentScreenshot] = useState<string | null>(null);
    const [error, setError] = useState('');

    const agentRef = useRef<UALAgentLoop | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        agentRef.current = new UALAgentLoop();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [steps]);

    const handleStart = async () => {
        if (!goal.trim() || !agentRef.current) return;

        setIsRunning(true);
        setError('');
        setSteps([]);
        setCurrentScreenshot(null);

        try {
            await agentRef.current.run(goal, (step) => {
                setSteps(prev => [...prev, step]);
                if (step.screenshot) {
                    setCurrentScreenshot(step.screenshot);
                }
                if (step.type === 'completed' || step.type === 'failed') {
                    setIsRunning(false);
                }
            });
        } catch (err: any) {
            setError(`Agent crashed: ${err.message}`);
            setIsRunning(false);
        }
    };

    const handleStop = () => {
        if (agentRef.current) {
            agentRef.current.stop();
            setSteps(prev => [...prev, {
                type: 'failed',
                message: 'Agent stopped by user.',
                timestamp: Date.now()
            }]);
            setIsRunning(false);
        }
    };

    return (
        <div className="h-screen bg-[#020202] text-white font-sans flex flex-col overflow-hidden relative">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(37,99,235,0.1)_0%,rgba(0,0,0,0)_60%)] pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none"></div>

            {/* Header / Control Bar */}
            <div className="h-20 border-b border-white/10 flex items-center justify-between px-8 bg-[#050505]/80 backdrop-blur-3xl z-20">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                        <Cpu className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight">Autonomous Agent</h1>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-black">Universal Action Layer v2.0</p>
                    </div>
                </div>

                <div className="flex-1 max-w-2xl mx-12">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-cyan-500/20 rounded-2xl blur opacity-25 group-hover:opacity-40 transition"></div>
                        <div className="relative bg-white/5 border border-white/10 rounded-2xl flex items-center p-1 px-4 pr-1">
                            <Search className="h-4 w-4 text-white/20 mr-3" />
                            <Input
                                value={goal}
                                onChange={(e) => setGoal(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !isRunning && handleStart()}
                                placeholder="State your objective (e.g., Find the price of BTC on Binance)..."
                                className="bg-transparent border-0 h-10 text-sm focus-visible:ring-0 placeholder:text-white/10"
                                disabled={isRunning}
                            />
                            {isRunning ? (
                                <Button onClick={handleStop} variant="destructive" size="sm" className="rounded-xl h-8 gap-2">
                                    <StopCircle className="h-3.5 w-3.5" />
                                    <span>Stop</span>
                                </Button>
                            ) : (
                                <Button onClick={handleStart} disabled={!goal.trim()} className="bg-white text-black hover:bg-neutral-200 rounded-xl h-8 gap-2 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                                    <Play className="h-3 w-3 fill-black" />
                                    <span>Launch</span>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">Latency</span>
                        <div className="flex items-center gap-1.5 text-blue-400">
                            <Zap className="h-3 w-3" />
                            <span className="text-xs font-semibold font-mono">1.2ms</span>
                        </div>
                    </div>
                    <div className="h-8 w-px bg-white/10"></div>
                    <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                        <Layout className="h-4 w-4 text-white/40" />
                    </div>
                </div>
            </div>

            {/* Main Workspace */}
            <div className="flex-1 flex overflow-hidden">

                {/* Side A: Agent Timeline */}
                <div className="w-[400px] border-r border-white/10 flex flex-col bg-[#050505]/40 backdrop-blur-xl z-10">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/60">Execution Timeline</h2>
                        <div className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-tighter">Live Monitor</span>
                        </div>
                    </div>

                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                        {steps.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-4">
                                <Terminal className="h-12 w-12" />
                                <p className="text-[10px] uppercase tracking-widest font-black text-center leading-relaxed">System Ready<br />Waiting for Goal Input</p>
                            </div>
                        )}

                        {steps.map((step, idx) => (
                            <div key={idx} className={cn(
                                "relative pl-8 animate-in fade-in slide-in-from-left-4 duration-500",
                                idx === steps.length - 1 ? "pb-0" : "pb-6"
                            )}>
                                {/* Connecting Line */}
                                {idx !== steps.length - 1 && (
                                    <div className="absolute left-[11px] top-6 bottom-0 w-px bg-white/10"></div>
                                )}

                                {/* Status Icon */}
                                <div className={cn(
                                    "absolute left-0 top-0 h-6 w-6 rounded-lg border flex items-center justify-center",
                                    step.type === 'planning' && "bg-blue-500/10 border-blue-500/30 text-blue-400",
                                    step.type === 'executing' && "bg-amber-500/10 border-amber-500/30 text-amber-400",
                                    step.type === 'observing' && "bg-purple-500/10 border-purple-500/30 text-purple-400",
                                    step.type === 'completed' && "bg-emerald-500 text-white border-emerald-400",
                                    step.type === 'failed' && "bg-red-500 text-white border-red-400"
                                )}>
                                    {step.type === 'planning' && <Sparkles className="h-3 w-3" />}
                                    {step.type === 'executing' && <Activity className="h-3 w-3" />}
                                    {step.type === 'observing' && <Eye className="h-3 w-3" />}
                                    {step.type === 'completed' && <Zap className="h-3 w-3 fill-white" />}
                                    {step.type === 'failed' && <StopCircle className="h-3 w-3" />}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-widest",
                                            step.type === 'planning' && "text-blue-400",
                                            step.type === 'executing' && "text-amber-400",
                                            step.type === 'observing' && "text-purple-400",
                                            step.type === 'completed' && "text-emerald-400",
                                            step.type === 'failed' && "text-red-400"
                                        )}>
                                            {step.type}
                                        </span>
                                        <span className="text-[9px] text-white/20 font-mono">
                                            {new Date(step.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-white/80 leading-relaxed font-light">
                                        {step.message}
                                    </p>

                                    {step.actions && (
                                        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 space-y-1.5 mt-2">
                                            {step.actions.map((action, aidx) => (
                                                <div key={aidx} className="flex items-center gap-2 text-[11px] font-mono text-white/40">
                                                    <ChevronRight className="h-3 w-3 text-blue-500" />
                                                    <span className="text-blue-300 capitalize">{action.type}</span>
                                                    <span className="truncate">{action.url || action.selector || ''}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {error && (
                        <div className="p-6 bg-red-500/10 border-t border-red-500/20 text-red-400 text-xs flex items-center gap-3">
                            <StopCircle className="h-4 w-4 shrink-0" />
                            <span className="font-semibold tracking-tight">{error}</span>
                        </div>
                    )}
                </div>

                {/* Side B: Browser Viewport */}
                <div className="flex-1 bg-[#020202] relative flex flex-col items-center justify-center overflow-hidden">
                    {!currentScreenshot ? (
                        <div className="relative group">
                            <div className="absolute -inset-10 bg-blue-600/10 blur-[100px] rounded-full opacity-50"></div>
                            <div className="relative h-[480px] w-[800px] border border-white/10 rounded-[2.5rem] bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center space-y-6 shadow-2xl">
                                <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center animate-pulse">
                                    <Globe className="h-8 w-8 text-white/20" />
                                </div>
                                <div className="text-center space-y-2">
                                    <h3 className="text-lg font-bold text-white/40">Virtual Browser Inactive</h3>
                                    <p className="text-sm text-white/20 font-light">Launch an agent to initialize the display</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full h-full p-12 transition-all duration-1000 animate-in zoom-in-95 fade-in">
                            <div className="w-full h-full bg-[#111] rounded-[2.5rem] overflow-hidden border border-white/20 shadow-[0_0_80px_rgba(0,0,0,0.8)] flex flex-col">
                                {/* Browser URL Bar Decoration */}
                                <div className="h-12 bg-neutral-900 border-b border-white/10 flex items-center px-6 gap-6">
                                    <div className="flex gap-2">
                                        <div className="h-3 w-3 rounded-full bg-white/10"></div>
                                        <div className="h-3 w-3 rounded-full bg-white/10"></div>
                                        <div className="h-3 w-3 rounded-full bg-white/10"></div>
                                    </div>
                                    <div className="flex-1 bg-black/40 h-7 rounded-lg px-4 flex items-center justify-center text-[10px] text-white/40 font-mono tracking-tight">
                                        <span className="opacity-50 mr-1">https://</span>
                                        {steps.find(s => s.type === 'observing')?.message.split('at ')[1] || 'browser.agi-s.dev'}
                                    </div>
                                    <div className="h-7 w-7 rounded-lg bg-white/5 flex items-center justify-center">
                                        <StopCircle className="h-3 w-3 text-white/20" />
                                    </div>
                                </div>

                                {/* Live Screenshot Content */}
                                <div className="flex-1 bg-white overflow-hidden relative group">
                                    <img
                                        src={`data:image/png;base64,${currentScreenshot}`}
                                        alt="Agent View"
                                        className="w-full h-full object-contain"
                                    />
                                    {/* Interaction Overlay (Simulated) */}
                                    {isRunning && (
                                        <div className="absolute inset-0 bg-blue-500/5 pointer-events-none flex items-center justify-center">
                                            <div className="p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-3 animate-pulse">
                                                <Activity className="h-4 w-4 text-blue-400" />
                                                <span className="text-xs font-black uppercase tracking-widest">Autonomous Control Active</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Status Footer */}
                    <div className="absolute bottom-8 right-8 flex items-center gap-3">
                        <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-2">
                            <div className={cn("h-1.5 w-1.5 rounded-full", isRunning ? "bg-emerald-500 animate-ping" : "bg-white/20")}></div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                                {isRunning ? "Kernel Active" : "Kernel Idle"}
                            </span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
