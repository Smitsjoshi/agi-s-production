'use client';

/**
 * AGI-S Canvas - J.A.R.V.I.S. Interface
 * "Iron Man" style HUD for maximum "tech" feel.
 */

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Globe, Zap, Cpu, Activity, Shield, Wifi, Database, Layers, PlayCircle } from 'lucide-react';
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
    const [rotation, setRotation] = useState(0);

    const scrollRef = useRef<HTMLDivElement>(null);
    const ualClient = new UALClient();

    // Animation Loop for HUD
    useEffect(() => {
        const interval = setInterval(() => {
            setRotation(r => (r + 1) % 360);
        }, 50);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    const addLog = (message: string) => {
        const ts = new Date().toISOString().split('T')[1].slice(0, 12);
        setLogs(prev => [...prev, `[${ts}] ${message}`]);
    };

    const executeTask = async () => {
        if (!goal.trim()) return;

        setIsExecuting(true);
        setResult(null);
        setLogs([]);
        setPlannedActions([]);
        setErrorDetails(null);

        addLog('PROTOCOL: INITIATED');

        try {
            addLog('ANALYSIS: PARSING OBJECTIVE...');
            await new Promise(resolve => setTimeout(resolve, 600)); // Cinematic delay

            const actions = await ualClient.planActions(goal, '');

            setPlannedActions(actions);
            addLog(`STRATEGY: ${actions.length} VECTORS CALCULATED`);

            addLog('UPLINK: ESTABLISHING SECURE CONNECTION...');
            const taskResult = await ualClient.executeTask({
                goal,
                url: '',
                actions,
            });

            setResult(taskResult);
            if (taskResult.success) {
                addLog('STATUS: MISSION ACCOMPLISHED');
            } else {
                addLog('WARNING: MISSION COMPROMISED');
                if (taskResult.error) setErrorDetails(taskResult.error);
            }

        } catch (error: any) {
            const errorMsg = error.message || 'Unknown Error';
            setResult({
                success: false,
                error: errorMsg,
                steps: [`FATAL: ${errorMsg}`],
            });
            addLog(`CRITICAL FAILURE: ${errorMsg}`);
            setErrorDetails(errorMsg);
        } finally {
            setIsExecuting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020408] text-cyan-400 font-mono overflow-hidden relative selection:bg-cyan-500/30 selection:text-white">

            {/* HUD Overlay Effects */}
            <div className="absolute inset-0 pointer-events-none z-0">
                {/* Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
                {/* Vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_90%)]"></div>
                {/* Rotating Rings (Center) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-cyan-500/10 rounded-full opacity-20" style={{ transform: `translate(-50%, -50%) rotate(${rotation}deg)` }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-dashed border-cyan-500/10 rounded-full opacity-20" style={{ transform: `translate(-50%, -50%) rotate(-${rotation * 1.5}deg)` }}></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 flex flex-col h-screen">

                {/* Top HUD Bar */}
                <div className="flex justify-between items-start border-t-2 border-cyan-500/50 pt-2 mb-8">
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-bold tracking-widest text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">AGI-S // PROTOCOL</h1>
                        <div className="flex gap-4 text-[10px] text-cyan-600 uppercase mt-1">
                            <span>Sys.Ver: 4.2.0-ULTRA</span>
                            <span>Build: {new Date().toISOString().slice(0, 10)}</span>
                            <span>Target: NEURAL_NET</span>
                        </div>
                    </div>

                    <div className="flex gap-8">
                        <div className="text-right">
                            <div className="text-[10px] text-cyan-700 uppercase">CPU Load</div>
                            <div className="text-xl font-bold text-cyan-400">12%</div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] text-cyan-700 uppercase">Memory</div>
                            <div className="text-xl font-bold text-cyan-400">64PT</div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] text-cyan-700 uppercase">Status</div>
                            <div className="text-xl font-bold text-cyan-400 animate-pulse">ONLINE</div>
                        </div>
                    </div>
                </div>

                {/* Main Workspace */}
                <div className="flex-1 grid grid-cols-12 gap-8">

                    {/* Left Column: Command & Logs */}
                    <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">

                        {/* Command Module */}
                        <div className="relative bg-[#050a10]/80 border border-cyan-500/30 p-1 clip-path-polygon">
                            {/* Decorative Corners */}
                            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400"></div>
                            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400"></div>
                            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400"></div>
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400"></div>

                            <div className="bg-cyan-950/20 p-4 relative backdrop-blur-md">
                                <div className="flex items-center gap-2 mb-4 text-cyan-300 text-sm font-bold tracking-widest uppercase">
                                    <Zap className="h-4 w-4" /> Direct Interface
                                </div>
                                <div className="relative group">
                                    <Input
                                        value={goal}
                                        onChange={(e) => setGoal(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && !isExecuting && executeTask()}
                                        placeholder="INITIATE COMMAND..."
                                        className="bg-black/50 border border-cyan-500/20 text-cyan-100 h-16 text-lg font-bold placeholder:text-cyan-800/50 focus-visible:ring-1 focus-visible:ring-cyan-500/50 focus-visible:border-cyan-500 pl-4 pr-12"
                                        disabled={isExecuting}
                                        autoFocus
                                    />
                                    <Button
                                        onClick={executeTask}
                                        disabled={isExecuting || !goal.trim()}
                                        className="absolute right-2 top-2 h-12 w-12 bg-cyan-500/10 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 rounded-sm"
                                    >
                                        {isExecuting ? <Loader2 className="h-6 w-6 animate-spin" /> : <PlayCircle className="h-6 w-6" />}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Error Report Panel */}
                        {errorDetails && (
                            <div className="bg-red-950/30 border border-red-500/50 p-4 relative animate-in slide-in-from-left">
                                <div className="flex items-start gap-4">
                                    <Shield className="h-8 w-8 text-red-500 animate-pulse" />
                                    <div>
                                        <h3 className="text-red-500 font-bold tracking-wider">SYSTEM ALERT</h3>
                                        <p className="text-red-400/80 text-xs mt-1 font-mono">{errorDetails}</p>
                                        {errorDetails.includes('500') && (
                                            <div className="mt-2 text-[10px] text-red-300/50 border-t border-red-500/20 pt-1">
                                                DIAGNOSTIC: Verify Environment Variables [GROQ_API_KEY]
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Telemetry Log */}
                        <div className="flex-1 bg-black/40 border border-cyan-900/50 flex flex-col overflow-hidden relative">
                            <div className="bg-cyan-950/30 p-2 border-b border-cyan-900/50 flex justify-between items-center">
                                <span className="text-[10px] uppercase tracking-widest text-cyan-600">Event Stream</span>
                                <Wifi className="h-3 w-3 text-cyan-600" />
                            </div>
                            <div className="flex-1 p-4 font-mono text-[11px] space-y-2 overflow-y-auto" ref={scrollRef}>
                                {logs.length === 0 && <div className="text-cyan-900/50 text-center mt-10">AWAITING INPUT STREAM...</div>}
                                {logs.map((log, i) => (
                                    <div key={i} className="flex gap-2 animate-in fade-in duration-300">
                                        <span className="text-cyan-800">{`>`}</span>
                                        <span className={cn(
                                            "break-words",
                                            log.includes('FATAL') ? "text-red-500 font-bold" :
                                                log.includes('MISSION ACCOMPLISHED') ? "text-green-400 font-bold shadow-[0_0_10px_rgba(74,222,128,0.5)]" :
                                                    log.includes('STRATEGY') ? "text-yellow-400" :
                                                        "text-cyan-300/90"
                                        )}>{log}</span>
                                    </div>
                                ))}
                                {isExecuting && <div className="animate-pulse text-cyan-500/50">PROCESSING DATA_PACKETS...</div>}
                            </div>
                            {/* Decorative Scan Line */}
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-[20%] w-full animate-scan pointer-events-none"></div>
                        </div>

                    </div>

                    {/* Right Column: Visualizer */}
                    <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">

                        {/* Main Viewport */}
                        <div className="flex-1 border border-cyan-500/20 bg-[#030508] relative group overflow-hidden flex flex-col">
                            {/* HUD Corners */}
                            <div className="absolute top-2 left-2 w-8 h-8 border-t border-l border-cyan-500/30"></div>
                            <div className="absolute top-2 right-2 w-8 h-8 border-t border-r border-cyan-500/30"></div>
                            <div className="absolute bottom-2 left-2 w-8 h-8 border-b border-l border-cyan-500/30"></div>
                            <div className="absolute bottom-2 right-2 w-8 h-8 border-b border-r border-cyan-500/30"></div>

                            <div className="absolute top-4 left-0 right-0 flex justify-center z-20 pointer-events-none">
                                <div className="bg-cyan-950/80 backdrop-blur px-3 py-1 border border-cyan-500/30 text-[10px] tracking-[0.3em] text-cyan-300">
                                    OPTICAL SENSOR FEED
                                </div>
                            </div>

                            <div className="flex-1 flex items-center justify-center relative">
                                {result?.screenshot ? (
                                    <>
                                        <img src={`data:image/png;base64,${result.screenshot}`} alt="Feed" className="w-full h-full object-contain opacity-90 group-hover:opacity-100 transition-opacity" />
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/90 border-t border-cyan-500/30 p-3 font-mono">
                                            <div className="text-cyan-400 text-sm truncate">{result.data?.title}</div>
                                            <div className="text-cyan-700 text-xs truncate">{result.data?.url}</div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center relative">
                                        {isExecuting ? (
                                            <div className="relative w-32 h-32 mx-auto">
                                                <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full animate-ping"></div>
                                                <div className="absolute inset-2 border-4 border-t-cyan-500 rounded-full animate-spin"></div>
                                                <Globe className="absolute inset-0 m-auto h-12 w-12 text-cyan-500 animate-pulse" />
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                <Activity className="h-24 w-24 text-cyan-900/40" />
                                                <div className="text-cyan-900/60 mt-4 tracking-widest text-xs">NO SIGNAL</div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Queue Hologram */}
                        {plannedActions.length > 0 && (
                            <div className="h-48 border border-cyan-500/10 bg-black/40 p-4 overflow-hidden relative">
                                <div className="text-[10px] text-cyan-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Layers className="h-3 w-3" /> Execution Stack
                                </div>
                                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent">
                                    {plannedActions.map((action, i) => (
                                        <div key={i} className="min-w-[140px] bg-cyan-950/10 border border-cyan-500/20 p-3 flex flex-col gap-2 shrink-0 hover:border-cyan-400/50 hover:bg-cyan-500/5 transition-all group">
                                            <div className="flex justify-between items-center text-[10px] text-cyan-700 group-hover:text-cyan-400">
                                                <span>SEQ_{String(i).padStart(3, '0')}</span>
                                                <Cpu className="h-3 w-3" />
                                            </div>
                                            <div className="text-cyan-200 font-bold uppercase text-xs">{action.type}</div>
                                            <div className="text-[10px] text-cyan-600 truncate font-mono">{action.selector || action.url || '---'}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>

                </div>
            </div>
        </div>
    );
}
