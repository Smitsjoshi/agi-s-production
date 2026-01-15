'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGhostProtocol } from '@/hooks/use-ghost-protocol';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Globe, Command, Zap, Search, MousePointer, Type, Eye } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export default function BrowserPage() {
    const { isConnected } = useGhostProtocol();
    const [url, setUrl] = useState('');
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => setLogs(prev => [msg, ...prev]);

    // UAL 2.0 Command Dispatcher
    const dispatchCommand = (action: string, selector?: string, value?: string) => {
        if (!isConnected) {
            toast({ title: "UAL Offline", description: "Browser Daemon is not connected.", variant: "destructive" });
            return;
        }

        // Since we can't directly message the extension from a web page due to security,
        // We use the window event bridge we set up in content.js? 
        // Wait, content.js listens to chrome.runtime messages.
        // The Web App needs to send a message to the Extension ID.
        // We need the ID.
        const EXTENSION_ID = "baialnnocbgeedpbmhdfljmfofcopeic"; // User provided this ID in screenshot

        if (window.chrome && window.chrome.runtime) {
            window.chrome.runtime.sendMessage(EXTENSION_ID, {
                type: "EXECUTE",
                action,
                selector,
                value
            }, (response) => {
                addLog(`[${action}] Response: ${JSON.stringify(response)}`);
            });
            addLog(`[${action}] Sent to Daemon...`);
        } else {
            // Fallback for when we strictly use the window event bridge (if we implemented that)
            // For now, let's assume standard chrome messaging works if externally_connectable is set.
            addLog("[ERROR] Chrome Runtime not found.");
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] p-8 max-w-6xl mx-auto">

            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Globe className="h-8 w-8 text-cyan-400" />
                        Neural Browser
                    </h1>
                    <p className="text-gray-400 mt-2">Direct Interface to UAL 2.0 Ghost Protocol.</p>
                </div>
                <div className={`px-4 py-2 rounded-full border ${isConnected ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-red-500/10 border-red-500/50 text-red-400'}`}>
                    {isConnected ? "DAEMON LINKED" : "DAEMON OFFLINE"}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">

                {/* Control Panel */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Navigation Simulator */}
                    <div className="p-6 rounded-2xl bg-zinc-900 border border-white/10">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Command className="h-5 w-5" /> Navigation</h3>
                        <div className="flex gap-4">
                            <Input
                                placeholder="https://example.com"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="bg-black/50 border-white/10"
                            />
                            <Button onClick={() => window.open(url, '_blank')} variant="outline">Open Tab</Button>
                        </div>
                    </div>

                    {/* Manual Action Triggers (For Testing) */}
                    <div className="p-6 rounded-2xl bg-zinc-900 border border-white/10">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Zap className="h-5 w-5 text-yellow-400" /> Manual Overrides</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs text-gray-500 uppercase">Click Element</label>
                                <div className="flex gap-2">
                                    <Input id="click-sel" placeholder="Selector (e.g. #btn)" className="bg-black/50" />
                                    <Button size="icon" onClick={() => dispatchCommand('CLICK', (document.getElementById('click-sel') as HTMLInputElement).value)}><MousePointer className="h-4 w-4" /></Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs text-gray-500 uppercase">Type Text</label>
                                <div className="flex gap-2">
                                    <Input id="type-sel" placeholder="Selector" className="w-1/3 bg-black/50" />
                                    <Input id="type-val" placeholder="Value" className="bg-black/50" />
                                    <Button size="icon" onClick={() => dispatchCommand('TYPE', (document.getElementById('type-sel') as HTMLInputElement).value, (document.getElementById('type-val') as HTMLInputElement).value)}><Type className="h-4 w-4" /></Button>
                                </div>
                            </div>

                            <div className="space-y-2 col-span-2">
                                <label className="text-xs text-gray-500 uppercase">Screen Reader</label>
                                <Button className="w-full bg-zinc-800 hover:bg-zinc-700" onClick={() => dispatchCommand('READ')}>
                                    <Eye className="h-4 w-4 mr-2" /> Extract Page Content
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* AI Command Center (Future) */}
                    <div className="p-6 rounded-2xl bg-zinc-900 border border-white/10 opacity-50 relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10 backdrop-blur-[1px]">
                            <div className="px-4 py-2 bg-zinc-800 rounded-full text-xs font-mono border border-white/10">COMING IN PHASE 4</div>
                        </div>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Search className="h-5 w-5 text-purple-400" /> Autonomous Agent</h3>
                        <div className="flex gap-4">
                            <Input placeholder="e.g. 'Log in to LinkedIn and search for AI Engineers'" disabled />
                            <Button disabled>Execute</Button>
                        </div>
                    </div>

                </div>

                {/* Neural Logs */}
                <div className="lg:col-span-1 rounded-2xl bg-black border border-white/10 p-4 flex flex-col h-full overflow-hidden">
                    <h3 className="text-sm font-mono text-gray-500 uppercase tracking-widest mb-4">Daemon Telemetry</h3>
                    <div className="flex-1 overflow-y-auto space-y-2 font-mono text-xs">
                        {logs.length === 0 && <div className="text-zinc-700 italic">Listening for UAL signals...</div>}
                        {logs.map((log, i) => (
                            <div key={i} className="flex gap-2">
                                <span className="text-emerald-500">[{new Date().toLocaleTimeString()}]</span>
                                <span className="text-gray-300">{log}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
