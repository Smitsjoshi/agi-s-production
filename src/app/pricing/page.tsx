'use client';

import { motion } from 'framer-motion';
import { Check, X, Shield, Cpu, Zap, Globe, Database, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PrismBackground from '@/components/ui/prism-background';
import Link from 'next/link';

export default function PricingPage() {
    return (
        <div className="relative min-h-screen bg-black text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden pt-24 pb-24 flex flex-col items-center">
            <PrismBackground />

            {/* Navigation */}
            <nav className="fixed top-0 z-50 w-full p-6 flex justify-between items-center bg-black/50 backdrop-blur-md border-b border-white/5">
                <Link href="/" className="font-bold text-xl tracking-tight hover:text-cyan-400 transition-colors">AGI-S</Link>
                <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">Return to Console</Link>
            </nav>

            {/* Header */}
            <div className="relative z-10 text-center mb-16 px-4 max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-cyan-400 mb-6 tracking-widest uppercase">
                    Platform Access
                </div>
                <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">
                    Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">Intelligence Level</span>
                </h1>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
                    We do not charge for "storage" or "pages". We charge for **Autonomy Level**.
                    <br />
                    <span className="text-sm text-gray-500 mt-2 block">(Note: All plans require your own API Keys for LLM inference. You pay minimal platform fees + your actual usage.)</span>
                </p>
            </div>

            {/* Tiers Grid */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto px-6 mb-24 w-full">

                {/* TIER 1: STUDENT */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="relative flex flex-col rounded-3xl border border-white/10 bg-zinc-900/60 backdrop-blur-xl p-8 hover:border-blue-500/50 transition-all group"
                >
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-white mb-2">Student</h3>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold">$0</span>
                            <span className="text-gray-500">/mo</span>
                        </div>
                        <p className="text-sm text-gray-400 mt-4 leading-relaxed">
                            For learners manualy invoking AI assistance. Perfect for understanding the basics of UAL.
                        </p>
                    </div>
                    <div className="flex-1 space-y-4 mb-8 border-t border-white/5 pt-8">
                        <Feature icon={Check} text="Manual UAL Actions (Click-to-Run)" active={true} />
                        <Feature icon={Check} text="Basic Web Search (Google only)" active={true} />
                        <Feature icon={Check} text="Single Tab Context" active={true} />
                        <Feature icon={X} text="No Background Autonomy" active={false} />
                        <Feature icon={X} text="No Multi-Agent Swarm" active={false} />
                        <Feature icon={X} text="No Private Memory Vault" active={false} />
                    </div>
                    <Link href="/login?plan=student">
                        <Button variant="outline" className="w-full border-white/10 hover:bg-white/10 hover:text-white">Start Learning</Button>
                    </Link>
                </motion.div>

                {/* TIER 2: PROFESSIONAL */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="relative flex flex-col rounded-3xl border border-purple-500/30 bg-black/80 backdrop-blur-xl p-8 ring-1 ring-purple-500/20 shadow-2xl shadow-purple-900/20 transform md:-translate-y-4"
                >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase">
                        Most Popular
                    </div>
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-white mb-2">Professional</h3>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold">$29</span>
                            <span className="text-gray-500">/mo</span>
                        </div>
                        <p className="text-sm text-gray-400 mt-4 leading-relaxed">
                            For builders who need semi-autonomous agents. Includes the "Project Genesis" engine.
                        </p>
                    </div>
                    <div className="flex-1 space-y-4 mb-8 border-t border-white/5 pt-8">
                        <Feature icon={Check} text="Semi-Auto Actions (Chained)" active={true} />
                        <Feature icon={Check} text="Project Genesis (Prompt -> Code)" active={true} />
                        <Feature icon={Check} text="Hive Mind (Multi-Tab Context)" active={true} />
                        <Feature icon={Check} text="Persistent Memory (Vector DB)" active={true} />
                        <Feature icon={Check} text="Priority API Slots" active={true} />
                        <Feature icon={X} text="No 'Sovereign' Background Mode" active={false} />
                    </div>
                    <Link href="/login?plan=pro">
                        <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-none font-bold">
                            Upgrade to Pro
                        </Button>
                    </Link>
                </motion.div>

                {/* TIER 3: SOVEREIGN */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="relative flex flex-col rounded-3xl border border-emerald-500/30 bg-zinc-900/60 backdrop-blur-xl p-8 hover:border-emerald-500/50 transition-all group"
                >
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-white mb-2">Sovereign</h3>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold">$99</span>
                            <span className="text-gray-500">/mo</span>
                        </div>
                        <p className="text-sm text-gray-400 mt-4 leading-relaxed">
                            Full God Mode. Agents run in the background 24/7 without your supervision.
                        </p>
                    </div>
                    <div className="flex-1 space-y-4 mb-8 border-t border-white/5 pt-8">
                        <Feature icon={Check} text="Full Background Autonomy (Hidden Tabs)" active={true} />
                        <Feature icon={Check} text="Project OMEGA (Universe View)" active={true} />
                        <Feature icon={Check} text="Unlimited Agent Swarms" active={true} />
                        <Feature icon={Check} text="Self-Healing CodeX" active={true} />
                        <Feature icon={Check} text="Direct Neural Interface (API)" active={true} />
                        <Feature icon={Check} text="White-Glove Setup Support" active={true} />
                    </div>
                    <Link href="/login?plan=sovereign">
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
                            Become Sovereign
                        </Button>
                    </Link>
                </motion.div>

            </div>

            {/* API Usage Note */}
            <div className="relative z-10 max-w-3xl mx-auto px-6 text-center mb-16">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-4 text-left">
                    <HelpCircle className="h-6 w-6 text-gray-400 shrink-0 mt-1" />
                    <div>
                        <h4 className="font-bold text-white mb-2">How does pricing work with APIs?</h4>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            AGI-S is the <strong>Operating System</strong>. We charge for the software and the orchestration engine.
                            The actual "thinking" (LLM Inference) is paid directly by you to providers like OpenAI or Groq via your own API Keys.
                            This ensures <strong>you own your intelligence</strong> and we never mark up token costs.
                        </p>
                    </div>
                </div>
            </div>

            {/* Enterprise/Contact */}
            <div className="text-center relative z-10">
                <p className="text-gray-500 mb-4">Need a private instance on your own servers?</p>
                <Link href="/enterprise" className="text-white border-b border-white pb-0.5 hover:text-cyan-400 hover:border-cyan-400 transition-all">
                    Contact Enterprise Sales
                </Link>
            </div>

        </div>
    );
}

function Feature({ icon: Icon, text, active }: { icon: any, text: string, active: boolean }) {
    return (
        <div className={`flex items-start gap-3 ${active ? 'opacity-100' : 'opacity-40'}`}>
            <Icon className={`h-5 w-5 shrink-0 ${active ? 'text-cyan-400' : 'text-gray-500'}`} />
            <span className="text-sm text-gray-300">{text}</span>
        </div>
    );
}
