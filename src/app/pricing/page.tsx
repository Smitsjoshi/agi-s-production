'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Zap, Cpu, Crown, Globe, Shield, Activity, HardDrive, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PrismBackground from '@/components/ui/prism-background';
import Link from 'next/link';

export default function PricingPage() {
    const [tier, setTier] = useState(1); // 0: Spark, 1: Nexus, 2: Omni
    // Custom Slider State
    const [researchLoad, setResearchLoad] = useState(2000);
    const [videoMins, setVideoMins] = useState(45);
    const [storageGB, setStorageGB] = useState(50);

    const calculateCustomPrice = () => {
        // Basic algo for demo
        const base = 0;
        const researchCost = (researchLoad / 1000) * 5;
        const videoCost = (videoMins / 60) * 10;
        const storageCost = (storageGB / 10) * 2;
        return (base + researchCost + videoCost + storageCost).toFixed(0);
    };

    const tiers = [
        {
            name: "Spark",
            identity: "Student",
            priceUSD: "$0",
            priceINR: "₹0",
            description: "For those just waking up to the new reality.",
            color: "blue",
            features: [
                "Standard Neural Access",
                "Basic Generative Capabilities",
                "Local Memory (Non-Persistent)",
                "Community Support"
            ]
        },
        {
            name: "Nexus",
            identity: "Creator",
            priceUSD: "$19",
            priceINR: "₹1,599",
            description: "For architects of the digital age.",
            color: "cyan",
            features: [
                "High-Velocity Rendering Engine",
                "Unlimited Generative Access",
                "Persistent Knowledge Graph",
                "Priority Cortex Allocation",
                "Commercial Rights"
            ]
        },
        {
            name: "Omni",
            identity: "Sovereign",
            priceUSD: "$99",
            priceINR: "₹7,999",
            description: "Total dominion over the machine.",
            color: "emerald",
            features: [
                "God Mode (Autonomous Agents)",
                "Military-Grade Stealth Protocol",
                "Dedicated Neural Cluster",
                "API Access (Direct)",
                "24/7 Priority Signal"
            ]
        }
    ];

    const currentTier = tiers[tier];

    return (
        <div className="relative min-h-screen bg-black text-white font-sans selection:bg-cyan-500/30 overflow-hidden flex flex-col items-center pt-24 pb-24">
            <PrismBackground />

            {/* Navigation */}
            <nav className="fixed top-0 z-50 w-full p-6 flex justify-between items-center bg-black/50 backdrop-blur-md border-b border-white/5">
                <Link href="/" className="font-bold text-xl tracking-tight">AGI-S</Link>
                <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">Return to Console</Link>
            </nav>

            {/* Header */}
            <div className="relative z-10 text-center mb-16 px-4">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">
                    Resource <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Allocation</span>
                </h1>
                <p className="text-gray-400 max-w-xl mx-auto text-lg">
                    Select your identity. The system adapts to your needs.
                </p>
            </div>

            {/* Identity Slider */}
            <div className="relative z-10 w-full max-w-3xl px-6 mb-16">
                <div className="relative h-16 bg-white/5 rounded-full p-1 flex items-center justify-between border border-white/10 backdrop-blur-md">
                    {/* Slider Background Track */}
                    <motion.div
                        className="absolute h-14 bg-white/10 rounded-full"
                        initial={false}
                        animate={{
                            left: `${(tier * 33.33) + 0.5}%`,
                            width: '32%'
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />

                    {/* Identity Buttons */}
                    {tiers.map((t, index) => (
                        <button
                            key={t.name}
                            onClick={() => setTier(index)}
                            className={`relative z-10 w-1/3 h-full rounded-full text-sm md:text-lg font-bold transition-colors duration-300 ${tier === index ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            {t.identity}
                        </button>
                    ))}
                </div>
            </div>

            {/* Card Container */}
            <div className="relative z-10 w-full max-w-md px-6 perspective-1000 mb-24">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={tier}
                        initial={{ opacity: 0, rotateY: -10, scale: 0.95 }}
                        animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                        exit={{ opacity: 0, rotateY: 10, scale: 0.95 }}
                        transition={{ duration: 0.4 }}
                        className={`relative rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-8 overflow-hidden shadow-2xl shadow-${currentTier.color}-500/20`}
                    >
                        {/* Dynamic Glow */}
                        <div className={`absolute top-0 right-0 p-32 bg-${currentTier.color}-500/10 blur-[80px] rounded-full pointer-events-none`}></div>

                        {/* Price & Name */}
                        <div className="mb-8">
                            <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-${currentTier.color}-500/20 text-${currentTier.color}-400 mb-4`}>
                                Project {currentTier.name}
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-bold">{currentTier.priceUSD}</span>
                                <span className="text-xl text-gray-500">/mo</span>
                            </div>
                            <div className="text-sm text-gray-400 mt-1">({currentTier.priceINR} / mo)</div>
                            <p className="mt-4 text-gray-300 leading-relaxed">
                                {currentTier.description}
                            </p>
                        </div>

                        {/* Features List - No Limits Shown */}
                        <div className="space-y-4 mb-8">
                            {currentTier.features.map((feature, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className={`p-1 rounded-full bg-${currentTier.color}-500/20`}>
                                        <Check className={`h-4 w-4 text-${currentTier.color}-400`} />
                                    </div>
                                    <span className="text-gray-200 text-sm">{feature}</span>
                                </div>
                            ))}
                        </div>

                        {/* Action Button */}
                        <Button
                            className={`w-full h-12 text-lg font-bold bg-${currentTier.color}-600 hover:bg-${currentTier.color}-500 transition-all shadow-lg shadow-${currentTier.color}-900/20`}
                            onClick={() => {
                                // Placeholder for Payment Link Logic
                                const paymentLinks = [
                                    "", // Free
                                    "https://buy.stripe.com/test_nexus", // Nexus (Sample)
                                    "https://buy.stripe.com/test_omni"   // Omni (Sample)
                                ];
                                if (tier > 0) {
                                    window.open(paymentLinks[tier], '_blank');
                                } else {
                                    window.location.href = '/login';
                                }
                            }}
                        >
                            {tier === 0 ? "Initialize System" : "Allocate Resources"}
                        </Button>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Custom Resource Allocator */}
            <div className="relative z-10 w-full max-w-4xl px-6 mb-24">
                <div className="rounded-3xl border border-white/10 bg-zinc-900/40 backdrop-blur-xl p-8 md:p-12">
                    <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                        <Activity className="h-6 w-6 text-white" />
                        Or Construct Your Matrix
                    </h2>

                    <div className="grid gap-12 md:grid-cols-2">
                        <div className="space-y-10">
                            {/* Research Slider */}
                            <div>
                                <div className="flex justify-between mb-4">
                                    <label className="text-sm text-gray-400 flex items-center gap-2"><Globe className="h-4 w-4" /> Deep Research (Pages/Mo)</label>
                                    <span className="font-mono text-cyan-400 font-bold">{researchLoad.toLocaleString()}</span>
                                </div>
                                <input
                                    type="range" min="100" max="10000" step="100"
                                    value={researchLoad} onChange={(e) => setResearchLoad(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                />
                            </div>

                            {/* Video Slider */}
                            <div>
                                <div className="flex justify-between mb-4">
                                    <label className="text-sm text-gray-400 flex items-center gap-2"><Video className="h-4 w-4" /> Video Rendering (Mins/Mo)</label>
                                    <span className="font-mono text-purple-400 font-bold">{videoMins}</span>
                                </div>
                                <input
                                    type="range" min="0" max="300" step="5"
                                    value={videoMins} onChange={(e) => setVideoMins(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                />
                            </div>

                            {/* Storage Slider */}
                            <div>
                                <div className="flex justify-between mb-4">
                                    <label className="text-sm text-gray-400 flex items-center gap-2"><HardDrive className="h-4 w-4" /> Neural Storage (GB)</label>
                                    <span className="font-mono text-emerald-400 font-bold">{storageGB} GB</span>
                                </div>
                                <input
                                    type="range" min="5" max="1000" step="5"
                                    value={storageGB} onChange={(e) => setStorageGB(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col justify-center items-center p-8 bg-white/5 rounded-2xl border border-white/10 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
                            <div className="relative z-10 text-center w-full">
                                <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Estimated Monthly Load</div>
                                <div className="text-6xl font-bold mb-2">${calculateCustomPrice()}<span className="text-lg text-gray-500">.00</span></div>
                                <div className="text-sm text-gray-400 mb-8">~ ₹{(Number(calculateCustomPrice()) * 85).toLocaleString()} / mo</div>

                                <Button className="w-full h-12 bg-white text-black hover:bg-gray-200 font-bold">Initialize Custom Core</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
