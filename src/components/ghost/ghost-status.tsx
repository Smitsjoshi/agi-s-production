'use client';

import { useGhostProtocol } from '@/hooks/use-ghost-protocol';
import { Wifi, WifiOff } from 'lucide-react';
import { motion } from 'framer-motion';

export function GhostStatus() {
    const { isConnected } = useGhostProtocol();

    return (
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-zinc-900 border border-white/5">
            <div className="relative flex h-2 w-2">
                {isConnected && (
                    <motion.span
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
                    />
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
            </div>

            <span className={`text-[10px] font-mono tracking-widest uppercase ${isConnected ? 'text-emerald-500' : 'text-zinc-500'}`}>
                {isConnected ? 'DAEMON LINKED' : 'DAEMON OFFLINE'}
            </span>
        </div>
    );
}
