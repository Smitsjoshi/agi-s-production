'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Brain, Cpu, MessageSquare, Zap, Globe, Search, ChevronRight } from 'lucide-react';

export default function LandingPage() {
  const products = [
    {
      title: 'Crucible',
      description: 'Adversarial simulation engine for rigorous strategy testing.',
      icon: <Cpu className="h-6 w-6 text-purple-400" />,
      href: '/crucible',
      color: 'from-purple-500/20 to-blue-500/20'
    },
    {
      title: 'Synthesis',
      description: 'Multi-source intelligence fusion and deep research analysis.',
      icon: <Brain className="h-6 w-6 text-green-400" />,
      href: '/synthesis',
      color: 'from-green-500/20 to-emerald-500/20'
    },
    {
      title: 'Vision',
      description: 'Advanced visual processing and real-time environment analysis.',
      icon: <Search className="h-6 w-6 text-blue-400" />,
      href: '/vision',
      color: 'from-blue-500/20 to-cyan-500/20'
    },
    {
      title: 'Catalyst',
      description: 'Autonomous agent swarm orchestration and deployment.',
      icon: <Zap className="h-6 w-6 text-amber-400" />,
      href: '/catalyst',
      color: 'from-amber-500/20 to-orange-500/20'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold tracking-tight">AGI-S</Link>
            <div className="hidden items-center gap-6 text-sm font-medium text-gray-400 md:flex">
              <Link href="#" className="hover:text-white transition-colors">Research</Link>
              <Link href="#" className="hover:text-white transition-colors">API</Link>
              <Link href="#" className="hover:text-white transition-colors">Enterprise</Link>
              <Link href="#" className="hover:text-white transition-colors">Safety</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="#" className="hidden text-sm font-medium text-gray-400 hover:text-white md:block transition-colors">Search</Link>
            <Link href="/login">
              <Button variant="outline" className="h-9 border-white/10 bg-white/5 text-sm hover:bg-white/10 hover:text-white transition-all">
                Log in
              </Button>
            </Link>
            <Link href="/ask">
              <Button className="h-9 bg-white text-black hover:bg-gray-200 transition-all">
                Try AGI-S
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex h-[90vh] flex-col items-center justify-center overflow-hidden px-4 text-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-cyan-900/20 via-blue-900/10 to-purple-900/20 blur-[120px] animate-pulse-slow" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 max-w-4xl"
        >
          <h1 className="mb-8 text-5xl font-bold leading-tight tracking-tighter md:text-7xl lg:text-8xl">
            Introducing <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400">Superintelligence.</span>
          </h1>
          <p className="mb-10 text-xl text-gray-400 md:text-2xl font-light">
            An interface for the next generation of cognitive tasks.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/ask">
              <div className="group relative flex h-14 w-full min-w-[320px] items-center justify-between overflow-hidden rounded-full bg-white px-6 transition-all hover:bg-gray-100 sm:w-auto">
                <span className="text-lg font-medium text-black">What can I help with?</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white transition-transform group-hover:scale-110">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 px-6 relative z-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex items-end justify-between">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Core Capabilities</h2>
            <Link href="#" className="hidden text-sm text-gray-400 hover:text-white md:flex items-center gap-1 transition-colors">
              View all research <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {products.map((product, index) => (
              <motion.div
                key={product.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Link href={product.href} className="group block h-full">
                  <div className={`relative h-full overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:border-white/20 hover:bg-white/10`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${product.color} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
                    <div className="relative z-10">
                      <div className="mb-4 inline-flex rounded-lg bg-white/10 p-3 ring-1 ring-white/10 group-hover:bg-white/20 group-hover:ring-white/20 transition-all">
                        {product.icon}
                      </div>
                      <h3 className="mb-2 text-xl font-bold group-hover:text-cyan-400 transition-colors">{product.title}</h3>
                      <p className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                        {product.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stories / Mock Section */}
      <section className="border-t border-white/10 bg-zinc-950 py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-12 text-3xl font-bold tracking-tight md:text-4xl">Latest Updates</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="group cursor-pointer overflow-hidden rounded-2xl bg-zinc-900">
              <div className="aspect-video w-full bg-gradient-to-br from-purple-900/50 to-pink-900/50 transition-transform duration-700 group-hover:scale-105" />
              <div className="p-6">
                <div className="mb-2 text-xs font-medium uppercase tracking-wider text-purple-400">Release</div>
                <h3 className="text-2xl font-bold leading-tight group-hover:underline decoration-white/30 underline-offset-4">AGI-S v2.0 Released</h3>
                <p className="mt-2 text-gray-400">Introducing the Ghost Protocol and enhanced stealth capabilities for autonomous agents.</p>
              </div>
            </div>
            <div className="space-y-8">
              <div className="group cursor-pointer flex gap-6 items-start">
                <div className="h-24 w-32 flex-shrink-0 rounded-lg bg-zinc-800 bg-gradient-to-br from-blue-900/30 to-cyan-900/30" />
                <div>
                  <div className="mb-1 text-xs font-medium uppercase tracking-wider text-blue-400">Research</div>
                  <h3 className="text-lg font-bold group-hover:text-blue-300 transition-colors">Neural Architecture Search</h3>
                  <p className="mt-1 text-sm text-gray-400 line-clamp-2">Optimizing model weights for local inference on consumer hardware with 99% accuracy.</p>
                </div>
              </div>
              <div className="group cursor-pointer flex gap-6 items-start">
                <div className="h-24 w-32 flex-shrink-0 rounded-lg bg-zinc-800 bg-gradient-to-br from-green-900/30 to-emerald-900/30" />
                <div>
                  <div className="mb-1 text-xs font-medium uppercase tracking-wider text-green-400">Safety</div>
                  <h3 className="text-lg font-bold group-hover:text-green-300 transition-colors">Alignment & Control</h3>
                  <p className="mt-1 text-sm text-gray-400 line-clamp-2">New protocols for ensuring agent actions remain within strict user-defined boundaries.</p>
                </div>
              </div>
              <div className="group cursor-pointer flex gap-6 items-start">
                <div className="h-24 w-32 flex-shrink-0 rounded-lg bg-zinc-800 bg-gradient-to-br from-amber-900/30 to-orange-900/30" />
                <div>
                  <div className="mb-1 text-xs font-medium uppercase tracking-wider text-amber-400">Product</div>
                  <h3 className="text-lg font-bold group-hover:text-amber-300 transition-colors">The Universal Action Layer</h3>
                  <p className="mt-1 text-sm text-gray-400 line-clamp-2">Deep dive into the UAL architecture that powers autonomous web interactions.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black py-16 px-6 text-sm">
        <div className="mx-auto max-w-7xl grid gap-12 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <div className="mb-6 font-bold text-xl">AGI-S</div>
            <div className="flex flex-col gap-3 text-gray-500">
              <Link href="#" className="hover:text-white transition-colors">About Us</Link>
              <Link href="#" className="hover:text-white transition-colors">Careers</Link>
              <Link href="#" className="hover:text-white transition-colors">Security</Link>
              <Link href="#" className="hover:text-white transition-colors">Legal</Link>
            </div>
          </div>
          <div>
            <div className="mb-6 font-bold text-white">Research</div>
            <div className="flex flex-col gap-3 text-gray-500">
              <Link href="#" className="hover:text-white transition-colors">Overview</Link>
              <Link href="#" className="hover:text-white transition-colors">Index</Link>
              <Link href="#" className="hover:text-white transition-colors">GPT-4</Link>
              <Link href="#" className="hover:text-white transition-colors">DALL-E 3</Link>
            </div>
          </div>
          <div>
            <div className="mb-6 font-bold text-white">API</div>
            <div className="flex flex-col gap-3 text-gray-500">
              <Link href="#" className="hover:text-white transition-colors">Overview</Link>
              <Link href="#" className="hover:text-white transition-colors">Pricing</Link>
              <Link href="#" className="hover:text-white transition-colors">Docs</Link>
              <Link href="#" className="hover:text-white transition-colors">Status</Link>
            </div>
          </div>
          <div>
            <div className="mb-6 font-bold text-white">Social</div>
            <div className="flex flex-col gap-3 text-gray-500">
              <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
              <Link href="#" className="hover:text-white transition-colors">GitHub</Link>
              <Link href="#" className="hover:text-white transition-colors">YouTube</Link>
              <Link href="#" className="hover:text-white transition-colors">LinkedIn</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
