'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ManifestoPage() {
    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-10%" },
        transition: { duration: 0.8, ease: "easeOut" }
    };

    return (
        <div className="relative min-h-screen bg-black text-white font-sans selection:bg-white/30 overflow-x-hidden p-6 md:p-12 lg:p-24 pb-48">

            {/* Navigation */}
            <nav className="fixed top-0 left-0 z-50 w-full p-6 bg-gradient-to-b from-black to-transparent">
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors uppercase tracking-widest">
                    <ArrowLeft className="h-3 w-3" /> Return to Source
                </Link>
            </nav>

            <main className="max-w-4xl mx-auto space-y-48 mt-24">

                {/* SECTION 1: THE OPENING */}
                <motion.section {...fadeInUp} className="space-y-12">
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold leading-[1.1] tracking-tight">
                        AGI-S is not a product. <br />
                        It’s a position.
                    </h1>
                    <div className="h-px w-24 bg-white"></div>
                    <h2 className="text-2xl md:text-4xl font-light text-gray-300 leading-relaxed max-w-2xl">
                        Today, humans don’t use intelligence. <br />
                        They juggle tools. <br />
                        <span className="text-white font-medium">AGI-S exists to end that era.</span>
                    </h2>
                </motion.section>

                {/* SECTION 2: THE PROBLEM */}
                <motion.section {...fadeInUp} className="space-y-12">
                    <div className="text-xs font-mono text-gray-500 uppercase tracking-widest">The Problem</div>
                    <h3 className="text-4xl md:text-5xl font-serif">The World Is Drowning in Tools.</h3>
                    <div className="space-y-6 text-xl md:text-2xl text-gray-400 font-light max-w-2xl">
                        <p>Every day, users switch between 5–10 platforms.</p>
                        <p>Each tool has its own interface. Its own logic. Its own learning curve.</p>
                        <p>Intelligence is fragmented. Context is lost. Time is wasted.</p>
                        <p className="text-white border-l-2 border-white pl-6">We don’t have a lack of AI. <br /> We have a lack of unity.</p>
                    </div>
                </motion.section>

                {/* SECTION 3: THE BELIEF SYSTEM */}
                <motion.section {...fadeInUp} className="space-y-12">
                    <div className="text-xs font-mono text-gray-500 uppercase tracking-widest">The Philosophy</div>
                    <h3 className="text-4xl md:text-5xl font-serif">What We Believe.</h3>
                    <div className="space-y-8 text-xl md:text-3xl font-light">
                        {[
                            "Intelligence should adapt to humans — not the other way around.",
                            "Context is more valuable than computation.",
                            "Interfaces should disappear, not multiply.",
                            "Users shouldn’t think in tools. They should think in outcomes.",
                            "AGI must be practical before it is perfect.",
                            "Access beats exclusivity. Always."
                        ].map((belief, i) => (
                            <div key={i} className="flex gap-6 items-baseline group">
                                <span className="text-sm font-mono text-gray-600">0{i + 1}</span>
                                <p className="group-hover:text-white transition-colors text-gray-400">{belief}</p>
                            </div>
                        ))}
                    </div>
                </motion.section>

                {/* SECTION 4: THE REBELLION */}
                <motion.section {...fadeInUp} className="space-y-12">
                    <div className="text-xs font-mono text-gray-500 uppercase tracking-widest">The Rebellion</div>
                    <h3 className="text-4xl md:text-5xl font-serif">What We Reject.</h3>
                    <div className="grid md:grid-cols-2 gap-12 text-lg text-gray-400">
                        <div className="space-y-4">
                            <p><span className="text-red-500 mr-2">×</span> We reject AI locked inside single-purpose apps.</p>
                            <p><span className="text-red-500 mr-2">×</span> We reject intelligence that resets every time you switch platforms.</p>
                            <p><span className="text-red-500 mr-2">×</span> We reject complexity sold as “power.”</p>
                        </div>
                        <div>
                            <p className="text-2xl text-white font-serif italic">"We reject the idea that users must learn AI. AI must learn users."</p>
                        </div>
                    </div>
                </motion.section>

                {/* SECTION 5: WHAT AGI-S IS */}
                <motion.section {...fadeInUp} className="space-y-12">
                    <div className="text-xs font-mono text-gray-500 uppercase tracking-widest">Definition</div>
                    <h3 className="text-4xl md:text-5xl font-serif">So, What Is AGI-S?</h3>
                    <div className="text-xl md:text-2xl font-light text-gray-300 space-y-6 max-w-2xl">
                        <p>AGI-S is a unified intelligence layer.</p>
                        <ul className="space-y-2 list-disc pl-5 text-gray-500">
                            <li>One interface.</li>
                            <li>Multiple platforms.</li>
                            <li>Infinite workflows.</li>
                        </ul>
                        <p>It observes context. It adapts behavior. It connects tools silently.</p>
                        <p className="text-white font-medium">AGI-S doesn’t replace platforms. It orchestrates them.</p>
                    </div>
                </motion.section>

                {/* SECTION 6: WHO THIS IS FOR */}
                <motion.section {...fadeInUp} className="grid md:grid-cols-2 gap-16 border-t border-white/10 pt-24">
                    <div>
                        <h4 className="text-2xl font-serif mb-8">This Is For You If...</h4>
                        <ul className="space-y-4 text-gray-400">
                            <li>✓ You’re tired of tool-hopping</li>
                            <li>✓ You think workflows should build themselves</li>
                            <li>✓ You value leverage over hustle</li>
                            <li>✓ You believe AI should feel invisible</li>
                            <li>✓ You want intelligence that compounds over time</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-2xl font-serif mb-8 text-gray-500">This Is Not For You If...</h4>
                        <ul className="space-y-4 text-gray-600">
                            <li>× You want a chatbot clone</li>
                            <li>× You like rigid dashboards</li>
                            <li>× You prefer manual workflows</li>
                            <li>× You think AI is just “automation”</li>
                        </ul>
                    </div>
                </motion.section>

                {/* SECTION 7: LONG TERM VISION */}
                <motion.section {...fadeInUp} className="space-y-12">
                    <div className="text-xs font-mono text-gray-500 uppercase tracking-widest">Vision</div>
                    <h3 className="text-4xl md:text-5xl font-serif">Where This Is Going.</h3>
                    <div className="text-xl text-gray-400 max-w-2xl">
                        <p className="mb-6">AGI-S is not chasing trends.</p>
                        <p className="mb-6">Today, it unifies tools. <br /> Tomorrow, it understands intent.</p>
                        <p className="text-white text-3xl font-serif">One day, intelligence will not be “used.” It will be present.</p>
                    </div>
                </motion.section>

                {/* SECTION 8: ETHICS */}
                <motion.section {...fadeInUp} className="space-y-12">
                    <div className="text-xs font-mono text-gray-500 uppercase tracking-widest">Responsibility</div>
                    <h3 className="text-4xl md:text-5xl font-serif">Power Requires Restraint.</h3>
                    <div className="text-xl text-gray-400 max-w-2xl">
                        <p className="mb-8">Intelligence without alignment is dangerous.</p>
                        <div className="grid grid-cols-3 gap-8 text-sm uppercase tracking-widest text-white">
                            <div>User Control</div>
                            <div>Transparency</div>
                            <div>Opt-in Intelligence</div>
                        </div>
                        <p className="mt-8 border-l-2 border-emerald-500 pl-6 text-emerald-400">We don’t harvest users. We empower them.</p>
                    </div>
                </motion.section>

                {/* SECTION 9: CLOSING */}
                <motion.section {...fadeInUp} className="pt-32 pb-32 text-center space-y-16">
                    <h2 className="text-5xl md:text-7xl font-serif font-bold leading-tight">
                        The question is not <br /> whether AGI will exist. <br />
                        <span className="text-gray-500">The question is whom it will serve.</span>
                    </h2>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                        <Link href="/ask">
                            <button className="px-12 py-5 bg-white text-black text-xl font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors">
                                Build with AGI-S
                            </button>
                        </Link>
                        <Link href="/">
                            <span className="text-gray-500 hover:text-white transition-colors cursor-pointer border-b border-transparent hover:border-white pb-1">Join the movement</span>
                        </Link>
                    </div>
                </motion.section>

            </main>
        </div>
    );
}
