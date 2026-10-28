'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { INITIAL_CATEGORIES } from '@/lib/data/mock-store';
import { Calculator, ArrowRight, Sparkles, Scale, Info } from 'lucide-react';

export function RaddiCalculator() {
  const t = useTranslations('calculator');
  const locale = useLocale();
  const router = useRouter();

  // State of entered weights per category slug
  const [weights, setWeights] = useState<Record<string, number>>({
    newspaper: 20,
    cardboard: 10,
    iron: 5,
    plastic: 4,
    ewaste: 0,
    brass: 0,
    copper: 0,
  });

  const handleWeightChange = (slug: string, val: number) => {
    setWeights((prev) => ({
      ...prev,
      [slug]: Math.max(0, val),
    }));
  };

  // Calculate estimated earnings range (min and max)
  const calculation = INITIAL_CATEGORIES.reduce(
    (acc, cat) => {
      const weight = weights[cat.slug] || 0;
      acc.minTotal += weight * cat.benchmark_price_min;
      acc.maxTotal += weight * cat.benchmark_price_max;
      acc.totalWeight += weight;
      return acc;
    },
    { minTotal: 0, maxTotal: 0, totalWeight: 0 }
  );

  const handleProceedToSell = () => {
    const activeParams = Object.entries(weights)
      .filter(([, w]) => w > 0)
      .map(([slug, w]) => `${slug}:${w}`)
      .join(',');

    router.push(`/sell?prefill=${encodeURIComponent(activeParams)}`);
  };

  return (
    <div className="rounded-[20px] bg-primary text-white p-6 sm:p-10 relative overflow-hidden border border-primary-hover shadow-xl">
      {/* Background ambient lighting */}
      <div 
        aria-hidden="true" 
        className="absolute -top-32 -right-32 w-80 h-80 bg-accent/15 rounded-full blur-3xl pointer-events-none" 
      />
      <div 
        aria-hidden="true" 
        className="absolute -bottom-32 -left-32 w-80 h-80 bg-primary-hover/40 rounded-full blur-3xl pointer-events-none" 
      />

      <div className="relative z-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-accent text-xs font-bold uppercase tracking-wider">
              <Calculator className="w-3.5 h-3.5" />
              <span>Instant Payout Estimator</span>
            </div>
            <h2 className="type-h2 font-serif text-white">
              {t('title')}
            </h2>
            <p className="text-sm text-stone-300 max-w-xl">
              {t('subtitle')}
            </p>
          </div>

          {/* Real-time Earnings Card */}
          <div className="bg-surface/10 backdrop-blur-md rounded-[18px] p-5 border border-white/15 min-w-[260px] shadow-sm">
            <span className="text-[11px] uppercase font-bold tracking-wider text-stone-300">
              {t('estimatedTotal')}
            </span>
            <div className="text-3xl sm:text-4xl font-black text-accent mt-1 flex items-baseline gap-1 font-sans tabular-nums">
              <span>₹{Math.round(calculation.minTotal)}</span>
              <span className="text-lg text-stone-300 font-normal"> - ₹{Math.round(calculation.maxTotal)}</span>
            </div>
            <p className="text-xs text-stone-300 mt-1 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-accent" />
              <span>Total approx: {calculation.totalWeight.toFixed(1)} kg</span>
            </p>
          </div>
        </div>

        {/* Categories Input Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {INITIAL_CATEGORIES.slice(0, 6).map((cat) => {
            const name = 
              locale === 'hi' ? cat.name_hi : locale === 'mr' ? cat.name_mr : cat.name_en;
            const currentWeight = weights[cat.slug] || 0;

            return (
              <div 
                key={cat.id}
                className="bg-black/20 rounded-[16px] p-4 border border-white/10 hover:border-accent/40 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-white">
                    {name}
                  </span>
                  <span className="text-[11px] font-bold text-accent bg-accent/15 px-2 py-0.5 rounded-md tabular-nums">
                    ₹{cat.benchmark_price_min} - ₹{cat.benchmark_price_max}/{cat.unit}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 mt-3">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={currentWeight === 0 ? '' : currentWeight}
                    placeholder="0"
                    onChange={(e) => handleWeightChange(cat.slug, parseFloat(e.target.value) || 0)}
                    className="w-20 min-h-[44px] bg-black/40 border border-white/20 rounded-[12px] px-3 py-1.5 text-center font-bold text-white text-base tabular-nums focus:outline-hidden focus:border-accent"
                  />
                  <span className="text-xs text-stone-300 font-semibold">kg</span>

                  {/* Quick increment buttons with accessible targets */}
                  <div className="flex items-center gap-1 ml-auto">
                    {[5, 10, 20].map((inc) => (
                      <button
                        key={inc}
                        onClick={() => handleWeightChange(cat.slug, currentWeight + inc)}
                        className="min-h-[40px] px-2.5 py-1 bg-white/10 hover:bg-accent hover:text-slate-950 font-bold text-xs rounded-[10px] text-white transition-all active:scale-95"
                      >
                        +{inc}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Note and Proceed CTA */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-stone-300">
            <Info className="w-4 h-4 shrink-0 text-accent" />
            <span>{t('note')}</span>
          </div>

          <button
            onClick={handleProceedToSell}
            disabled={calculation.totalWeight <= 0}
            className="btn-gold w-full sm:w-auto text-sm font-bold min-h-[48px] px-7 py-3 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-4 h-4" />
            <span>{t('postWithTheseWeights')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
