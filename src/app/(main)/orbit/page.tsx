'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGhostProtocol } from '@/hooks/use-ghost-protocol';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Globe, Command, Sparkles, Zap, ArrowRight, Activity } from 'lucide-react';

export default function OrbitPage() {
    const { isConnected } = useGhostProtocol();
    const [goal, setGoal] = useState('');
    const [isExecuting, setIsExecuting] = useState(false);
    const [status, setStatus] = useState('');

    const EXTENSION_ID = "baialnnocbgeedpbmhdfljmfofcopeic";

    // Autonomous UAL Dispatcher
    const dispatchUAL = (action: string, selector?: string, value?: string) => {
        if (window.chrome && window.chrome.runtime) {
            window.chrome.runtime.sendMessage(EXTENSION_ID, {
                type: 'EXECUTE',
                action,
                selector,
                value
            }, (response) => {
                if (response?.data) {
                    console.log("UAL Data:", response.data);
                }
            });
        }
    };

    const handleExecute = async () => {
        if (!goal.trim()) return;
        setIsExecuting(true);
        setStatus('Initializing Sovereign Agent...');

        try {
            // 1. Send Goal to Planner API
            const response = await fetch('/api/ual/plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ goal })
            });

            if (!response.ok) throw new Error('Planning Failed');

            setStatus('Analysing Strategy...');
            const plan = await response.json();

            // 2. Execute Plan
            setStatus(`Executing ${plan.actions.length} Actions...`);

            for (const action of plan.actions) {
                setStatus(`Action: ${action.type} ${action.selector || ''}`);
                dispatchUAL(action.type.toUpperCase(), action.selector, action.value);
                await new Promise(r => setTimeout(r, 1000)); // Pacing
            }

            setStatus('Mission Complete');
            toast({ title: "Objective Complete", description: "All autonomous actions executed successfully." });
            setGoal('');

        } catch (error: any) {
            setStatus('Execution Interrupted');
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsExecuting(false);
            setTimeout(() => setStatus(''), 3000);
        }
    };

    return (
        <div className="h-[calc(100vh-4rem)] bg-[#030303] text-white font-sans flex flex-col items-center justify-center relative overflow-hidden selection:bg-cyan-500/30">

            {/* AMBIENT BACKGROUND */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[5000ms]"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]"></div>
            </div>

            <div className="w-full max-w-3xl px-6 relative z-10 flex flex-col gap-8">

                {/* HEADLINE */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10 mb-2 shadow-2xl">
                        <Globe className="h-8 w-8 text-cyan-400" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                        Orbit
                    </h1>
                    <p className="text-lg text-white/40 font-light max-w-lg mx-auto">
                        One prompt to control the entire web.
                    </p>
                </div>

                {/* MAIN INPUT */}
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
                    <div className="relative bg-[#0A0A0A] border border-white/10 rounded-xl p-2 flex items-center shadow-2xl">
                        <Command className="h-5 w-5 text-white/30 ml-4 mr-2" />
                        <Input
                            className="bg-transparent border-0 text-xl h-16 font-light placeholder:text-white/20 focus-visible:ring-0"
                            placeholder="What should I do on the web?"
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !isExecuting && handleExecute()}
                            disabled={isExecuting}
                            autoFocus
                        />
                        <Button
                            className={`h-14 px-6 rounded-lg text-sm font-bold uppercase tracking-wider transition-all
                                ${isExecuting ? 'bg-white/5 text-white/50 cursor-not-allowed' : 'bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.3)]'}
                            `}
                            onClick={handleExecute}
                            disabled={isExecuting || !goal.trim()}
                        >
                            {isExecuting ? <Activity className="animate-spin h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>

                {/* STATUS INDICATOR (Minimal) */}
                <div className="h-8 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        {status ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex items-center gap-2 text-sm font-mono text-cyan-400"
                            >
                                <Sparkles className="h-3 w-3" />
                                {status}
                            </motion.div>
                        ) : (
                            !isConnected && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center gap-2 text-xs font-mono text-red-500/50"
                                >
                                    <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
                                    DAEMON LINK REQUIRED
                                </motion.div>
                            )
                        )}
                    </AnimatePresence>
                </div>

            </div>
        </div>
    );
}
