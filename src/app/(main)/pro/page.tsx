'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Zap, Cpu, Crown, Globe, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PrismBackground from '@/components/ui/prism-background';

export default function PricingPage() {
    const [tier, setTier] = useState(1); // 0: Spark, 1: Nexus, 2: Omni

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
        <div className="relative min-h-screen bg-black text-white font-sans selection:bg-cyan-500/30 overflow-hidden flex flex-col items-center justify-center">
            <PrismBackground />

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
            <div className="relative z-10 w-full max-w-md px-6 perspective-1000">
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

                        <div className="mt-6 text-center">
                            <p className="text-xs text-gray-500">
                                {tier === 0 ? "No credit card required." : "Secure encryption via Stripe."}
                            </p>
                        </div>

                    </motion.div>
                </AnimatePresence>
            </div>

        </div>
    );
}
