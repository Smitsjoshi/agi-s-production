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
      href: '/login', // Restricted access
      color: 'from-purple-500/20 to-blue-500/20'
    },
    {
      title: 'Synthesis',
      description: 'Multi-source intelligence fusion and deep research analysis.',
      icon: <Brain className="h-6 w-6 text-green-400" />,
      href: '/login', // Restricted access
      color: 'from-green-500/20 to-emerald-500/20'
    },
    {
      title: 'Vision',
      description: 'Advanced visual processing and real-time environment analysis.',
      icon: <Search className="h-6 w-6 text-blue-400" />,
      href: '/login', // Restricted access
      color: 'from-blue-500/20 to-cyan-500/20'
    },
    {
      title: 'Catalyst',
      description: 'Autonomous agent swarm orchestration and deployment.',
      icon: <Zap className="h-6 w-6 text-amber-400" />,
      href: '/login', // Restricted access
      color: 'from-amber-500/20 to-orange-500/20'
    }
  ];

  const logos = [
    // Vercel
    <svg key="vercel" viewBox="0 0 1155 1000" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-auto text-white/50 hover:text-white transition-colors"><path d="M577.344 0L1154.69 1000H0L577.344 0Z" fill="currentColor" /></svg>,
    // Next.js
    <svg key="next" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-auto text-white/50 hover:text-white transition-colors"><path mask="url(#mask0)" d="M90 0C40.2944 0 0 40.2944 0 90C0 139.706 40.2944 180 90 180C139.706 180 180 139.706 180 90C180 40.2944 139.706 0 90 0ZM37.9404 121.229C40.7303 112.592 53.6491 112.441 53.6491 86.852V60.9231H64.9961V88.9487C64.9961 97.4523 58.7495 102.771 52.8844 118.064L105.155 58.7563H119.349L64.269 146.516C49.9547 140.245 38.6534 130.347 30.6775 118.23L37.9404 121.229ZM145.474 132.84C137.498 143.203 126.96 151.05 114.996 156.467V88.8052C114.996 79.7997 122.915 76.8453 125.869 76.8453C128.823 76.8453 131.777 79.2215 131.777 88.8052V132.84H145.474ZM90 168.077C46.8682 168.077 11.9231 133.132 11.9231 90C11.9231 46.8682 46.8682 11.9231 90 11.9231C133.132 11.9231 168.077 46.8682 168.077 90C168.077 133.132 133.132 168.077 90 168.077Z" fill="currentColor" /></svg>,
    // Microsoft
    <svg key="ms" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-auto text-white/50 hover:text-white transition-colors"><path d="M0 0H10.7486V10.7486H0V0Z" fill="currentColor" /><path d="M12.2514 0H23V10.7486H12.2514V0Z" fill="currentColor" /><path d="M0 12.2514H10.7486V23H0V12.2514Z" fill="currentColor" /><path d="M12.2514 12.2514H23V23H12.2514V12.2514Z" fill="currentColor" /></svg>,
    // GitHub
    <svg key="github" viewBox="0 0 98 96" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-auto text-white/50 hover:text-white transition-colors"><path fillRule="evenodd" clipRule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z" fill="currentColor" /></svg>,
    // AWS
    <svg key="aws" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-auto text-white/50 hover:text-white transition-colors"><path d="M11.666 4.417c-2.43 0-4.634.619-6.324 1.7C3.96 7.003 3.69 7.397 3.84 7.733c.125.321.465.441.745.336 1.62-.841 3.73-1.372 5.861-1.372 5.17 0 9.07 2.112 9.07 5.823v.406h-2.31c-3.83 0-6.91 1.251-6.91 4.542 0 1.94 1.28 3.421 3.3 3.421 2.22 0 3.73-1.42 4.46-3.021l.13.11c.36.431.81.791 1.48.791.73 0 1.93-.36 2.65-.95l-.65-1.371c-.35.26-.81.44-1.12.44-.39 0-.49-.24-.49-.78V12.5c0-4.832-4.9-8.083-11.16-8.083zm0 14.473c-1.11 0-1.72-.51-1.72-1.471 0-1.741 2.01-2.221 4.54-2.221h2.24v1.891c-.69 1.15-2.22 1.8-5.06 1.8z" fill="currentColor" /></svg>
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

      {/* Logo Marquee Section */}
      <section className="border-y border-white/5 bg-black/50 overflow-hidden py-12 relative">
        <div className="mx-auto max-w-7xl px-6 mb-8 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-gray-500">Trusted by industry leaders</p>
        </div>
        <div className="relative flex overflow-hidden group">
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black via-black/80 to-transparent z-10" />

          <motion.div
            className="flex gap-24 items-center whitespace-nowrap"
            animate={{ x: [0, -1000] }}
            transition={{
              repeat: Infinity,
              duration: 30,
              ease: "linear",
            }}
          >
            {/* Loop 1 */}
            {logos.map((logo, i) => (
              <div key={`l1-${i}`} className="opacity-70 grayscale transition-all duration-500 hover:opacity-100 hover:grayscale-0">{logo}</div>
            ))}
            {/* Loop 2 */}
            {logos.map((logo, i) => (
              <div key={`l2-${i}`} className="opacity-70 grayscale transition-all duration-500 hover:opacity-100 hover:grayscale-0">{logo}</div>
            ))}
            {/* Loop 3 */}
            {logos.map((logo, i) => (
              <div key={`l3-${i}`} className="opacity-70 grayscale transition-all duration-500 hover:opacity-100 hover:grayscale-0">{logo}</div>
            ))}
            {/* Loop 4 */}
            {logos.map((logo, i) => (
              <div key={`l4-${i}`} className="opacity-70 grayscale transition-all duration-500 hover:opacity-100 hover:grayscale-0">{logo}</div>
            ))}
          </motion.div>
        </div>
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
