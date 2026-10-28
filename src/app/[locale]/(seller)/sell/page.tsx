import { useTranslations } from 'next-intl';
import { SellScrapForm } from '@/components/sell/SellScrapForm';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';


export default function SellPage() {
  const t = useTranslations('sell');

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-full border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          100% Free • Verified Dealers Only
        </span>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {t('title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          {t('subtitle')}
        </p>
      </div>

      {/* Main Sell Form Component */}
      <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Loading scrap form...</div>}>
        <SellScrapForm />
      </Suspense>
    </div>
  );
}
