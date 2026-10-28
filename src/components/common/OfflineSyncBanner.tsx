'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, CheckCircle, Download } from 'lucide-react';
import { useOfflineSync } from '@/lib/offline/sync-queue';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function OfflineSyncBanner() {
  const { isOnline, queuedCount, isSyncing, lastSyncResult, triggerSync } = useOfflineSync();
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Register service worker on mount
    if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'development') {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('SW registration warning:', err);
      });
    }

    // Capture PWA install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setInstalled(true);
    }
    setInstallPrompt(null);
  };

  return (
    <div className="w-full">
      {/* 1. Offline Connectivity Warning Banner */}
      {!isOnline && (
        <div className="bg-amber-600 text-white px-4 py-2.5 shadow-md flex items-center justify-between gap-3 text-xs sm:text-sm font-bold">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-full bg-amber-700/80 shrink-0">
              <WifiOff className="w-4 h-4 text-white" />
            </span>
            <span>
              <strong>Offline Mode (Patchy Data)</strong>
              <span className="hidden sm:inline"> • ऑफ़लाइन मोड / नेटवर्क बंद आहे</span>
              {queuedCount > 0 && (
                <span className="ml-2 bg-amber-800 text-amber-100 px-2 py-0.5 rounded-full text-xs font-black">
                  {queuedCount} queued to sync
                </span>
              )}
            </span>
          </div>

          <button
            type="button"
            onClick={triggerSync}
            disabled={isSyncing}
            aria-label="Retry offline sync"
            className="inline-flex items-center gap-1.5 bg-white text-amber-900 hover:bg-amber-50 px-3.5 py-2 rounded-xl text-xs font-black shrink-0 transition-all active:scale-95 min-h-[44px]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Retry'}</span>
          </button>
        </div>
      )}

      {/* 2. Reconnection Sync Toast Notice */}
      {lastSyncResult && isOnline && (
        <div className="bg-emerald-700 text-white px-4 py-2 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-200" />
          <span>{lastSyncResult}</span>
        </div>
      )}

      {/* 3. Installable PWA Banner (Shown if browser supports installation) */}
      {installPrompt && !installed && (
        <div className="bg-slate-900 text-slate-100 px-4 py-2.5 text-xs flex items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0 font-black text-[10px]">
              RB
            </div>
            <span>Install RaddiBhaav app for fast offline access &amp; instant notifications</span>
          </div>

          <button
            type="button"
            onClick={handleInstallClick}
            aria-label="Install RaddiBhaav App"
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 min-h-[44px]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install App</span>
          </button>
        </div>
      )}
    </div>
  );
}
