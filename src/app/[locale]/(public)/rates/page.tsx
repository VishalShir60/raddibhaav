import { MandiRatesTicker } from '@/components/rates/MandiRatesTicker';
import { ArrowLeft, Info } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function RatesPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <span className="text-xs text-slate-500 font-medium">
          Updated Daily at 09:00 AM IST
        </span>
      </div>

      <MandiRatesTicker />

      {/* Explanatory notes about Mandi scrap rates */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
          <Info className="w-5 h-5 text-emerald-700" />
          <h3>About RaddiBhaav Daily Scrap Mandi Index</h3>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          The rates shown above represent the prevailing wholesale scrap prices across leading Indian recycling mandis (such as Mumbai Kurla/Dharavi, Delhi Mayapuri, Pune Loni Kalbhor). Actual offers from dealers on RaddiBhaav may vary depending on cleanliness, segregation, and volume.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 text-xs">
            <h4 className="font-bold text-slate-800 mb-1">Tips for Maximum Payout:</h4>
            <ul className="text-slate-600 space-y-1 list-disc list-inside">
              <li>Keep dry paper separate from damp/wet cardboard</li>
              <li>Separate aluminum cans from heavy iron items</li>
              <li>Post clear daylight photos in your scrap listing</li>
            </ul>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 text-xs">
            <h4 className="font-bold text-slate-800 mb-1">Verified Scale Guarantee:</h4>
            <p className="text-slate-600">
              All RaddiBhaav registered dealers must carry calibrated digital scales. Never accept estimates from spring scales without an electronic readout.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
