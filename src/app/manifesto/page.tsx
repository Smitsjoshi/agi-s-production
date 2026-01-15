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
        <div className="relative min-h-screen bg-black text-white font-sans selection:bg-white/30 overflow-x-hidden">
            <PrismBackground />

            {/* Navigation */}
            <nav className="fixed top-0 z-50 w-full p-6">
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Return to Source
                </Link>
            </nav>

            <main className="relative z-10 mx-auto max-w-4xl px-6 py-32 md:py-48">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="mb-24"
                >
                    <h1 className="text-5xl md:text-8xl font-bold tracking-tighter mb-6 bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
                        The Declaration of <br />
                        Digital Sovereignty.
                    </h1>
                    <div className="h-1 w-24 bg-white/20 rounded-full"></div>
                </motion.div>

                <div className="space-y-16">
                    {paragraphs.map((text, index) => (
                        <motion.p
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                            className="text-xl md:text-3xl font-light leading-relaxed text-gray-300 md:leading-relaxed"
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
                    className="mt-32 border-t border-white/10 pt-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-8"
                >
                    <div>
                        <div className="text-sm text-gray-500 uppercase tracking-widest mb-2">System Status</div>
                        <div className="text-2xl font-bold">Operational</div>
                    </div>

                    <Link href="/ask">
                        <button className="group relative px-8 py-4 bg-white text-black rounded-full font-bold text-lg overflow-hidden transition-all hover:scale-105">
                            <span className="relative z-10">Initialize Daemon</span>
                            <div className="absolute inset-0 bg-gray-200 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                        </button>
                    </Link>
                </motion.div>

            </main>
        </div>
    );
}
