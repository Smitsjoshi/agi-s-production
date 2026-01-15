'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGhostProtocol } from '@/hooks/use-ghost-protocol';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import {
    Cpu, Command, Globe, Zap, Eye, Layout,
    Terminal, MoreHorizontal, StopCircle, Play,
    ShieldCheck, Network, Share2, MousePointer
} from 'lucide-react';

// Types for logs
type LogEntry = {
    timestamp: string;
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
};

export default function CanvasPage() {
    const { isConnected } = useGhostProtocol();
    const [goal, setGoal] = useState('');
    const [isExecuting, setIsExecuting] = useState(false);
    const [hudActive, setHudActive] = useState(false);
    const [logs, setLogs] = useState<LogEntry[]>([]);

    // EXTENSION ID - HARDCODED FROM USER INFO
    const EXTENSION_ID = "baialnnocbgeedpbmhdfljmfofcopeic";

    const addLog = (type: LogEntry['type'], message: string) => {
        setLogs(prev => [{ timestamp: new Date().toLocaleTimeString(), type, message }, ...prev]);
    };

    // --- UAL DISPATCHER ---
    const dispatchUAL = (action: string, selector?: string, value?: string, type: 'EXECUTE' | 'BROADCAST' = 'EXECUTE') => {
        if (!isConnected) {
            toast({ title: "UAL Offline", description: "Browser Daemon not detected.", variant: "destructive" });
            addLog('error', 'Daemon Offline. Cannot execute command.');
            return;
        }

        if (window.chrome && window.chrome.runtime) {
            window.chrome.runtime.sendMessage(EXTENSION_ID, {
                type: type, // EXECUTE or BROADCAST
                action,
                selector,
                value
            }, (response) => {
                if (chrome.runtime.lastError) {
                    addLog('error', `Chrome Error: ${chrome.runtime.lastError.message}`);
                } else {
                    addLog('success', `[${action}] Response: ${JSON.stringify(response)}`);
                    if (response?.data) {
                        // If we got data back (like READ), show it
                        addLog('info', `Data Extracted: ${response.data.title || 'Unknown Title'}`);
                    }
                }
            });
            addLog('info', `Sent ${action} command via UAL...`);
        } else {
            addLog('error', 'Chrome Runtime API unavailable.');
        }
    };

    const handleHUDToggle = () => {
        const newState = !hudActive;
        setHudActive(newState);
        dispatchUAL('HUD_TOGGLE', undefined, newState as any, 'BROADCAST'); // Broadcast to all tabs
        toast({ title: newState ? "Neural HUD Active" : "Neural HUD Disabled", description: "Injected overlay into active browser tabs." });
    };

    const handleHiveMind = () => {
        addLog('info', 'Initiating Hive Mind Context Fusion...');
        // 1. Read context from current tab
        dispatchUAL('READ', undefined, undefined, 'EXECUTE');
        // 2. Logic would go here to store it in background.js and type it into another tab
        toast({ title: "Hive Mind Active", description: "Orchestrating context between tabs..." });
        setTimeout(() => addLog('success', 'Context Fusion Complete. (Simulation)'), 2000);
    };

    const handleGodModeStart = () => {
        if (!goal) return;
        setIsExecuting(true);
        addLog('info', `[SOVEREIGN OS] Initiating Task: "${goal}"`);

        // SIMULATION OF A COMPLEX AGENTIC LOOP
        // In a real implementation, this would call an API with the goal, 
        // which then sends multiple UAL commands back to the client/extension.
        setTimeout(() => {
            dispatchUAL('READ', undefined, undefined, 'EXECUTE'); // First, read the world
            setTimeout(() => {
                addLog('info', '[PLANNER] Analyzing DOM Tree...');
                setTimeout(() => {
                    addLog('success', '[EXECUTOR] Found objective target.');
                    setIsExecuting(false);
                    toast({ title: "Task Complete", description: "Sovereign OS executed 4 actions." });
                }, 2000);
            }, 1000);
        }, 500);
    };

    return (
        <div className="min-h-screen bg-[#030303] text-white font-sans flex flex-col overflow-hidden relative selection:bg-cyan-500/30">

            {/* AMBIENT MESH */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[20%] w-[1000px] h-[1000px] bg-cyan-600/5 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[10000ms]"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
            </div>

            {/* --- HEADER --- */}
            <div className="h-20 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl z-50 flex items-center justify-between px-8 sticky top-0">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                        <Cpu className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Sovereign OS</h1>
                        <div className="flex items-center gap-2">
                            <div className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                                {isConnected ? "UAL 2.0 LINKED" : "DAEMON OFFLINE"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* VISUALIZERS */}
                <div className="flex gap-4">
                    <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/5 flex items-center gap-3">
                        <Network className="h-4 w-4 text-purple-400" />
                        <span className="text-xs font-mono text-white/60">HIVE_NODES: {isConnected ? 'ACTIVE' : '0'}</span>
                    </div>
                    <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/5 flex items-center gap-3">
                        <ShieldCheck className="h-4 w-4 text-emerald-400" />
                        <span className="text-xs font-mono text-white/60">GHOST_MODE: SECURE</span>
                    </div>
                </div>
            </div>

            {/* --- MAIN DASHBOARD --- */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">

                {/* LEFT: COMMAND CENTER (Goal Input) */}
                <div className="lg:col-span-8 p-8 flex flex-col gap-6 overflow-y-auto">

                    {/* INPUT AREA */}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                        <div className="relative bg-[#0A0A0A] border border-white/10 rounded-xl p-6 shadow-2xl">
                            <div className="flex items-center gap-3 mb-4 text-cyan-400">
                                <Command className="h-5 w-5" />
                                <span className="text-xs font-bold uppercase tracking-widest">Objective Directive</span>
                            </div>
                            <div className="flex gap-4">
                                <Input
                                    className="bg-black/50 border-white/10 text-lg h-14 font-light"
                                    placeholder='e.g. "Research 5 competitors for AGI-S and summarize pricing"'
                                    value={goal}
                                    onChange={(e: any) => setGoal(e.target.value)}
                                    disabled={isExecuting}
                                />
                                <Button
                                    className={`h-14 px-8 text-lg font-bold uppercase tracking-wider ${isExecuting ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-cyan-600 hover:bg-cyan-500 text-white'}`}
                                    onClick={isExecuting ? () => setIsExecuting(false) : handleGodModeStart}
                                >
                                    {isExecuting ? <StopCircle className="mr-2" /> : <Play className="mr-2" />}
                                    {isExecuting ? 'ABORT' : 'EXECUTE'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* MANUAL CONTROL GRID (PHASE 3 FEATURES) */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 rounded-xl bg-[#090909] border border-white/5 hover:border-white/10 transition-colors">
                            <h3 className="text-sm font-bold text-white/70 mb-4 flex items-center gap-2"><Eye className="h-4 w-4 text-purple-400" /> Neural HUD (Phase 4)</h3>
                            <p className="text-xs text-white/40 mb-4">Injects analysis overlay into all active tabs.</p>
                            <Button variant="outline" className={`w-full ${hudActive ? 'bg-purple-500/20 text-purple-400 border-purple-500/50' : ''}`} onClick={handleHUDToggle}>
                                {hudActive ? 'DISABLE HUD' : 'ACTIVATE HUD'}
                            </Button>
                        </div>

                        <div className="p-6 rounded-xl bg-[#090909] border border-white/5 hover:border-white/10 transition-colors">
                            <h3 className="text-sm font-bold text-white/70 mb-4 flex items-center gap-2"><Share2 className="h-4 w-4 text-amber-400" /> Hive Mind (Phase 5)</h3>
                            <p className="text-xs text-white/40 mb-4">Synchronize context across isolated browser tabs.</p>
                            <Button variant="outline" className="w-full" onClick={handleHiveMind}>
                                FUSE CONTEXT
                            </Button>
                        </div>
                    </div>

                    {/* MANUAL ACTION TESTING */}
                    <div className="p-6 rounded-xl bg-[#090909] border border-white/5">
                        <h3 className="text-sm font-bold text-white/70 mb-4 flex items-center gap-2"><MousePointer className="h-4 w-4 text-emerald-400" /> Ghost Hand (manual)</h3>
                        <div className="flex gap-2">
                            <Input id="sel-input" placeholder="Selector (e.g. h1)" className="bg-black/50" />
                            <Button variant="secondary" onClick={() => dispatchUAL('CLICK', (document.getElementById('sel-input') as HTMLInputElement).value)}>CLICK</Button>
                            <Button variant="secondary" onClick={() => dispatchUAL('READ')}>READ PAGE</Button>
                        </div>
                    </div>

                </div>

                {/* RIGHT: TERMINAL LOGS */}
                <div className="lg:col-span-4 bg-black border-l border-white/5 flex flex-col font-mono text-xs">
                    <div className="h-12 border-b border-white/5 flex items-center px-6 gap-2 bg-[#050505]">
                        <Terminal className="h-4 w-4 text-white/30" />
                        <span className="text-white/40 font-bold uppercase tracking-widest">System Telemetry</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-3">
                        {logs.length === 0 && <div className="text-white/20 italic">System Idle. Awaiting Directive.</div>}
                        {logs.map((log, i) => (
                            <div key={i} className="flex gap-3 animate-in fade-in slide-in-from-right-2">
                                <span className="text-white/20 shrink-0">{log.timestamp}</span>
                                <span className={`${log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-emerald-400' : log.type === 'info' ? 'text-cyan-400' : 'text-white/60'}`}>
                                    {log.message}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
