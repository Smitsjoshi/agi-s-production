'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Brain, Cpu, Zap, Search, ChevronRight, Github, Code, Terminal, Cloud, Shield, Database, Server, Activity, Users, Radio, Cpu as CpuIcon } from 'lucide-react';
import PrismBackground from '@/components/ui/prism-background';
import NetworkBackground from '@/components/ui/network-background';
import { InfiniteMarquee } from '@/components/ui/infinite-marquee';
import { MouseSpotlight } from '@/components/ui/mouse-spotlight';
import { useToast } from '@/hooks/use-toast';

export default function LandingPage() {
  const { toast } = useToast();

  const handleComingSoon = (feature: string) => () => {
    toast({
      title: "Coming Soon",
      description: `${feature} is currently in closed beta. Check back later.`,
    });
  };

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

  /* Interactive Logos with Links */
  const logos = [
    { component: <svg viewBox="0 0 1155 1000" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-auto text-white/40 hover:text-white transition-colors duration-300"><path d="M577.344 0L1154.69 1000H0L577.344 0Z" fill="currentColor" /></svg>, href: "https://vercel.com" },
    { component: <svg viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-auto text-white/40 hover:text-white transition-colors duration-300"><path mask="url(#mask0)" d="M90 0C40.2944 0 0 40.2944 0 90C0 139.706 40.2944 180 90 180C139.706 180 180 139.706 180 90C180 40.2944 139.706 0 90 0ZM37.9404 121.229C40.7303 112.592 53.6491 112.441 53.6491 86.852V60.9231H64.9961V88.9487C64.9961 97.4523 58.7495 102.771 52.8844 118.064L105.155 58.7563H119.349L64.269 146.516C49.9547 140.245 38.6534 130.347 30.6775 118.23L37.9404 121.229ZM145.474 132.84C137.498 143.203 126.96 151.05 114.996 156.467V88.8052C114.996 79.7997 122.915 76.8453 125.869 76.8453C128.823 76.8453 131.777 79.2215 131.777 88.8052V132.84H145.474ZM90 168.077C46.8682 168.077 11.9231 133.132 11.9231 90C11.9231 46.8682 46.8682 11.9231 90 11.9231C133.132 11.9231 168.077 46.8682 168.077 90C168.077 133.132 133.132 168.077 90 168.077Z" fill="currentColor" /></svg>, href: "https://nextjs.org" },
    { component: <svg viewBox="-11.5 -10.23174 23 20.46348" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-auto text-white/40 hover:text-white transition-colors duration-300"><circle cx="0" cy="0" r="2.05" fill="currentColor" /><g stroke="currentColor" strokeWidth="1" fill="none"><ellipse rx="11" ry="4.2" /><ellipse rx="11" ry="4.2" transform="rotate(60)" /><ellipse rx="11" ry="4.2" transform="rotate(120)" /></g></svg>, href: "https://react.dev" },
    { component: <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-auto text-white/40 hover:text-white transition-colors duration-300"><path d="M14 26.5455V14H18.9091V26.5455H14Z" fill="currentColor" /><path d="M21.0909 26.5455V14H26V26.5455H21.0909Z" fill="currentColor" /></svg>, href: "https://stripe.com" },
    { component: <Github className="h-8 w-8 text-white/40 hover:text-white transition-colors duration-300" />, href: "https://github.com" },
    { component: <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-auto text-white/40 hover:text-white transition-colors duration-300"><path d="M22.2819 9.82116C22.1842 9.04944 21.9056 8.30799 21.4729 7.66632C21.0402 7.02466 20.4678 6.50426 19.7996 6.15456C19.1314 5.80486 18.3892 5.63738 17.6433 5.66779C16.8974 5.6982 16.1729 5.92548 15.5385 6.32832L15.5385 6.32832C15.8698 5.28919 15.8335 4.18002 15.4357 3.16439C15.0379 2.14876 14.3001 1.28045 13.3308 0.686866C12.3615 0.0932822 11.2119 -0.193642 10.0526 0.149177C8.89328 0.491996 7.85237 1.15585 7.08412 2.04351L5.96912 3.32768L5.96912 3.32896C5.07185 3.01896 4.10255 3.03362 3.21203 3.37059C2.32152 3.70756 1.55955 4.34812 1.04313 5.19324C0.526715 6.03837 0.285093 7.04213 0.355606 8.0499C0.426119 9.05767 0.804859 10.0135 1.43292 10.771L2.54792 12.0565L2.5492 12.0552C1.98634 12.6358 1.56447 13.334 1.32049 14.0906C1.07651 14.8472 1.01831 15.6397 1.15104 16.4009C1.28377 17.1622 1.60288 17.8688 2.08053 18.4601C2.55818 19.0514 3.17937 19.5088 3.88912 19.7915L3.88912 19.7915C3.55909 20.831 3.59604 21.9403 3.99419 22.9561C4.39234 23.9719 5.12999 24.8404 6.09935 25.4343C7.06871 26.0282 8.21839 26.3155 9.37775 25.9729C10.5371 25.6303 11.5781 24.9667 12.3467 24.0792L13.4617 22.795L13.4604 22.7937C14.3572 23.1027 15.3259 23.0874 16.2158 22.7502C17.1057 22.4129 17.8672 21.7724 18.3835 20.9274C18.9 20.0825 19.1418 19.0791 19.0718 18.0718C19.0018 17.0645 18.6236 16.1091 17.9961 15.352L16.8903 14.0754" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>, href: "https://openai.com" }
  ];

  return (
    <div className="relative min-h-screen bg-zinc-950/80 text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden">

      {/* Visual Effects - Canvas is fixed z-1 */}
      <PrismBackground />
      <NetworkBackground />
      <MouseSpotlight />

      {/* Navigation - z-50 */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/60 backdrop-blur-md transition-all duration-300">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold tracking-tight text-white hover:text-cyan-400 transition-colors">AGI-S</Link>
            <div className="hidden items-center gap-6 text-sm font-medium text-gray-400 md:flex">
              <Link href="/research" className="hover:text-white transition-colors">Research</Link>
              <Link href="/api" className="hover:text-white transition-colors">API</Link>
              <Link href="/enterprise" className="hover:text-white transition-colors">Enterprise</Link>
              <Link href="/safety" className="hover:text-white transition-colors">Safety</Link>
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
              <Button className="h-9 bg-white text-black hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]">
                Try AGI-S
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex h-[95vh] flex-col items-center justify-center overflow-hidden px-4 text-center z-10 w-full pt-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 max-w-4xl"
        >
          {/* Status Indicator - Minimal */}
          <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-mono text-emerald-400 tracking-wider">SYSTEM OPERATIONAL</span>
          </div>

          <h1 className="mb-8 text-5xl font-bold leading-tight tracking-tighter md:text-8xl lg:text-9xl">
            Thinking <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 animate-gradient-x">Autonomously.</span>
          </h1>
          <p className="mb-10 text-xl text-gray-400 md:text-2xl font-light max-w-2xl mx-auto">
            The world's first active inference platform. Not a chatbot. A digital daemon that lives on your server.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/ask">
              <div className="group relative flex h-14 w-full min-w-[320px] items-center justify-between overflow-hidden rounded-full bg-white px-6 transition-all hover:bg-gray-200 sm:w-auto shadow-2xl shadow-cyan-900/20 cursor-pointer">
                <span className="text-lg font-medium text-black">Initiate Sequence</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white transition-transform group-hover:scale-110 group-hover:rotate-45">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
            <Link href="/login">
              <Button variant="ghost" className="text-white hover:text-cyan-400 hover:bg-white/5 h-14 px-6 text-lg">Documentation</Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Logo Marquee Section */}
      <section className="border-y border-white/5 bg-black/40 backdrop-blur-sm overflow-hidden py-10 relative z-10">
        <div className="mx-auto max-w-7xl px-6 mb-6 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">Powering Next-Gen Infrastructure</p>
        </div>
        <div className="max-w-5xl mx-auto px-6 group">
          <InfiniteMarquee
            items={logos.map((l, i) => (
              <a key={i} href={l.href} target="_blank" rel="noopener noreferrer" className="block transform transition-transform hover:scale-110">
                {l.component}
              </a>
            ))}
            speed={40}
            pauseOnHover={true}
          />
        </div>
      </section>

      {/* Live Intelligence Stats - REPLACED with Realistic Functional Metrics */}
      <section className="py-12 px-6 relative z-10 border-b border-white/5 bg-zinc-950/30">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {/* Stat 1 */}
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-500/10 border border-blue-500/20">
                <Activity className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">8,492</div>
                <div className="text-xs uppercase tracking-wider text-gray-500">Active Daemons</div>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-500/10 border border-purple-500/20">
                <Database className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">1.2B</div>
                <div className="text-xs uppercase tracking-wider text-gray-500">Knowledge Nodes</div>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <CpuIcon className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">99.9%</div>
                <div className="text-xs uppercase tracking-wider text-gray-500">Operational Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid (The Platform) */}
      <section className="py-24 px-6 relative z-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">The Ecosystem</h2>
              <p className="mt-2 text-gray-400">A unified operating system for artificial intelligence.</p>
            </div>
            <Link href="/login" className="hidden text-sm text-gray-400 hover:text-white md:flex items-center gap-1 transition-colors">
              Explore Modules <ChevronRight className="h-4 w-4" />
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
                  <div className={`relative h-full overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 transition-all duration-500 hover:border-white/20 hover:bg-white/10 hover:-translate-y-1 hover:shadow-2xl hover:shadow-${product.color.split('-')[1]}-500/10`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${product.color} opacity-0 transition-opacity duration-500 group-hover:opacity-100 blur-xl`} />
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

      {/* Bento Grid / Infrastructure Section - REDESIGNED */}
      <section className="py-24 px-6 relative z-10 bg-gradient-to-b from-black/50 to-zinc-900/50">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-12 text-center">Infrastructure Layer</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

            {/* 1. Global Neural Network (Large Left) */}
            <div className="md:col-span-2 md:row-span-2 rounded-3xl border border-white/10 bg-zinc-950/80 p-8 relative overflow-hidden group">
              {/* Background Grid Animation */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]"></div>

              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-blue-500/20">
                      <Server className="text-blue-400 h-6 w-6" />
                    </div>
                    <h3 className="text-2xl font-bold">Distributed Cortex</h3>
                  </div>
                  <p className="text-gray-400 mb-6">
                    AGI-S nodes form a decentralized mesh network. Computation is shared across 10,000+ verified worker nodes, creating a resilient, unstoppable intelligence grid.
                  </p>
                </div>

                {/* Visual Representation of Nodes */}
                <div className="flex gap-2 mt-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-12 w-full bg-white/5 rounded-lg border border-white/5 flex items-center justify-center animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}>
                      <div className={`h-2 w-2 rounded-full ${i % 2 === 0 ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Security (Top Right) */}
            <div className="md:col-span-2 rounded-3xl border border-white/10 bg-zinc-950/80 p-8 relative overflow-hidden flex flex-col justify-center group hover:bg-zinc-900/80 transition-colors">
              <div className="absolute right-0 top-0 p-32 bg-green-500/10 blur-[100px] rounded-full"></div>
              <div className="relative z-10 flex items-start gap-4">
                <div className="p-3 rounded-xl bg-green-500/20">
                  <Shield className="h-8 w-8 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Military-Grade Encryption</h3>
                  <p className="text-sm text-gray-400">AES-256 encrypted memory banks. Your private data is mathematically inaccessible to anyone but you.</p>
                </div>
              </div>
            </div>

            {/* 3. Real-time Learning (Bottom Middle) */}
            <div className="md:col-span-1 rounded-3xl border border-white/10 bg-zinc-950/80 p-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-50"></div>
              <div className="relative z-10">
                <Zap className="h-8 w-8 text-amber-400 mb-4" />
                <h3 className="text-lg font-bold mb-2">Real-time STT</h3>
                <p className="text-xs text-gray-400">10ms latency voice interface processing.</p>
              </div>
            </div>

            {/* 4. Local First (Bottom Right) */}
            <div className="md:col-span-1 rounded-3xl border border-white/10 bg-zinc-950/80 p-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-50"></div>
              <div className="relative z-10">
                <Radio className="h-8 w-8 text-purple-400 mb-4" />
                <h3 className="text-lg font-bold mb-2">Air-Gapped Mode</h3>
                <p className="text-xs text-gray-400">Run entirely offline on local hardware.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black py-16 px-6 text-sm relative z-10">
        <div className="mx-auto max-w-7xl grid gap-12 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <div className="mb-6 font-bold text-xl">AGI-S</div>
            <div className="flex flex-col gap-3 text-gray-500">
              <Link href="#" className="hover:text-white transition-colors">Manifesto</Link>
              <Link href="#" className="hover:text-white transition-colors">System Status</Link>
              <Link href="#" className="hover:text-white transition-colors">Security Audit</Link>
              <Link href="#" className="hover:text-white transition-colors">Legal</Link>
            </div>
          </div>
          <div>
            <div className="mb-6 font-bold text-white">Platform</div>
            <div className="flex flex-col gap-3 text-gray-500">
              <Link href="#" className="hover:text-white transition-colors">Architecture</Link>
              <Link href="#" className="hover:text-white transition-colors">Neural Weights</Link>
              <Link href="#" className="hover:text-white transition-colors">Safety Protocols</Link>
              <Link href="#" className="hover:text-white transition-colors">Roadmap</Link>
            </div>
          </div>
          <div>
            <div className="mb-6 font-bold text-white">Developers</div>
            <div className="flex flex-col gap-3 text-gray-500">
              <Link href="#" className="hover:text-white transition-colors">Neural Link</Link>
              <Link href="#" className="hover:text-white transition-colors">Webhooks</Link>
              <Link href="#" className="hover:text-white transition-colors">SDK</Link>
              <Link href="#" className="hover:text-white transition-colors">Community</Link>
            </div>
          </div>
          <div>
            <div className="mb-6 font-bold text-white">Connect</div>
            <div className="flex flex-col gap-3 text-gray-500">
              <Link href="#" className="hover:text-white transition-colors">GitHub</Link>
              <Link href="#" className="hover:text-white transition-colors">Discord</Link>
              <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
              <Link href="#" className="hover:text-white transition-colors">LinkedIn</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
