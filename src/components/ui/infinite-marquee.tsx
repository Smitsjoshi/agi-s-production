'use client';

import { motion } from 'framer-motion';

export const InfiniteMarquee = ({ items, speed = 30, pauseOnHover = false }: { items: React.ReactNode[], speed?: number, pauseOnHover?: boolean }) => {
    return (
        <div className="relative flex overflow-hidden group w-full mask-gradient select-none">
            {/* Gradient Masks */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black via-black/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black via-black/80 to-transparent z-10 pointer-events-none" />

            <motion.div
                className="flex min-w-full shrink-0 gap-16 items-center justify-around whitespace-nowrap py-4"
                animate={{ x: [0, "-100%"] }}
                transition={{
                    repeat: Infinity,
                    duration: speed,
                    ease: "linear",
                    repeatType: "loop"
                }}
                style={{ x: 0 }}
            >
                {items.map((item, i) => (
                    <div key={`loop1-${i}`} className={`flex-shrink-0 mx-4 ${pauseOnHover ? 'hover:pause-animation' : ''}`}>{item}</div>
                ))}
            </motion.div>

            {/* Duplicate for seamless loop */}
            <motion.div
                className="flex min-w-full shrink-0 gap-16 items-center justify-around whitespace-nowrap py-4 absolute top-0 left-full"
                animate={{ x: [0, "-100%"] }}
                transition={{
                    repeat: Infinity,
                    duration: speed,
                    ease: "linear",
                    repeatType: "loop"
                }}
            >
                {items.map((item, i) => (
                    <div key={`loop2-${i}`} className={`flex-shrink-0 mx-4 ${pauseOnHover ? 'hover:pause-animation' : ''}`}>{item}</div>
                ))}
            </motion.div>
        </div>
    );
};
