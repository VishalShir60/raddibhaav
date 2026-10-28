'use client';

import { useEffect } from 'react';
import { captureException } from '@/lib/monitoring/sentry';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureException(error, { extra: { digest: error.digest } });
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FAF8F3] text-[#14201B] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[20px] p-8 border border-[#E8E4DA] shadow-xl text-center space-y-5">
          <div className="w-14 h-14 bg-[#D64545]/10 text-[#D64545] rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            !
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#0F3D2E]">
            Something went wrong
          </h2>
          <p className="text-sm text-[#5B6B64]">
            An unexpected error occurred. Our engineering team has been automatically alerted via error monitoring.
          </p>
          {error.digest && (
            <p className="text-xs font-mono bg-[#FAF8F3] p-2 rounded text-stone-500">
              Error Ref: {error.digest}
            </p>
          )}
          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={() => reset()}
              className="px-5 py-2.5 bg-[#0F3D2E] text-white rounded-[14px] font-semibold text-sm hover:bg-[#145A43] transition-colors"
            >
              Try again
            </button>
            <a
              href="/"
              className="px-5 py-2.5 border border-[#E8E4DA] rounded-[14px] font-semibold text-sm hover:bg-[#FAF8F3] transition-colors"
            >
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
