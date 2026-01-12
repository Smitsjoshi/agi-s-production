'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function FuturisticBackground() {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none">
            {/* Base Gradient */}
            <div className="absolute inset-0 bg-[#030303]" />

            {/* Animated Mesh Gradients */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    x: [-20, 20, -20],
                    y: [-20, 20, -20],
                    rotate: [0, 90, 0],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                }}
                className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-primary/20 blur-[120px] rounded-full opacity-30"
            />

            <motion.div
                animate={{
                    scale: [1.2, 1, 1.2],
                    x: [20, -20, 20],
                    y: [20, -20, 20],
                    rotate: [0, -90, 0],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "linear"
                }}
                className="absolute -bottom-[20%] -right-[10%] w-[70%] h-[70%] bg-blue-500/10 blur-[120px] rounded-full opacity-20"
            />

            {/* Subtle Grid Overlay */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] contrast-150 brightness-150" />

            {/* Horizontal scanline effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.01] to-transparent bg-[length:100%_4px] opacity-20" />
        </div>
    );
}
