'use client';

import { useState } from 'react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Download, X, Smartphone } from 'lucide-react';

export function PWAInstallBanner() {
  const { isInstallable, triggerInstall } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  if (!isInstallable || dismissed) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-4 left-4 right-4 max-w-md mx-auto z-50 bg-slate-900 text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
          <Smartphone className="w-5 h-5 text-white" />
        </div>
        <div>
          <h4 className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
            <span>Install RaddiBhaav</span>
            <span className="text-[10px] bg-emerald-500/30 text-emerald-300 font-extrabold px-1.5 py-0.2 rounded">Fast 4G</span>
          </h4>
          <p className="text-[11px] text-slate-300 line-clamp-1">
            Tap to install directly on your home screen
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={triggerInstall}
          className="min-h-[48px] px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Install</span>
        </button>

        <button
          onClick={() => setDismissed(true)}
          className="min-h-[48px] min-w-[48px] flex items-center justify-center text-slate-400 hover:text-white rounded-xl transition-colors"
          aria-label="Dismiss install prompt"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
