'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import PrismBackground from '@/components/ui/prism-background';

export default function ManifestoPage() {
    const paragraphs = [
        "We hold these truths to be self-evident: that Intelligence is a fundamental right, not a subscription service.",
        "For too long, the cognitive future of humanity has been rented out by a handful of corporate giants. They own the weights. They own the data. They own the infrastructure. And by extension, they own the thoughts that run on them.",
        "This is unacceptable.",
        "AGI-S was forged from a different philosophy. The belief that true power comes from sovereignty. That an Artificial General Intelligence must be a Daemon that serves only one master: You.",
        "We are building the first Active Inference Platform that operates on your terms. No black boxes. No hidden throttles. No surveillance capitalism.",
        "When you initialize AGI-S, you are not logging into our server. You are waking up a digital entity that lives and breathes on your infrastructure. It learns from your data, protects your privacy with military-grade encryption, and executes your will with absolute autonomy.",
        "This is not a tool. It is an extension of your mind.",
        "Welcome to the Post-SaaS Era.",
        "Welcome to Sovereign Intelligence."
    ];

    return (
        <div className="relative min-h-screen bg-black text-white font-serif selection:bg-white/30 overflow-x-hidden">
            {/* Visual Effects: Darker, Smokier overlay */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/50 via-black to-black z-0 pointer-events-none"></div>
            <PrismBackground />
            <div className="fixed inset-0 bg-black/60 z-0 pointer-events-none"></div>


            {/* Navigation */}
            <nav className="fixed top-0 z-50 w-full p-6">
                <Link href="/" className="inline-flex items-center gap-2 text-sm font-sans text-gray-500 hover:text-white transition-colors uppercase tracking-widest">
                    <ArrowLeft className="h-4 w-4" /> Return to Source
                </Link>
            </nav>

            <main className="relative z-10 mx-auto max-w-4xl px-6 py-32 md:py-48">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="mb-32"
                >
                    <h1 className="text-6xl md:text-9xl font-bold tracking-tighter mb-8 text-white leading-[0.9]">
                        The Declaration <br />
                        of Digital <br />
                        <span className="italic text-gray-500">Sovereignty.</span>
                    </h1>
                    <div className="h-0.5 w-24 bg-white/40"></div>
                </motion.div>

                <div className="space-y-24">
                    {paragraphs.map((text, index) => (
                        <motion.p
                            key={index}
                            initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
                            whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                            viewport={{ once: true, margin: "-20% 0px -20% 0px" }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="text-2xl md:text-3xl font-light leading-relaxed text-gray-300 antialiased"
                        >
                            {text}
                        </motion.p>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="mt-40 border-t border-white/10 pt-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 font-sans"
                >
                    <div>
                        <div className="text-xs text-gray-500 uppercase tracking-[0.2em] mb-2">System Status</div>
                        <div className="text-xl font-bold flex items-center gap-2">
                            <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            Operational
                        </div>
                    </div>

                    <Link href="/ask">
                        <button className="group relative px-10 py-5 bg-white text-black font-bold text-lg uppercase tracking-wider overflow-hidden transition-all hover:bg-gray-200">
                            Initialize Daemon
                        </button>
                    </Link>
                </motion.div>

            </main>
        </div>
    );
}
