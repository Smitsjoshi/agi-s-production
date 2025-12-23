'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Sparkles, Globe, Terminal, Cpu, Search, Link, ThumbsUp, ThumbsDown, Zap, BarChart3, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchSource {
    title: string;
    url: string;
}

interface SearchResponse {
    phase: 'ASK_USER' | 'ANSWER_READY';
    prompt?: string;
    answer?: string;
    answer_id?: string;
    summary?: string;
    sources?: SearchSource[];
    error?: string;
}

export default function CanvasPage() {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [phase, setPhase] = useState<'INIT' | 'ASK_USER' | 'ANSWER_READY'>('INIT');
    const [prompt, setPrompt] = useState('');
    const [answer, setAnswer] = useState('');
    const [answerId, setAnswerId] = useState('');
    const [summary, setSummary] = useState('');
    const [sources, setSources] = useState<SearchSource[]>([]);
    const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
    const [error, setError] = useState('');
    const [isInitializing, setIsInitializing] = useState(true);

    const scrollRef = useRef<HTMLDivElement>(null);

    // Initialize session on mount
    useEffect(() => {
        const initSession = async () => {
            setIsInitializing(true);
            try {
                const res = await fetch('/api/session', { method: 'POST' });
                const data = await res.json();
                if (data.session_id) {
                    setSessionId(data.session_id);
                }
            } catch (err) {
                console.error('Failed to init session', err);
                setError('Failed to initialize AGI-S session. Please refresh.');
            } finally {
                setIsInitializing(false);
            }
        };
        initSession();
    }, []);

    const handleSearch = async (isContinue: boolean = false) => {
        if (!query.trim()) return;

        // If session didn't init, try to init now or show error
        let currentSessionId = sessionId;
        if (!currentSessionId) {
            setIsSearching(true);
            try {
                const res = await fetch('/api/session', { method: 'POST' });
                const data = await res.json();
                if (data.session_id) {
                    currentSessionId = data.session_id;
                    setSessionId(currentSessionId);
                } else {
                    throw new Error('Could not establish session');
                }
            } catch (err) {
                setError('Connection lost. Please refresh the page.');
                setIsSearching(false);
                return;
            }
        }

        setIsSearching(true);
        setError('');
        setFeedback(null);

        const endpoint = isContinue ? '/api/search/continue' : '/api/search';
        const body = isContinue
            ? { session_id: currentSessionId, user_input: query }
            : { session_id: currentSessionId, query: query };

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data: SearchResponse = await res.json();

            if (data.error) {
                setError(data.error);
                return;
            }

            setPhase(data.phase);
            if (data.phase === 'ASK_USER') {
                setPrompt(data.prompt || '');
                setQuery(''); // Clear for user input
            } else if (data.phase === 'ANSWER_READY') {
                setAnswer(data.answer || '');
                setAnswerId(data.answer_id || '');
                setSummary(data.summary || '');
                setSources(data.sources || []);
            }
        } catch (err: any) {
            setError(`Synthesis failed: ${err.message}`);
        } finally {
            setIsSearching(false);
        }
    };

    const handleFeedback = async (vote: 'up' | 'down') => {
        if (!answerId) return;
        setFeedback(vote);
        try {
            await fetch('/api/search/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answer_id: answerId, feedback: vote }),
            });
        } catch (err) {
            console.error('Feedback failed', err);
        }
    };

    return (
        <div className="min-h-screen bg-[#020202] text-white font-sans flex flex-col items-center p-6 relative overflow-hidden">
            {/* Background Ambience - Deep Purple/Blue Pulse */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(37,99,235,0.15)_0%,rgba(0,0,0,0)_60%)] pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>

            <div className="w-full max-w-5xl z-10 flex flex-col gap-10 pt-20">

                {/* Branding Section */}
                <div className="text-center space-y-6 animate-in fade-in slide-in-from-top-6 duration-1000">
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-4">
                        <Zap className="h-4 w-4 text-blue-400 fill-blue-400" />
                        <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-blue-100/60">AGI-S Universal Action Layer</span>
                    </div>
                    <h1 className="text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/20 leading-[1.1]">
                        Intelligent Synthesis
                    </h1>
                </div>

                {/* Search Interface */}
                <div className="relative group max-w-3xl mx-auto w-full transition-all duration-500 hover:scale-[1.01]">
                    <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-600/30 via-cyan-500/30 to-blue-600/30 rounded-[2.5rem] blur-2xl group-hover:opacity-100 transition duration-700 opacity-40"></div>
                    <div className="relative bg-[#080808]/90 backdrop-blur-3xl rounded-[2rem] border border-white/10 flex items-center p-3 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        <div className="pl-6 pr-4">
                            {isSearching || isInitializing ? (
                                <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                            ) : (
                                <Layers className="h-6 w-6 text-white/40" />
                            )}
                        </div>
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !isSearching && handleSearch(phase === 'ASK_USER')}
                            placeholder={phase === 'ASK_USER' ? "Provide more context..." : "Ask AGI-S anything..."}
                            className="bg-transparent border-0 text-xl h-14 text-white placeholder:text-white/10 focus-visible:ring-0 font-light"
                            disabled={isSearching}
                            autoFocus
                        />
                        <Button
                            onClick={() => handleSearch(phase === 'ASK_USER')}
                            disabled={isSearching || !query.trim()}
                            className="bg-white text-black hover:bg-[#f0f0f0] h-12 px-8 rounded-2xl font-bold text-sm tracking-tight transition-all active:scale-95 shadow-lg overflow-hidden group/btn"
                        >
                            <span className="relative z-10">{isSearching ? 'Processing...' : (phase === 'ASK_USER' ? 'Refine' : 'Search')}</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-white opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                        </Button>
                    </div>
                </div>

                {error && (
                    <div className="max-w-3xl mx-auto w-full bg-red-500/5 border border-red-500/20 p-5 rounded-2xl text-red-400 text-sm flex items-center gap-4 animate-in shake duration-500">
                        <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center">
                            <Terminal className="h-4 w-4" />
                        </div>
                        <span className="font-medium tracking-tight text-base">{error}</span>
                    </div>
                )}

                {/* Phase: ASK_USER */}
                {phase === 'ASK_USER' && prompt && !isSearching && (
                    <div className="max-w-3xl mx-auto w-full animate-in fade-in slide-in-from-bottom-6 duration-700">
                        <div className="bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/20 p-8 rounded-[2.5rem] backdrop-blur-xl space-y-4">
                            <div className="flex items-center gap-3 text-blue-400">
                                <Sparkles className="h-5 w-5 fill-blue-400" />
                                <span className="text-xs font-black uppercase tracking-[0.3em]">Ambiguity Detected</span>
                            </div>
                            <p className="text-2xl text-white/90 font-medium leading-normal tracking-tight">
                                {prompt}
                            </p>
                        </div>
                    </div>
                )}

                {/* Results Section */}
                {phase === 'ANSWER_READY' && (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">

                        {/* Main Content */}
                        <div className="lg:col-span-3 space-y-10">
                            <div className="bg-[#080808]/60 backdrop-blur-xl border border-white/5 rounded-[3rem] p-12 shadow-2xl space-y-10">
                                <div className="space-y-4">
                                    <div className="inline-flex items-center gap-2.5 py-1.5 px-3 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                        <Cpu className="h-3.5 w-3.5" />
                                        Synthetic Output
                                    </div>
                                    <h2 className="text-4xl font-bold text-white leading-[1.2] tracking-tight">
                                        {summary}
                                    </h2>
                                </div>

                                <div className="h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent"></div>

                                <div className="space-y-6">
                                    <p className="text-white/80 leading-relaxed text-[1.125rem] font-light whitespace-pre-wrap tracking-normal">
                                        {answer}
                                    </p>
                                </div>

                                {/* Evaluation */}
                                <div className="flex items-center gap-6 pt-10 border-t border-white/5 mt-12">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-black">Accuracy Evaluation</span>
                                        <p className="text-[11px] text-white/20">Help AGI-S improve its synthesis models</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleFeedback('up')}
                                            className={cn(
                                                "h-12 w-12 rounded-2xl flex items-center justify-center transition-all border",
                                                feedback === 'up' ? "bg-blue-500 text-white border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.5)]" : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10"
                                            )}
                                        >
                                            <ThumbsUp className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => handleFeedback('down')}
                                            className={cn(
                                                "h-12 w-12 rounded-2xl flex items-center justify-center transition-all border",
                                                feedback === 'down' ? "bg-red-500 text-white border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.5)]" : "bg-white/5 text-white/40 border-white/10 hover:bg-white/10"
                                            )}
                                        >
                                            <ThumbsDown className="h-5 w-5" />
                                        </button>
                                    </div>
                                    {feedback && (
                                        <div className="flex items-center gap-2 text-blue-400 animate-pulse">
                                            <Zap className="h-3 w-3 fill-blue-400" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Feedback Encrypted</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Intelligence Sidebar */}
                        <div className="space-y-8">
                            <div className="bg-[#080808]/60 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 space-y-8 shadow-xl">
                                <div className="flex items-center gap-3 text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">
                                    <Globe className="h-4 w-4" />
                                    Data Sources
                                </div>
                                <div className="space-y-4">
                                    {sources.map((source, i) => (
                                        <a
                                            key={i}
                                            href={source.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group block p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-white/10 transition-all"
                                        >
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-[11px] font-black text-blue-400/80 uppercase tracking-tighter">Verified Link</span>
                                                <Link className="h-3 w-3 text-white/20 group-hover:text-white/60 transition-colors" />
                                            </div>
                                            <p className="text-sm font-bold text-white/80 line-clamp-2 leading-tight mb-2 group-hover:text-white transition-colors">
                                                {source.title}
                                            </p>
                                            <span className="text-[10px] text-white/20 truncate block font-mono">
                                                {new URL(source.url).hostname}
                                            </span>
                                        </a>
                                    ))}
                                    {sources.length === 0 && (
                                        <div className="py-8 text-center space-y-2">
                                            <div className="h-10 w-10 bg-white/5 rounded-full mx-auto flex items-center justify-center">
                                                <Layers className="h-4 w-4 text-white/20" />
                                            </div>
                                            <p className="text-[10px] text-white/20 uppercase font-black tracking-widest">Intrinsic Knowledge Only</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-blue-500/20 via-blue-900/10 to-transparent border border-blue-500/20 rounded-[2.5rem] p-8 shadow-xl">
                                <div className="flex items-center gap-2 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                                    <BarChart3 className="h-4 w-4" />
                                    Metric Analysis
                                </div>
                                <p className="text-xs text-white/60 leading-relaxed font-light mb-4">
                                    UAL synthesized this response in <span className="text-white font-bold">1.4ms</span> using cloud-distributed inference clusters.
                                </p>
                                <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                    <div className="bg-blue-500 h-full w-[85%] animate-pulse"></div>
                                </div>
                            </div>
                        </div>

                    </div>
                )}

                {/* Processing State */}
                {isSearching && phase === 'INIT' && (
                    <div className="max-w-3xl mx-auto w-full py-20 flex flex-col items-center gap-6">
                        <div className="relative h-20 w-20">
                            <div className="absolute inset-0 rounded-full border-2 border-blue-500/20"></div>
                            <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
                            <Cpu className="absolute inset-0 m-auto h-8 w-8 text-blue-400 animate-pulse" />
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-400 animate-pulse">Synthesizing Intelligence</p>
                            <p className="text-xs text-white/30 tracking-tight">Allocating compute nodes for request...</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-auto pb-10 text-white/20 text-[10px] uppercase font-black tracking-[0.4em] z-10">
                AGI-S Quantum Core • Session Active
            </div>
        </div>
    );
}
