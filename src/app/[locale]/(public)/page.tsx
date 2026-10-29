'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { MandiRatesTicker } from '@/components/rates/MandiRatesTicker';
import { RaddiCalculator } from '@/components/calculator/RaddiCalculator';
import { SampleOfferComparison } from '@/components/home/SampleOfferComparison';
import { HeroPhoneMockup } from '@/components/home/HeroPhoneMockup';
import { FAQSection } from '@/components/home/FAQSection';
import { PWAInstallBanner } from '@/components/common/PWAInstallBanner';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Banknote, 
  Scale, 
  CheckCircle2, 
  Recycle,
  Award,
  Store,
  Camera,
  Layers,
  Star,
  Quote
} from 'lucide-react';

export default function HomePage() {
  const t = useTranslations('hero');
  const tHow = useTranslations('howItWorks');

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* PWA Mobile Install Banner */}
      <PWAInstallBanner />

      {/* 1. HERO SECTION ("Kabadi ka sahi bhaav") */}
      <section className="relative pt-4 sm:pt-10 pb-6 overflow-hidden">
        {/* Subtle decorative gradient glow */}
        <div 
          aria-hidden="true" 
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-b from-primary/10 via-accent/10 to-transparent blur-3xl pointer-events-none -z-10" 
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Hero Left Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-6 text-center lg:text-left"
          >
            {/* Tagline Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-tint text-primary dark:text-accent border border-primary/20 text-xs font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" />
              <span>Kabadi ka Sahi Bhaav • Hyperlocal Scrap Bidding</span>
            </div>

            {/* Main Serif Headline */}
            <h1 className="type-display font-serif text-text tracking-tight leading-[1.08]">
              Kabadi ka <span className="text-primary dark:text-accent italic font-serif">sahi bhaav.</span>
            </h1>

            {/* Subtitle */}
            <p className="type-body text-muted max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              {t('description') || 'Upload scrap photos and approximate weight. Nearby background-checked kabadiwalas place competing bids. Pick the highest offer and get paid directly via Cash or instant UPI.'}
            </p>

            {/* Action CTAs - 48px touch targets, 14px radius */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link
                href="/sell"
                className="btn-primary w-full sm:w-auto text-base px-8 py-3.5 min-h-[50px] rounded-[14px]"
              >
                <Recycle className="w-5 h-5 text-accent" />
                <span>Sell your scrap</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/dealer"
                className="btn-outline w-full sm:w-auto text-base px-7 py-3.5 min-h-[50px] rounded-[14px]"
              >
                <Store className="w-5 h-5 text-primary dark:text-accent" />
                <span>Join as dealer</span>
              </Link>
            </div>

            {/* Micro rating / trust proof */}
            <div className="pt-2 flex items-center justify-center lg:justify-start gap-4 text-xs text-muted">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                ))}
              </div>
              <span className="font-semibold text-text">4.9/5 Rating</span>
              <span>•</span>
              <span>10,000+ Completed Pickups</span>
            </div>
          </motion.div>

          {/* Hero Right: Floating Phone Mockup */}
          <div className="lg:col-span-5 flex justify-center">
            <HeroPhoneMockup />
          </div>
        </div>
      </section>

      {/* 2. TRUST STRIP (4 Pillars) */}
      <section className="card-premium p-6 sm:p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-border">
          <div className="flex items-center gap-3.5 pt-3 sm:pt-0">
            <div className="w-11 h-11 rounded-[12px] bg-primary-tint text-primary dark:text-accent flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-text text-sm">Verified Dealers</h4>
              <p className="text-xs text-muted">Aadhaar & Shop KYC</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 pt-3 sm:pt-0 sm:pl-6 lg:pl-8">
            <div className="w-11 h-11 rounded-[12px] bg-accent-tint text-accent flex items-center justify-center shrink-0">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-text text-sm">Doorstep Digital Scale</h4>
              <p className="text-xs text-muted">Certified Electronic Scale</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 pt-3 sm:pt-0 sm:pl-6 lg:pl-8">
            <div className="w-11 h-11 rounded-[12px] bg-primary-tint text-primary dark:text-accent flex items-center justify-center shrink-0">
              <Banknote className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-text text-sm">Pay On Final Weight</h4>
              <p className="text-xs text-muted">Instant Cash or UPI</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 pt-3 sm:pt-0 sm:pl-6 lg:pl-8">
            <div className="w-11 h-11 rounded-[12px] bg-accent-tint text-accent flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-text text-sm">100% Free For Sellers</h4>
              <p className="text-xs text-muted">₹0 Commission Deductions</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS IN 3 NUMBERED STEPS */}
      <section className="card-premium p-6 sm:p-10 lg:p-12 space-y-10">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold text-primary dark:text-accent uppercase tracking-wider">
            Simple, Transparent & Fast
          </span>
          <h2 className="type-h2 font-serif text-text">
            {tHow('title') || 'How RaddiBhaav Works'}
          </h2>
          <p className="text-sm text-muted">
            {tHow('subtitle') || 'Sell all your household scrap in three effortless steps without phone calls or haggling.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Step 1 */}
          <div className="bg-muted-bg/50 rounded-[20px] p-7 border border-border space-y-4 hover:border-primary/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-[12px] bg-primary text-white flex items-center justify-center font-bold text-lg font-serif">
                1
              </span>
              <Camera className="w-5 h-5 text-muted" />
            </div>
            <h3 className="type-h3 font-serif text-text">
              {tHow('step1Title') || 'Post Scrap & Photo'}
            </h3>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              {tHow('step1Desc') || 'Select items (raddi, cardboard, iron, e-waste), enter estimated weights, and snap a quick photo for dealer inspection.'}
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-muted-bg/50 rounded-[20px] p-7 border border-border space-y-4 hover:border-primary/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-[12px] bg-accent text-slate-950 flex items-center justify-center font-bold text-lg font-serif">
                2
              </span>
              <Layers className="w-5 h-5 text-muted" />
            </div>
            <h3 className="type-h3 font-serif text-text">
              {tHow('step2Title') || 'Dealers Bid Live'}
            </h3>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              {tHow('step2Desc') || 'Approved neighborhood dealers receive notifications and submit competitive itemized offers within a 2-hour window.'}
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-muted-bg/50 rounded-[20px] p-7 border border-border space-y-4 hover:border-primary/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="w-10 h-10 rounded-[12px] bg-primary text-white flex items-center justify-center font-bold text-lg font-serif">
                3
              </span>
              <Banknote className="w-5 h-5 text-muted" />
            </div>
            <h3 className="type-h3 font-serif text-text">
              {tHow('step3Title') || 'Weigh-in & Instant Pay'}
            </h3>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              {tHow('step3Desc') || 'Dealer arrives with a certified digital scale, weighs in your presence, and transfers cash or UPI instantly.'}
            </p>
          </div>
        </div>
      </section>

      {/* 4. REAL HOUSEHOLD EXAMPLE (₹400 vs ₹550 vs ₹600) */}
      <SampleOfferComparison />

      {/* 5. MANDI SCRAP RATES TICKER (Rate Card Preview) */}
      <MandiRatesTicker />

      {/* 6. INSTANT RADDI CALCULATOR */}
      <RaddiCalculator />

      {/* 7. TESTIMONIALS PLACEHOLDER */}
      <section className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold text-primary dark:text-accent uppercase tracking-wider">
            Verified Experiences
          </span>
          <h2 className="type-h2 font-serif text-text">
            Loved by Societies & Households
          </h2>
          <p className="text-sm text-muted">
            See how urban households and housing societies get 30% to 50% more value for their recyclable scrap.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-premium p-6 sm:p-7 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <Quote className="w-8 h-8 text-accent/40" />
              <p className="text-xs sm:text-sm text-text leading-relaxed font-medium">
                &ldquo;Earlier, the local hawker offered ₹350 for old newspapers and books. On RaddiBhaav, two dealers bid and the final payout was ₹580. The digital scale made all the difference.&rdquo;
              </p>
            </div>
            <div className="pt-4 border-t border-border flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary-tint text-primary font-bold flex items-center justify-center text-xs">
                AK
              </div>
              <div>
                <h5 className="font-bold text-xs text-text">Ananya Kulkarni</h5>
                <p className="text-[11px] text-muted">College Road, Nashik</p>
              </div>
            </div>
          </div>

          <div className="card-premium p-6 sm:p-7 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <Quote className="w-8 h-8 text-accent/40" />
              <p className="text-xs sm:text-sm text-text leading-relaxed font-medium">
                &ldquo;Our apartment society did a quarterly raddi clearance. The winning dealer arrived within 45 minutes of bid acceptance and paid ₹4,200 directly via UPI. Completely hassle-free.&rdquo;
              </p>
            </div>
            <div className="pt-4 border-t border-border flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-accent-tint text-accent font-bold flex items-center justify-center text-xs">
                RS
              </div>
              <div>
                <h5 className="font-bold text-xs text-text">Rajesh Sharma</h5>
                <p className="text-[11px] text-muted">Shivneri CHS, Dadar West</p>
              </div>
            </div>
          </div>

          <div className="card-premium p-6 sm:p-7 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <Quote className="w-8 h-8 text-accent/40" />
              <p className="text-xs sm:text-sm text-text leading-relaxed font-medium">
                &ldquo;As a registered scrap dealer, RaddiBhaav gives me 15+ verified household requests every weekend. Zero wasted travel and genuine customer ratings help me grow my business.&rdquo;
              </p>
            </div>
            <div className="pt-4 border-t border-border flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary-tint text-primary font-bold flex items-center justify-center text-xs">
                BG
              </div>
              <div>
                <h5 className="font-bold text-xs text-text">Baban Gaikwad</h5>
                <p className="text-[11px] text-muted">Gaikwad Scrap Traders, Pune</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. DEALER PARTNER ONBOARDING BANNER (Dark Green #0F3D2E Background) */}
      <section className="bg-primary text-white rounded-[24px] p-8 sm:p-12 shadow-xl border border-primary-hover relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div 
          aria-hidden="true" 
          className="absolute -top-24 -right-24 w-80 h-80 bg-accent/15 rounded-full blur-3xl pointer-events-none" 
        />
        
        <div className="space-y-3 max-w-xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-accent text-xs font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" />
            <span>Verified Dealer Partner Program</span>
          </div>
          <h3 className="type-h2 font-serif text-white">
            Expand Your Daily Scrap Volume by 3x
          </h3>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            Get direct access to verified household scrap pickups in your neighborhood. <strong>100% Platform Commission Waived (₹0 fee)</strong> during our promotional launch. Bring your digital scale, submit bids, and grow your revenue.
          </p>
        </div>

        <Link
          href="/dealer"
          className="btn-gold min-h-[50px] text-sm px-8 py-3.5 shrink-0 relative z-10"
        >
          <span>Join as Verified Dealer</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* 9. FREQUENTLY ASKED QUESTIONS */}
      <FAQSection />
    </div>
  );
}
