'use client';

/**
 * AGI-S Canvas - Cyber Interface
 * "Techy" design for power users.
 */

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Terminal, Cpu, Shield, Wifi, Zap, Hexagon, Command } from 'lucide-react';
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
        const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
        setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    };

    const executeTask = async () => {
        if (!goal.trim()) return;

        setIsExecuting(true);
        setResult(null);
        setLogs([]);
        setPlannedActions([]);

        addLog('SYSTEM_INIT: Universal Action Layer v2.4');

        try {
            addLog('PROCESS: Initializing Liquid Intelligence Protocol...');
            const actions = await ualClient.planActions(goal, '');

            setPlannedActions(actions);
            addLog(`PLAN_GENERATED: ${actions.length} operational steps.`);

            await new Promise(resolve => setTimeout(resolve, 600));

            addLog('EXECUTION: Engaging Browser Automation Engine...');
            const taskResult = await ualClient.executeTask({
                goal,
                url: '',
                actions,
            });

            setResult(taskResult);
            if (taskResult.success) {
                addLog('STATUS: MISSION_COMPLETE');
            } else {
                addLog(`STATUS: CRITICAL_FAILURE - ${taskResult.error}`);
            }

        } catch (error: any) {
            setResult({
                success: false,
                error: error.message,
                steps: [`FATAL: ${error.message}`],
            });
            addLog(`SYSTEM_ERROR: ${error.message}`);
        } finally {
            setIsExecuting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-[#00ff9d] font-mono flex flex-col relative overflow-hidden selection:bg-[#00ff9d] selection:text-black">

            {/* Cyber Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,157,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,157,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

            {/* Header Status Bar */}
            <div className="w-full border-b border-[#00ff9d]/20 bg-black/80 backdrop-blur-sm p-2 flex justify-between items-center z-10 sticky top-0">
                <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-[#00ff9d] rounded-full animate-pulse"></div>
                        <span className="opacity-80">ONLINE</span>
                    </div>
                    <span className="opacity-40">|</span>
                    <span className="opacity-60">MEM: 32TB</span>
                    <span className="opacity-40">|</span>
                    <span className="opacity-60">CPU: QUANTUM-8</span>
                </div>
                <div className="text-xs font-bold tracking-[0.2em] opacity-50">AGI-S // CANVAS</div>
            </div>

            <div className="flex-1 flex flex-col p-6 max-w-7xl mx-auto w-full z-10">

                {/* Main Interface Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">

                    {/* Left Column: Command & Logs */}
                    <div className="lg:col-span-5 flex flex-col gap-6">

                        {/* Command Module */}
                        <div className="bg-black/50 border border-[#00ff9d]/30 p-1 relative group">
                            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#00ff9d]"></div>
                            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#00ff9d]"></div>
                            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#00ff9d]"></div>
                            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#00ff9d]"></div>

                            <div className="p-4 space-y-4">
                                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#00ff9d]/60 mb-2">
                                    <Command className="h-4 w-4" />
                                    Command Input
                                </div>
                                <div className="relative">
                                    <Input
                                        value={goal}
                                        onChange={(e) => setGoal(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && !isExecuting && executeTask()}
                                        placeholder="ENTER_OBJECTIVE..."
                                        className="bg-[#0a0a0a] border border-[#00ff9d]/20 text-[#00ff9d] placeholder:text-[#00ff9d]/20 h-14 font-mono text-sm focus-visible:ring-1 focus-visible:ring-[#00ff9d]/50"
                                        disabled={isExecuting}
                                        autoFocus
                                    />
                                    <Button
                                        onClick={executeTask}
                                        disabled={isExecuting || !goal.trim()}
                                        className="absolute right-1 top-1 h-12 w-12 bg-[#00ff9d]/10 hover:bg-[#00ff9d]/20 text-[#00ff9d] border border-[#00ff9d]/20 rounded-none"
                                    >
                                        {isExecuting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" />}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Terminal Output */}
                        <div className="flex-1 bg-black/80 border border-[#00ff9d]/20 p-4 font-mono text-xs overflow-hidden flex flex-col min-h-[400px]">
                            <div className="flex items-center justify-between border-b border-[#00ff9d]/10 pb-2 mb-2">
                                <span className="text-[#00ff9d]/50 uppercase tracking-widest">System Log</span>
                                <Wifi className="h-3 w-3 text-[#00ff9d]/30" />
                            </div>
                            <div className="flex-1 overflow-y-auto scrollbar-none space-y-1" ref={scrollRef}>
                                {logs.length === 0 && (
                                    <div className="text-[#00ff9d]/20 italic">
                                        {`> SYSTEM READY`} <br />
                                        {`> WAITING FOR INPUT...`}
                                    </div>
                                )}
                                {logs.map((log, i) => (
                                    <div key={i} className="break-words">
                                        <span className="text-[#00ff9d]/40 mr-2">{`>`}</span>
                                        <span className={cn(
                                            log.includes('FAILURE') || log.includes('FATAL') ? "text-red-500" :
                                                log.includes('COMPLETE') ? "text-[#00ff9d] font-bold" :
                                                    "text-[#00ff9d]/80"
                                        )}>{log}</span>
                                    </div>
                                ))}
                                {isExecuting && (
                                    <div className="animate-pulse text-[#00ff9d]/60">{`> PROCESSING..._`}</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Visualization */}
                    <div className="lg:col-span-7 flex flex-col gap-6">

                        {/* Browser Viewport */}
                        <div className="flex-1 bg-[#0a0a0a] border border-[#00ff9d]/30 relative flex flex-col relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-2 z-20 flex gap-2">
                                <div className="px-2 py-0.5 border border-[#00ff9d]/30 bg-black/50 text-[10px] text-[#00ff9d]">LIVE_FEED</div>
                                {result?.success && <div className="px-2 py-0.5 border border-[#00ff9d]/30 bg-[#00ff9d]/10 text-[10px] text-[#00ff9d]">SUCCESS</div>}
                            </div>

                            {/* Grid Lines Overlay */}
                            <div className="absolute inset-0 pointer-events-none z-10 bg-[linear-gradient(rgba(0,255,157,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,157,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

                            <div className="flex-1 flex items-center justify-center min-h-[400px]">
                                {result?.screenshot ? (
                                    <div className="relative w-full h-full">
                                        <img src={`data:image/png;base64,${result.screenshot}`} alt="Viewport" className="w-full h-full object-contain opacity-80" />
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/80 border-t border-[#00ff9d]/30 p-2 text-xs font-mono">
                                            <div className="truncate text-[#00ff9d]">{result.data?.title || 'Unknown Page'}</div>
                                            <div className="truncate text-[#00ff9d]/50 text-[10px]">{result.data?.url}</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        {isExecuting ? (
                                            <div className="relative">
                                                <div className="w-20 h-20 border-2 border-[#00ff9d]/30 border-t-[#00ff9d] rounded-full animate-spin"></div>
                                                <div className="absolute inset-0 flex items-center justify-center text-[#00ff9d] animate-pulse">
                                                    <Wifi className="h-8 w-8" />
                                                </div>
                                            </div>
                                        ) : (
                                            <Hexagon className="h-24 w-24 text-[#00ff9d]/10 animate-pulse" />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Register */}
                        <div className="h-40 bg-black/50 border border-[#00ff9d]/20 p-4 font-mono overflow-y-auto">
                            <div className="text-[10px] uppercase tracking-widest text-[#00ff9d]/40 mb-2 border-b border-[#00ff9d]/10 pb-1">
                                Operation Register
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {plannedActions.length === 0 && <span className="text-[#00ff9d]/20 text-xs">NO_OPERATIONS_QUEUED</span>}
                                {plannedActions.map((action, i) => (
                                    <div key={i} className="px-2 py-1 bg-[#00ff9d]/5 border border-[#00ff9d]/20 text-[10px] text-[#00ff9d]/80">
                                        <span className="text-[#00ff9d] font-bold mr-2">[{String(i).padStart(2, '0')}]</span>
                                        {action.type.toUpperCase()}
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}
