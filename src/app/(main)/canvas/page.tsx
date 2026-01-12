'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Loader2, Sparkles, Globe, Terminal, Cpu, Search,
    StopCircle, Play, ChevronRight, Activity,
    Layout, Eye, ShieldCheck, Wifi, MoreHorizontal,
    Maximize2, Zap, Radio, Command
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UALAgentLoop } from '@/lib/ual/ual-agent-loop';
import { AgentStep, WebAction } from '@/lib/universal-action-layer';

export default function CanvasPage() {
    const [goal, setGoal] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [steps, setSteps] = useState<AgentStep[]>([]);
    const [currentScreenshot, setCurrentScreenshot] = useState<string | null>(null);
    const [browserScreenshot, setBrowserScreenshot] = useState<string | null>(null);
    const [hasLiveBrowser, setHasLiveBrowser] = useState(false);
    const [error, setError] = useState('');
    const [currentTime, setCurrentTime] = useState<string>('');
    const [bridgeConnected, setBridgeConnected] = useState(false);
    const [browserType, setBrowserType] = useState<'chromium' | 'firefox' | 'webkit'>('chromium');

    const agentRef = useRef<UALAgentLoop | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Clock for the status bar
    useEffect(() => {
        const t = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString([], { hour12: false }));
        }, 1000);
        return () => clearInterval(t);
    }, []);

    // Check Desktop Bridge Status
    useEffect(() => {
        const checkBridge = setInterval(() => {
            const isOnline = agentRef.current?.isBridgeConnected() || false;
            setBridgeConnected(isOnline);
        }, 2000);
        return () => clearInterval(checkBridge);
    }, []);

    // Poll for live browser view (Prefer Bridge, fallback to API)
    useEffect(() => {
        if (!isRunning) return;

        const interval = setInterval(async () => {
            try {
                // If bridge connected, screenshot comes from UALAgentLoop via onStep
                // If not, we poll the API as fallback
                if (!bridgeConnected) {
                    const res = await fetch('/api/ual/browser');
                    if (res.ok) {
                        const blob = await res.blob();
                        if (blob.size > 0) {
                            const url = URL.createObjectURL(blob);
                            setBrowserScreenshot(prev => {
                                if (prev) URL.revokeObjectURL(prev);
                                return url;
                            });
                        }
                    }
                }
            } catch (e) {
                console.error("Polling error", e);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [isRunning, bridgeConnected]);

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
            // Ensure bridge is connected before starting
            if (!agentRef.current.isBridgeConnected()) {
                setError('Desktop Bridge offline. Restart it with: node src/server/desktop-bridge.js');
                setIsRunning(false);
                return;
            }

            await agentRef.current.run(goal, (step) => {
                setSteps(prev => [...prev, step]);
                if (step.screenshot) {
                    setBrowserScreenshot(`data:image/jpeg;base64,${step.screenshot}`);
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
            setIsRunning(false);
            setSteps(prev => [...prev, {
                type: 'failed',
                message: 'SYSTEM INTERRUPT: Stop command issued by user.',
                timestamp: Date.now()
            }]);
        }
    };

    return (
        <div className="h-screen bg-[#030303] text-white font-sans flex flex-col overflow-hidden relative selection:bg-blue-500/30">

            {/* AMBIENT BACKGROUND */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[20%] w-[1000px] h-[1000px] bg-blue-600/5 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[10000ms]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-purple-600/5 rounded-full blur-[100px] mix-blend-screen"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
            </div>

            {/* HEADER - HUD STYLE */}
            <div className="h-16 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl z-50 flex items-center justify-between px-6 sticky top-0">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 group cursor-default">
                        <div className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/20 transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                            <Cpu className="h-5 w-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold tracking-tight text-white/90">AGI-S Canvas</span>
                            <span className="text-[9px] uppercase tracking-widest text-white/30 font-semibold group-hover:text-blue-400/50 transition-colors">Neural Interface V3.0</span>
                        </div>
                    </div>

                    <div className="h-6 w-px bg-white/5 mx-2" />

                    {/* Quick Stats HUD - Only visible on desktop */}
                    <div className="hidden md:flex gap-6">
                        <div className="flex flex-col">
                            <span className="text-[9px] uppercase text-white/20 font-bold tracking-wider">Bridge</span>
                            <div className="flex items-center gap-1.5">
                                <div className={cn("h-1.5 w-1.5 rounded-full", bridgeConnected ? "bg-emerald-500 animate-pulse" : "bg-red-500")} />
                                <span className={cn("text-[10px] font-mono", bridgeConnected ? "text-emerald-500" : "text-red-500")}>
                                    {bridgeConnected ? "CONNECTED" : "OFFLINE"}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] uppercase text-white/20 font-bold tracking-wider">Engine</span>
                            <span className="text-[10px] font-mono text-white/60">LOCAL INTEL</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] uppercase text-white/20 font-bold tracking-wider">Browser</span>
                            <select
                                value={browserType}
                                onChange={(e) => setBrowserType(e.target.value as any)}
                                className="bg-transparent text-[10px] font-mono text-white/60 border-0 p-0 focus:ring-0 cursor-pointer"
                            >
                                <option value="chromium">CHROMIUM</option>
                                <option value="firefox">FIREFOX</option>
                                <option value="webkit">WEBKIT</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* SEARCH/COMMAND BAR */}
                <div className="flex-1 max-w-xl mx-12 relative z-50">
                    <div className={cn(
                        "relative flex items-center transition-all duration-300 ease-out",
                        isRunning ? "opacity-50 pointer-events-none grayscale" : "opacity-100"
                    )}>
                        <div className="absolute inset-0 bg-blue-500/5 blur-xl rounded-full opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="bg-[#0A0A0A] border border-white/10 hover:border-white/20 focus-within:border-blue-500/50 focus-within:bg-[#0f0f0f] focus-within:ring-1 focus-within:ring-blue-500/20 rounded-xl flex items-center h-11 w-full px-4 shadow-lg transition-all">
                            <Command className="h-4 w-4 text-white/30 mr-3 animate-pulse" />
                            {/* Chat Input Area - Force High Z-Index */}
                            <div className="bg-transparent h-full text-sm font-light placeholder:text-white/20 focus-visible:ring-0 px-0 tracking-wide flex-1 z-50 relative pointer-events-auto">
                                <Input
                                    placeholder="Enter objective for autonomous execution..."
                                    value={goal}
                                    onChange={(e) => setGoal(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && !isRunning && handleStart()}
                                    className="bg-transparent border-0 h-full w-full"
                                    disabled={isRunning}
                                />
                            </div>
                            {isRunning ? (
                                <Button onClick={handleStop} variant="ghost" size="sm" className="h-7 px-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg text-xs uppercase font-bold tracking-wider gap-2 ml-2">
                                    <StopCircle className="h-3 w-3" /> Stop
                                </Button>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-white/20 font-mono hidden sm:inline-block">CMD + ENTER</span>
                                    <Button onClick={handleStart} disabled={!goal.trim()} size="icon" className="h-7 w-7 rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 transition-all hover:scale-105 active:scale-95">
                                        <Play className="h-3 w-3 fill-current ml-0.5" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* User/System Menu */}
                <div className="flex items-center gap-4">
                    <div className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition cursor-pointer">
                        <Layout className="h-4 w-4 text-white/50" />
                    </div>
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-900/20 cursor-pointer">
                        <span className="text-xs font-bold text-white">S</span>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="flex-1 grid grid-cols-[400px_1fr] overflow-hidden">

                {/* LEFT: NEURAL LOG (Timeline) */}
                <div className="border-r border-white/5 bg-[#040404] flex flex-col relative z-10">
                    <div className="h-10 border-b border-white/5 flex items-center justify-between px-4 bg-[#060606]">
                        <div className="flex items-center gap-2 text-white/40">
                            <Terminal className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Neural Log</span>
                        </div>
                        <MoreHorizontal className="h-4 w-4 text-white/20 cursor-pointer hover:text-white/50" />
                    </div>

                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                        {steps.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-white/20 space-y-4 select-none">
                                <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
                                    <Play className="h-6 w-6 opacity-50" />
                                </div>
                                <div className="text-center">
                                    <p className="text-xs font-bold uppercase tracking-widest text-white/30">System Idle</p>
                                    <p className="text-[10px] text-white/20 mt-1">Awaiting Launch Command</p>
                                </div>
                            </div>
                        )}

                        {steps.map((step, idx) => (
                            <div key={idx} className="group relative pl-6 animate-in fade-in slide-in-from-left-2 duration-300">
                                {/* Timeline Line */}
                                {idx !== steps.length - 1 && (
                                    <div className="absolute left-[7px] top-6 bottom-[-16px] w-[2px] bg-white/5 group-hover:bg-white/10 transition-colors"></div>
                                )}

                                {/* Dot */}
                                <div className={cn(
                                    "absolute left-0 top-1.5 h-4 w-4 rounded-full border-[3px] z-10 transition-colors duration-300 flex items-center justify-center bg-[#040404]",
                                    step.type === 'planning' && "border-blue-500/50 group-hover:border-blue-400",
                                    step.type === 'executing' && "border-amber-500/50 group-hover:border-amber-400",
                                    step.type === 'observing' && "border-purple-500/50 group-hover:border-purple-400",
                                    step.type === 'completed' && "border-emerald-500 group-hover:border-emerald-400",
                                    step.type === 'failed' && "border-red-500 group-hover:border-red-400"
                                )}>
                                    <div className={cn("h-1 w-1 rounded-full",
                                        step.type === 'planning' && "bg-blue-500",
                                        step.type === 'executing' && "bg-amber-500",
                                        step.type === 'observing' && "bg-purple-500",
                                        step.type === 'completed' && "bg-emerald-500",
                                        step.type === 'failed' && "bg-red-500"
                                    )}></div>
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <span className={cn(
                                            "text-[10px] font-bold uppercase tracking-wider",
                                            step.type === 'planning' && "text-blue-400",
                                            step.type === 'executing' && "text-amber-400",
                                            step.type === 'observing' && "text-purple-400",
                                            step.type === 'completed' && "text-emerald-400",
                                            step.type === 'failed' && "text-red-400"
                                        )}>
                                            {step.type}
                                        </span>
                                        <span className="text-[9px] font-mono text-white/20">
                                            {new Date(step.timestamp).toLocaleTimeString([], { hour12: false, second: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>

                                    <p className="text-xs text-white/70 font-light leading-relaxed font-mono">
                                        {step.message}
                                    </p>

                                    {/* Action Chips */}
                                    {step.actions && (
                                        <div className="grid gap-1 mt-2">
                                            {step.actions.map((action: WebAction, aidx: number) => (
                                                <div key={aidx} className="bg-white/5 border border-white/5 rounded px-2 py-1.5 flex items-center gap-2 text-[10px] font-mono text-white/50 group/action hover:bg-white/10 transition-colors cursor-default">
                                                    <ChevronRight className="h-3 w-3 text-white/20 group-hover/action:text-white/50" />
                                                    <span className={cn(
                                                        "uppercase font-bold",
                                                        action.type === 'navigate' && "text-blue-400/80",
                                                        action.type === 'click' && "text-amber-400/80",
                                                        action.type === 'type' && "text-emerald-400/80"
                                                    )}>{action.type === 'type' ? 'INPUT' : action.type === 'click' ? 'SELECT' : action.type}</span>
                                                    <span className="truncate opacity-80 flex-1">
                                                        {action.type === 'navigate' && `Navigating to ${action.url?.replace('https://', '')}`}
                                                        {action.type === 'type' && `Entering data...`}
                                                        {action.type === 'click' && `Executing interaction...`}
                                                        {(!['navigate', 'type', 'click'].includes(action.type || '')) && (action.url || action.selector || action.value || '')}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT: BROWSER VIEWPORT */}
                <div className="bg-[#080808] relative flex flex-col p-6 items-center justify-center overflow-hidden">
                    <div className="w-full h-full max-w-5xl flex flex-col transition-all duration-700">
                        {/* Browser Frame */}
                        <div className="flex-1 bg-[#0a0a0a] rounded-xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.6)] border border-white/5 flex flex-col relative group">
                            {/* Browser Toolbar */}
                            <div className="h-10 bg-[#141414] flex items-center px-4 gap-4 border-b border-white/5">
                                <div className="flex gap-1.5 grayscale opacity-40">
                                    <div className="h-2.5 w-2.5 rounded-full bg-[#FF5F56]"></div>
                                    <div className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]"></div>
                                    <div className="h-2.5 w-2.5 rounded-full bg-[#27C93F]"></div>
                                </div>
                                <div className="flex-1 h-6 bg-black/40 rounded flex items-center px-3 border border-white/5">
                                    <Globe className="h-3 w-3 text-white/20 mr-2" />
                                    <span className="text-[10px] text-white/40 font-mono truncate">
                                        {steps.findLast(s => s.type === 'observing')?.message.split('at ')[1] || 'neural://canvas-session'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded border",
                                        bridgeConnected ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5" : "text-amber-500 border-amber-500/20 bg-amber-500/5")}>
                                        {bridgeConnected ? "GHOST_PROTOCOL_LIVE" : "GHOST_MODE_OFFLINE"}
                                    </div>
                                </div>
                            </div>

                            {/* Viewport Stream */}
                            <div className="flex-1 bg-black overflow-hidden relative group">
                                {browserScreenshot || currentScreenshot ? (
                                    <img
                                        src={browserScreenshot || `data:image/jpeg;base64,${currentScreenshot}`}
                                        alt="Live Browser View"
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,transparent_70%)]">
                                        <div className="h-24 w-24 rounded-full border border-white/5 flex items-center justify-center bg-white/5 mb-6 animate-pulse">
                                            <Zap className="h-10 w-10 text-blue-400/50" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white/40 tracking-tight">Neural Canvas Idle</h3>
                                        <p className="text-[10px] text-white/20 mt-2 font-mono">AWAITING_OBJECTIVE_STREAM</p>
                                    </div>
                                )}

                                {/* Overlay Elements */}
                                {isRunning && (
                                    <div className="absolute top-4 right-4 animate-in fade-in zoom-in duration-500">
                                        <div className="bg-black/80 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2 shadow-2xl">
                                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                                            AUTONOMOUS_MODE
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* OUTPUT TERMINAL WINDOW (Functional Results) */}
                            <div className="h-48 bg-[#050505] border-t border-white/5 flex flex-col">
                                <div className="h-8 border-b border-white/5 px-4 flex items-center justify-between bg-white/[0.02]">
                                    <div className="flex items-center gap-2">
                                        <Terminal className="h-3 w-3 text-white/40" />
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">Extraction Terminal</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-1 w-1 rounded-full bg-emerald-500"></div>
                                        <span className="text-[8px] text-white/20 font-mono">STREAMING_LIVE</span>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 font-mono text-[10px] space-y-2">
                                    {steps.filter(s => s.type === 'completed' || s.type === 'observing' && s.message.length > 50).length > 0 ? (
                                        steps.filter(s => s.type === 'completed' || s.type === 'observing' && s.message.length > 50).map((s, i) => (
                                            <div key={i} className="flex gap-3 text-white/60 animate-in slide-in-from-left-2">
                                                <span className="text-blue-500/50 shrink-0">[{i + 1}]</span>
                                                <p className="leading-relaxed">{s.message}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-white/10 italic">
                                            No data extracted yet. Results will stream here during execution.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
