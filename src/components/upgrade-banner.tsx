'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { remoteConfig } from '@/lib/firebase/firebase-config';
import { fetchAndActivate, getBoolean } from 'firebase/remote-config';
import { useSession } from '@/hooks/use-session';

export function UpgradeBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useSession();

  useEffect(() => {
    if (user?.pages?.includes('all')) {
      setIsVisible(false);
      return;
    }

    fetchAndActivate(remoteConfig)
      .then(() => {
        const isBannerVisible = getBoolean(remoteConfig, 'upgrade_banner_visible');
        setIsVisible(isBannerVisible);
      })
      .catch((err) => {
        console.error('Error fetching remote config:', err);
      });
  }, [user]);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="fixed bottom-6 right-6 z-50 group"
        >
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-6 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] transition-all hover:shadow-[0_0_60px_-12px_rgba(255,255,255,0.1)] max-w-[320px]">
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 h-48 w-48 bg-primary/20 blur-[80px] group-hover:bg-primary/30 transition-colors" />

            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all z-10"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>

            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                  <Sparkles size={20} className="text-primary animate-pulse" />
                </div>
                <h3 className="font-semibold text-white tracking-tight">AGI-S Elite</h3>
              </div>

              <div className="space-y-1.5">
                <p className="text-sm font-medium text-white/90">Ascend to Professional Tier</p>
                <p className="text-xs leading-relaxed text-white/50">
                  Unlock autonomous agents, deep research modes, and prioritized ultra-fast inference.
                </p>
              </div>

              <Button
                asChild
                className="w-full bg-white text-black hover:bg-white/90 shadow-[0_10px_20px_-10px_rgba(255,255,255,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] font-bold"
              >
                <Link href="/pro">Upgrade Excellence</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
