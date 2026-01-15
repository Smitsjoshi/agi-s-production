'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Cpu, Globe, Share2, MessageCircle, FileText, Database, Terminal as TerminalIcon, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function OmegaConsole() {
    const [prompt, setPrompt] = useState("");
    const [isCompiling, setIsCompiling] = useState(false);
    const [manifesto, setManifesto] = useState<any>(null);
    const [logs, setLogs] = useState<string[]>([]);

    // The User's Specific Vision for autofill/demo
    const SUPER_PROMPT = "Market research AGI, investor pitch deck, website with working SLM, host it, social presence, WhatsApp updates, and email top VCs.";

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!prompt.trim()) return;

        setIsCompiling(true);
        setLogs(["Initializing Omega Kernel...", "Parsing Semantic Intent...", "Compiling Dependency Graph..."]);

        // Simulate compilation delay for effect (Real API call goes here)
        try {
            // In real implementation: await fetch('/api/omega/compile', { body: JSON.stringify({ prompt }) })
            setTimeout(() => {
                setLogs(prev => [...prev, ">> DETECTED: 8 Parallel Vectors"]);
                setLogs(prev => [...prev, ">> ALLOCATING: 5 Autonomous Agents"]);
                setTimeout(() => {
                    setManifesto({
                        mission_id: "OMEGA-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
                        target: "Full Stack AGI Brand Launch",
                        departments: [
                            { id: "INTEL_01", type: "RESEARCH", status: "PENDING", details: "Market Research (AGI Sector)" },
                            { id: "STUDIO_01", type: "DESIGN", status: "PENDING", details: "Investor Pitch Deck (PDF)" },
                            { id: "DEV_CORE", type: "ENGINEERING", status: "PENDING", details: "Next.js Website + Vercel Hosting" },
                            { id: "AI_SLM", type: "ML_OPS", status: "PENDING", details: "Deploy Working SLM (Llama-3-8b)" },
                            { id: "SOCIAL_X", type: "MARKETING", status: "PENDING", details: "Twitter/LinkedIn Presence" },
                            { id: "NOTIFY_WA", type: "COMMS", status: "PENDING", details: "WhatsApp Integration (Twilio)" },
                            { id: "SALES_VC", type: "OUTREACH", status: "PENDING", details: "Email Top VCs" }
                        ]
                    });
                    setIsCompiling(false);
                }, 2000);
            }, 1500);

        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-mono selection:bg-purple-500/30 overflow-hidden relative">

            {/* Background Matrix Effect */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
            </div>

            <div className="relative z-10 container mx-auto px-4 py-20 h-screen flex flex-col">

                {/* Header */}
                <header className="mb-12 text-center animate-in fade-in slide-in-from-top duration-1000">
                    <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-purple-500/30 bg-purple-900/10 mb-6">
                        <span className="animate-pulse w-2 h-2 rounded-full bg-purple-500"></span>
                        <span className="text-xs tracking-[0.3em] text-purple-400">OMEGA ENGINE V1.0</span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
                        GENESIS
                    </h1>
                    <p className="text-gray-500 tracking-widest uppercase text-sm">Universal Autonomous Output Engine</p>
                </header>

                {/* Input Console */}
                <div className="max-w-4xl mx-auto w-full mb-12 relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative">
                        <form onSubmit={handleSubmit} className="flex gap-0 bg-black rounded-lg overflow-hidden border border-white/10 p-2">
                            <span className="flex items-center justify-center pl-4 pr-2 text-purple-500 font-bold text-xl">{'>'}</span>
                            <Input
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Define your reality..."
                                className="flex-1 bg-transparent border-none text-xl md:text-2xl h-16 focus-visible:ring-0 placeholder:text-gray-800 font-medium text-white"
                                autoFocus
                            />
                            <Button
                                type="submit"
                                size="icon"
                                className="h-16 w-16 bg-white text-black hover:bg-purple-400 transition-colors rounded-md"
                                disabled={isCompiling}
                            >
                                {isCompiling ? <Cpu className="animate-spin" /> : <Send />}
                            </Button>
                        </form>
                    </div>
                    {/* Quick Fill for Demo */}
                    <div className="mt-2 text-xs text-gray-600 cursor-pointer hover:text-purple-400 transition-colors text-right" onClick={() => setPrompt(SUPER_PROMPT)}>
                        [ Insert Super Prompt ]
                    </div>
                </div>

                {/* Visualization Area */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 min-h-0">

                    {/* Left: Terminal Output */}
                    <div className="bg-zinc-950/80 border border-white/5 rounded-2xl p-6 font-mono text-sm overflow-y-auto relative">
                        <div className="absolute top-4 right-4 text-xs text-gray-600 flex items-center gap-2">
                            <TerminalIcon size={12} /> SYSTEM LOG
                        </div>
                        <div className="space-y-2 mt-6">
                            {logs.map((log, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-green-500/80"
                                >
                                    <span className="text-gray-700 mr-2">[{new Date().toLocaleTimeString()}]</span>
                                    {log}
                                </motion.div>
                            ))}
                            {logs.length === 0 && <span className="text-gray-800 animate-pulse">Waiting for input...</span>}
                        </div>
                    </div>

                    {/* Right: The Swarm (Visualized) */}
                    <div className="relative bg-zinc-950/80 border border-white/5 rounded-2xl p-6 flex items-center justify-center overflow-hidden">
                        {!manifesto ? (
                            <div className="text-center opacity-20">
                                <Cpu size={64} className="mx-auto mb-4" />
                                <div className="text-xs uppercase tracking-widest">Awaiting Neural Link</div>
                            </div>
                        ) : (
                            <div className="w-full h-full overflow-y-auto pr-2">
                                <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">MISSION: {manifesto.mission_id}</h3>
                                        <p className="text-xs text-gray-400">DECOMPOSITION COMPLETE</p>
                                    </div>
                                    <Button variant="outline" size="sm" className="border-purple-500/50 text-purple-400 bg-purple-500/10 hover:bg-purple-500 hover:text-white">
                                        EXECUTE ALL
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    {manifesto.departments.map((dep: any, i: number) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-purple-500/50 transition-colors group"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${getIconColor(dep.type)}`}>
                                                        {getIcon(dep.type)}
                                                    </div>
                                                    <span className="font-bold text-sm">{dep.type}</span>
                                                </div>
                                                <span className="text-[10px] uppercase font-bold text-gray-500">{dep.status}</span>
                                            </div>
                                            <p className="text-xs text-gray-300 pl-11">{dep.details}</p>
                                        </motion.div>
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

// Helpers
function getIcon(type: string) {
    switch (type) {
        case 'RESEARCH': return <Globe size={16} />;
        case 'DESIGN': return <FileText size={16} />;
        case 'ENGINEERING': return <Cpu size={16} />;
        case 'ML_OPS': return <Database size={16} />;
        case 'MARKETING': return <Share2 size={16} />;
        case 'COMMS': return <MessageCircle size={16} />;
        case 'OUTREACH': return <Shield size={16} />; // Sending emails
        default: return <Cpu size={16} />;
    }
}

function getIconColor(type: string) {
    switch (type) {
        case 'RESEARCH': return "bg-blue-500/20 text-blue-400";
        case 'DESIGN': return "bg-pink-500/20 text-pink-400";
        case 'ENGINEERING': return "bg-green-500/20 text-green-400";
        case 'ML_OPS': return "bg-purple-500/20 text-purple-400";
        case 'MARKETING': return "bg-orange-500/20 text-orange-400";
        case 'COMMS': return "bg-emerald-500/20 text-emerald-400";
        case 'OUTREACH': return "bg-red-500/20 text-red-400";
        default: return "bg-gray-500/20";
    }
}
