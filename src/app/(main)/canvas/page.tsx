'use client';

/**
 * AGI-S Canvas - Tech Comet Interface (Hybrid)
 * Centered input (Comet) + High Tech visuals (Jarvis)
 * Designed to show output clearly.
 */

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowRight, Sparkles, Globe, Terminal, Cpu, Camera, AlertOctagon } from 'lucide-react';
import { UALClient } from '@/lib/universal-action-layer';
import type { UALResult, WebAction } from '@/lib/universal-action-layer';
import { cn } from '@/lib/utils'; // Assumes utils exists

export default function CanvasPage() {
    const [goal, setGoal] = useState('');
    const [isExecuting, setIsExecuting] = useState(false);
    const [result, setResult] = useState<UALResult | null>(null);
    const [logs, setLogs] = useState<string[]>([]);

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

        addLog('🚀 Initializing High-Scale Agent...');

        try {
            addLog('🧠 Thinking (Chain of Thought)...');
            const actions = await ualClient.planActions(goal, '');

            addLog(`📋 Plan Generated: ${actions.length} Steps`);

            addLog('⚡ Executing on Cloud Browser...');
            const taskResult = await ualClient.executeTask({
                goal,
                url: '',
                actions,
            });

            setResult(taskResult);
            if (taskResult.success) {
                addLog(`✅ Success! Screeshot Size: ${taskResult.screenshot?.length || 0} bytes`);
            } else {
                addLog(`⚠️ Finished with warning: ${taskResult.error}`);
            }

        } catch (error: any) {
            setResult({
                success: false,
                error: error.message,
                steps: [`Failed: ${error.message}`],
            });
            addLog(`❌ Detailed Error: ${error.message}`);
        } finally {
            setIsExecuting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#000000] text-white font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden">

            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.08)_0%,rgba(0,0,0,1)_70%)] pointer-events-none"></div>

            <div className="w-full max-w-5xl z-10 flex flex-col gap-10">

                {/* Hybrid Input Section - Centered & Powerful */}
                <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <h1 className="text-5xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
                        Universal Action Layer
                    </h1>

                    <div className="relative max-w-2xl mx-auto group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                        <div className="relative bg-[#0A0A0A] rounded-xl border border-white/10 flex items-center p-2 shadow-2xl">
                            <div className="pl-4 pr-3 text-cyan-400">
                                {isExecuting ? <Loader2 className="h-6 w-6 animate-spin" /> : <Sparkles className="h-6 w-6" />}
                            </div>
                            <Input
                                value={goal}
                                onChange={(e) => setGoal(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !isExecuting && executeTask()}
                                placeholder="Enter command (e.g., 'Add Nike shoes to cart')..."
                                className="bg-transparent border-0 text-xl h-14 text-white placeholder:text-white/30 focus-visible:ring-0 font-light"
                                disabled={isExecuting}
                                autoFocus
                            />
                            <Button
                                onClick={executeTask}
                                disabled={isExecuting || !goal.trim()}
                                className="bg-white text-black hover:bg-cyan-50 h-10 px-6 rounded-lg font-bold"
                            >
                                ACT
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Results Grid - High Tech Display */}
                {(isExecuting || result) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-12 duration-1000">

                        {/* Terminal Log */}
                        <div className="bg-[#050505] border border-white/10 rounded-xl p-4 h-[400px] flex flex-col font-mono text-xs overflow-hidden">
                            <div className="flex items-center gap-2 text-white/40 mb-3 border-b border-white/5 pb-2">
                                <Terminal className="h-4 w-4" />
                                <span className="uppercase tracking-widest">LIVE EXECUTION LOG</span>
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-2 pr-2" ref={scrollRef}>
                                {logs.map((log, i) => (
                                    <div key={i} className="flex gap-2">
                                        <span className="text-cyan-500/50">{`>`}</span>
                                        <span className={cn(
                                            "break-words",
                                            log.includes('Success') ? "text-green-400" :
                                                log.includes('Error') || log.includes('Failed') ? "text-red-400" :
                                                    "text-cyan-100/80"
                                        )}>{log}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Browser Visualizer */}
                        <div className="bg-[#050505] border border-white/10 rounded-xl p-1 h-[400px] flex flex-col relative group">
                            <div className="flex items-center justify-between px-4 py-2 bg-white/5 rounded-t-lg">
                                <div className="flex items-center gap-2 text-xs text-cyan-400">
                                    <Globe className="h-3 w-3" />
                                    <span className="uppercase tracking-wider">Visual Feed</span>
                                </div>
                                {result?.screenshot && <span className="text-[10px] text-green-400 flex items-center gap-1"><Camera className="h-3 w-3" /> CAPTURED</span>}
                            </div>

                            <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden rounded-b-lg border-t border-white/5">
                                {result?.screenshot ? (
                                    <img
                                        src={`data:image/png;base64,${result.screenshot}`}
                                        alt="Execution Result"
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <div className="text-center space-y-4">
                                        {isExecuting ? (
                                            <div className="relative">
                                                <div className="w-16 h-16 border-t-2 border-cyan-500 rounded-full animate-spin"></div>
                                                <Cpu className="absolute inset-0 m-auto h-6 w-6 text-cyan-500 animate-pulse" />
                                            </div>
                                        ) : (
                                            <div className="text-white/20">
                                                <AlertOctagon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                <p className="text-xs tracking-widest uppercase">No Signal</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Result Metadata Overlay */}
                                {result?.data && (
                                    <div className="absolute inset-x-0 bottom-0 bg-black/90 border-t border-white/10 p-3 transform transition-transform duration-300 translate-y-full group-hover:translate-y-0">
                                        <p className="text-white text-sm truncate font-medium">{result.data.title}</p>
                                        <p className="text-white/50 text-xs truncate mono">{result.data.url}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                )}

            </div>

        </div>
    );
}
