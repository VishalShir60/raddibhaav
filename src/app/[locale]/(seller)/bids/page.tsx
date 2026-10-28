import { useTranslations } from 'next-intl';
import { LiveBiddingView } from '@/components/bids/LiveBiddingView';
import { Radio, PlusCircle } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';


export default function BidsPage() {
  const t = useTranslations('bids');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-amber-500 animate-pulse" />
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {t('title')}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Realtime competing dealer bids. Pick the best offer for your scrap.
          </p>
        </div>

        <Link
          href="/sell"
          className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Scrap</span>
        </Link>
      </div>

      <Suspense fallback={<div className="py-12 text-center text-sm text-slate-500">Loading Bidding Dashboard...</div>}>
        <LiveBiddingView />
      </Suspense>
    </div>
  );
}
