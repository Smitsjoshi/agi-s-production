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
    if (user?.pages.includes('all')) {
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
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <div className="p-4 rounded-lg shadow-2xl bg-gradient-to-r from-primary to-chart-4 text-primary-foreground max-w-sm">
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1 rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-colors"
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
            <div className="flex items-center gap-4">
              <Sparkles size={40} className="flex-shrink-0 animate-pulse" />
              <div>
                <h3 className="font-bold font-headline">Unlock the Full Power of AGI-S</h3>
                <p className="text-sm opacity-90 mt-1">Access Crucible simulations, unlimited video generation, and collaborative workspaces.</p>
                <Button asChild variant="secondary" size="sm" className="mt-3 bg-white text-primary hover:bg-white/90">
                  <Link href="/pro">Upgrade Now</Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
