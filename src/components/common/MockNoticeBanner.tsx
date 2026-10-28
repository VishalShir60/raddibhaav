'use client';

import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export function MockNoticeBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-900 px-4 py-2.5 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <p>
            <span className="font-semibold text-amber-950">Local Interactive Demo Mode:</span>{' '}
            Supabase keys not yet added to <code className="bg-amber-200/60 px-1 py-0.5 rounded font-mono text-xs">.env.local</code>. Running fully interactive with browser client storage, 4G image compression & real-time bid simulation.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-700 hover:text-amber-950 p-1 rounded-md transition-colors"
          title="Dismiss notice"
          aria-label="Dismiss notice"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
