'use client';

import { 
  CheckCircle2, 
  TrendingUp, 
  Sparkles, 
  AlertTriangle, 
  ShieldCheck, 
  Star, 
  Scale, 
  Banknote,
  ArrowRight
} from 'lucide-react';
import { Link } from '@/i18n/routing';

export function SampleOfferComparison() {
  return (
    <section className="w-full space-y-8 py-4">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent-tint border border-accent/30 text-text text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span>Real Household Example • 35kg Scrap Clearance</span>
        </div>
        <h2 className="type-h2 text-text font-serif">
          See How Dealers Compete To Pay You More
        </h2>
        <p className="text-sm text-muted leading-relaxed">
          When multiple verified dealers bid on your scrap, you eliminate arbitrary manual discounting, avoid spring-scale rigging, and take home up to 50% more cash.
        </p>
      </div>

      {/* Comparison Cards Grid: 400 vs 550 vs 600 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch max-w-5xl mx-auto">
        {/* Card 1: Street Hawker (₹400) */}
        <div className="card-premium p-6 sm:p-7 flex flex-col justify-between opacity-85 hover:opacity-100 transition-all">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="text-xs font-bold text-muted uppercase tracking-wider">
                Traditional Channel
              </span>
              <span className="text-[11px] font-bold text-danger bg-danger/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Spring Scale Risk
              </span>
            </div>

            <h3 className="type-h3 font-serif text-text mt-4">
              Street Hawkers
            </h3>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              Unscheduled visits, manual bargaining, arbitrary weight deductions without calibrated proof.
            </p>

            <div className="mt-6 bg-muted-bg/60 rounded-[16px] p-4 border border-border text-center">
              <span className="text-[11px] font-semibold text-muted uppercase block tracking-wider">
                Estimated Net Payout
              </span>
              <div className="text-3xl sm:text-4xl font-bold tabular-nums text-muted mt-1 font-sans line-through opacity-80">
                ₹400
              </div>
              <span className="text-[11px] text-danger font-medium block mt-1">
                ~28kg recorded on faulty scale
              </span>
            </div>

            <ul className="mt-6 space-y-2.5 text-xs text-muted">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-danger mt-1.5 shrink-0" />
                <span>Single buyer monopoly (take it or leave it)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-danger mt-1.5 shrink-0" />
                <span>Frequent rounding down on cash denominations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-danger mt-1.5 shrink-0" />
                <span>Zero accountability or pickup trail</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-border text-[11px] text-muted text-center font-medium">
            Lowest return for your household
          </div>
        </div>

        {/* Card 2: Standard Dealer (₹550) */}
        <div className="card-premium p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="text-xs font-bold text-muted uppercase tracking-wider">
                Standalone Dealer
              </span>
              <span className="text-[11px] font-bold text-text bg-muted-bg px-2.5 py-0.5 rounded-full">
                Fixed Rate
              </span>
            </div>

            <h3 className="type-h3 font-serif text-text mt-4">
              Local Scrap Shop
            </h3>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              Standard walk-in shop with standard electronic scale. Requires self-transport or heavy hauling.
            </p>

            <div className="mt-6 bg-muted-bg/60 rounded-[16px] p-4 border border-border text-center">
              <span className="text-[11px] font-semibold text-muted uppercase block tracking-wider">
                Estimated Net Payout
              </span>
              <div className="text-3xl sm:text-4xl font-bold tabular-nums text-text mt-1 font-sans">
                ₹550
              </div>
              <span className="text-[11px] text-muted font-medium block mt-1">
                Baseline market rates
              </span>
            </div>

            <ul className="mt-6 space-y-2.5 text-xs text-muted">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span>Basic electronic scale measurement</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span>Fixed price with zero competitive bidding</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <span>Self-carry or delayed unscheduled pickup</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-border text-[11px] text-muted text-center font-medium">
            Standard baseline rates
          </div>
        </div>

        {/* Card 3: RaddiBhaav Bidding (₹600 - BEST OFFER) */}
        <div className="card-premium p-6 sm:p-7 flex flex-col justify-between border-2 border-accent relative shadow-[0_8px_32px_-4px_rgba(201,162,39,0.22)]">
          {/* Best Offer Ribbon */}
          <div className="absolute -top-3.5 right-6 bg-accent text-slate-950 font-black text-xs uppercase tracking-wider px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            <span>Best Value • RaddiBhaav</span>
          </div>

          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                Bidding Winner
              </span>
              <span className="text-[11px] font-bold text-primary dark:text-accent bg-primary-tint px-2.5 py-0.5 rounded-full">
                Top Dealer Bid
              </span>
            </div>

            <h3 className="type-h3 font-serif text-text mt-4 flex items-center gap-2">
              <span>RaddiBhaav Engine</span>
              <ShieldCheck className="w-4 h-4 text-primary dark:text-accent shrink-0" />
            </h3>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              3 to 5 nearby verified recyclers compete for your lot in a transparent 2-hour reverse-auction.
            </p>

            <div className="mt-6 bg-primary-tint/60 rounded-[16px] p-4 border border-primary/20 text-center">
              <span className="text-[11px] font-bold text-primary dark:text-accent uppercase block tracking-wider">
                Guaranteed Doorstep Payout
              </span>
              <div className="text-3xl sm:text-4xl font-black tabular-nums text-accent mt-1 font-sans">
                ₹600
              </div>
              <span className="text-[11px] text-emerald-800 dark:text-emerald-400 font-bold block mt-1">
                +₹200 (+50%) extra profit
              </span>
            </div>

            <ul className="mt-6 space-y-2.5 text-xs text-text font-medium">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary dark:text-accent mt-0.5 shrink-0" />
                <span>Certified doorstep digital weighing scale</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary dark:text-accent mt-0.5 shrink-0" />
                <span>Formula payout based on verified final kg</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary dark:text-accent mt-0.5 shrink-0" />
                <span>Instant Cash or UPI before dealer leaves</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-border">
            <Link
              href="/sell"
              className="btn-primary w-full text-xs font-bold py-2.5"
            >
              <span>Get Offers For Your Scrap</span>
              <ArrowRight className="w-4 h-4 text-accent" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
