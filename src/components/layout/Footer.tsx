'use client';

import { Link } from '@/i18n/routing';
import { 
  Recycle,
  ShieldCheck, 
  Banknote, 
  Scale,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-surface dark:bg-[#06120D] text-text border-t border-border mt-auto transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* 3 Pillars Trust Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 border-b border-border">
          <div className="card-premium p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-[14px] bg-primary-tint text-primary dark:text-accent flex items-center justify-center shrink-0">
              <Banknote className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-text text-sm sm:text-base">Direct Hand-to-Hand Payment</h4>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Dealer pays you directly via UPI or Cash on doorstep weigh-in. Zero platform deductions from households.
              </p>
            </div>
          </div>

          <div className="card-premium p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-[14px] bg-accent-tint text-accent flex items-center justify-center shrink-0">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-text text-sm sm:text-base">Doorstep Digital Weighing</h4>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Dealers bring certified electronic digital scales. Payout is calculated per-kg from actual measured weight.
              </p>
            </div>
          </div>

          <div className="card-premium p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-[14px] bg-primary-tint text-primary dark:text-accent flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-text text-sm sm:text-base">100% KYC Verified Dealers</h4>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Every dealer partner is background-checked with physical shop address verification and verified ratings.
              </p>
            </div>
          </div>
        </div>

        {/* Links Navigation Matrix */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-b border-border">
          {/* Brand Col */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[14px] bg-primary text-white flex items-center justify-center shadow-xs">
                <Recycle className="w-5 h-5 text-accent" />
              </div>
              <span className="font-serif font-bold text-2xl tracking-tight text-text">
                Raddi<span className="text-primary dark:text-accent font-sans">Bhaav</span>
              </span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              India&apos;s refined circular-economy marketplace. Transforming household scrap selling through competitive dealer bidding and certified doorstep precision.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-tint border border-accent/30 text-[11px] font-bold text-text">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>Clean India • Fair Prices</span>
            </div>
          </div>

          {/* Marketplace Links */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-muted">Marketplace</h5>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link href="/sell" className="text-text hover:text-primary dark:hover:text-accent transition-colors flex items-center gap-1">
                  <span>Sell Your Scrap</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60" />
                </Link>
              </li>
              <li>
                <Link href="/rates" className="text-text hover:text-primary dark:hover:text-accent transition-colors">
                  Live Mandi Scrap Rates
                </Link>
              </li>
              <li>
                <Link href="/calculator" className="text-text hover:text-primary dark:hover:text-accent transition-colors">
                  Scrap Value Calculator
                </Link>
              </li>
              <li>
                <Link href="/bids" className="text-text hover:text-primary dark:hover:text-accent transition-colors">
                  Track Live Bids
                </Link>
              </li>
            </ul>
          </div>

          {/* Dealer Partners */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-muted">Dealer Partners</h5>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link href="/dealer" className="text-text hover:text-primary dark:hover:text-accent transition-colors flex items-center gap-1">
                  <span>Dealer Portal</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60" />
                </Link>
              </li>
              <li>
                <Link href="/onboarding" className="text-text hover:text-primary dark:hover:text-accent transition-colors">
                  Join As Verified Dealer
                </Link>
              </li>
              <li>
                <Link href="/dealer-agreement" className="text-text hover:text-primary dark:hover:text-accent transition-colors">
                  Dealer Code of Conduct
                </Link>
              </li>
              <li>
                <Link href="/rates" className="text-text hover:text-primary dark:hover:text-accent transition-colors">
                  Benchmark Floor Rates
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-muted">Trust & Legal</h5>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <Link href="/terms" className="text-text hover:text-primary dark:hover:text-accent transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-text hover:text-primary dark:hover:text-accent transition-colors">
                  Privacy Policy & DPDP
                </Link>
              </li>
              <li>
                <Link href="/terms#disputes" className="text-text hover:text-primary dark:hover:text-accent transition-colors">
                  Anti-Lowball Policy
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-text hover:text-primary dark:hover:text-accent transition-colors">
                  Account Safety & KYC
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Attribution */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <p>© {new Date().getFullYear()} RaddiBhaav Technologies Pvt Ltd. All rights reserved.</p>
          <p className="text-[11px] text-muted">
            Designed for households and kabadiwalas across Mumbai, Pune, Nashik and beyond.
          </p>
        </div>
      </div>
    </footer>
  );
}
