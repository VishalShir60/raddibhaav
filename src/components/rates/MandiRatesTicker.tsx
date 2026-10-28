'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { INITIAL_CATEGORIES } from '@/lib/data/mock-store';
import { 
  Newspaper, 
  Package, 
  Hammer, 
  Trash2, 
  Sparkles, 
  Zap, 
  Cpu, 
  Refrigerator,
  TrendingUp,
  Minus,
  ArrowRight
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  newspaper: <Newspaper className="w-5 h-5 text-amber-600" />,
  package: <Package className="w-5 h-5 text-amber-700" />,
  hammer: <Hammer className="w-5 h-5 text-muted" />,
  'trash-2': <Trash2 className="w-5 h-5 text-primary dark:text-accent" />,
  sparkles: <Sparkles className="w-5 h-5 text-accent" />,
  zap: <Zap className="w-5 h-5 text-amber-500" />,
  cpu: <Cpu className="w-5 h-5 text-indigo-500" />,
  refrigerator: <Refrigerator className="w-5 h-5 text-teal-600" />,
};

export function MandiRatesTicker() {
  const t = useTranslations('rates');
  const locale = useLocale();
  const [selectedCity, setSelectedCity] = useState('Mumbai');

  return (
    <section className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-tint text-primary dark:text-accent text-xs font-bold uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-primary dark:bg-accent animate-ping" />
            <span>Live Mandi Benchmark Rates</span>
          </div>
          <h2 className="type-h2 font-serif text-text">
            {t('title')}
          </h2>
          <p className="text-sm text-muted mt-1">
            {t('subtitle')}
          </p>
        </div>

        {/* City Filter Pills */}
        <div className="flex items-center gap-1 bg-muted-bg p-1 rounded-[14px] self-start sm:self-auto border border-border text-xs font-semibold">
          {['Mumbai', 'Pune', 'Nashik', 'Delhi NCR'].map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`min-h-[44px] px-3.5 py-1.5 rounded-[10px] transition-all flex items-center justify-center ${
                selectedCity === city
                  ? 'bg-surface text-primary dark:text-accent shadow-xs font-bold'
                  : 'text-muted hover:text-text'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Scrap Category Rates */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {INITIAL_CATEGORIES.map((cat) => {
          const name = 
            locale === 'hi' ? cat.name_hi : locale === 'mr' ? cat.name_mr : cat.name_en;

          return (
            <div
              key={cat.id}
              className="card-premium p-4 sm:p-5 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="w-10 h-10 rounded-[12px] bg-muted-bg border border-border flex items-center justify-center group-hover:scale-105 transition-transform">
                    {ICON_MAP[cat.icon] || <Package className="w-5 h-5 text-muted" />}
                  </div>
                  {cat.trend === 'up' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <TrendingUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      {t('trendUp')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted bg-muted-bg px-2 py-0.5 rounded-full border border-border">
                      <Minus className="w-3 h-3" />
                      {t('trendStable')}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-text text-sm sm:text-base leading-snug line-clamp-1">
                  {name}
                </h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-xl sm:text-2xl font-bold tabular-nums text-text font-sans">
                    ₹{cat.benchmark_price_min} - ₹{cat.benchmark_price_max}
                  </span>
                  <span className="text-xs text-muted font-medium">
                    /{cat.unit}
                  </span>
                </div>
              </div>

              <Link
                href={`/sell?category=${cat.slug}`}
                className="mt-4 flex items-center justify-between text-xs font-semibold text-primary dark:text-accent group-hover:underline pt-3 border-t border-border"
              >
                <span>Request Bids</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
