import type { Metadata } from 'next';
import { Link } from '@/i18n/routing';
import { SITE_CONFIG } from '@/lib/site-config';
import { LinkedInIcon, GitHubIcon } from '@/components/common/SocialIcons';
import { 
  Recycle, 
  ShieldCheck, 
  Scale, 
  Banknote, 
  Sparkles, 
  MapPin, 
  ArrowRight, 
  TrendingUp, 
  HeartHandshake,
  CheckCircle2,
  ExternalLink,
  UserCheck
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us | RaddiBhaav - Built by Vishal Shirsath',
  description: 'Learn about RaddiBhaav, India\'s hyperlocal scrap bidding marketplace founded by Vishal Shirsath. Empowering households and local kabadiwalas with fair pricing, verified digital weighing, and mutual dignity.',
};

export default function AboutPage() {
  return (
    <div className="space-y-16 sm:space-y-24 py-4 sm:py-8">
      {/* 1. HERO SECTION */}
      <section className="relative text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-tint text-primary dark:text-accent border border-primary/20 text-xs font-bold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" />
          <span>About RaddiBhaav • Fair Scrap Marketplace</span>
        </div>

        <h1 className="type-display font-serif text-text tracking-tight leading-[1.12]">
          Reinventing India&apos;s recycling economy with{' '}
          <span className="text-primary dark:text-accent italic font-serif">dignity & fair pricing.</span>
        </h1>

        <p className="type-body text-muted leading-relaxed font-normal">
          Household scrap recycling is one of India&apos;s most vital green supply chains. Yet, for decades, families dealt with arbitrary spring scales and lowball estimates, while hardworking local collectors cycled 20 kilometers blindly every day.
        </p>

        <p className="text-sm sm:text-base text-text/80 leading-relaxed font-medium">
          <strong>RaddiBhaav (रद्दी भाव)</strong> bridges this divide through competitive neighborhood bidding, certified doorstep electronic weighing, and direct instant payment.
        </p>
      </section>

      {/* 2. THREE PILLARS OF TRUST */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-premium p-8 space-y-4">
          <div className="w-12 h-12 rounded-[14px] bg-primary-tint text-primary dark:text-accent flex items-center justify-center shrink-0">
            <Scale className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl font-bold text-text">Certified Digital Scales</h3>
          <p className="text-sm text-muted leading-relaxed">
            Every partnered dealer carries certified electronic scales. No dubious spring dials or thumb pressing — payout is computed strictly on actual kilograms.
          </p>
        </div>

        <div className="card-premium p-8 space-y-4">
          <div className="w-12 h-12 rounded-[14px] bg-accent-tint text-accent flex items-center justify-center shrink-0">
            <Banknote className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl font-bold text-text">Competitive Bidding</h3>
          <p className="text-sm text-muted leading-relaxed">
            Upload a quick photo and estimated weight. Verified nearby dealers submit competing sealed offers within 2 hours, guaranteeing maximum market payout.
          </p>
        </div>

        <div className="card-premium p-8 space-y-4">
          <div className="w-12 h-12 rounded-[14px] bg-primary-tint text-primary dark:text-accent flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl font-bold text-text">100% KYC Verified</h3>
          <p className="text-sm text-muted leading-relaxed">
            All dealer partners undergo in-person verification with physical shop address checks and community ratings for complete household safety.
          </p>
        </div>
      </section>

      {/* 3. "BUILT BY" FOUNDER SECTION */}
      <section className="max-w-4xl mx-auto">
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary dark:text-accent">
            <HeartHandshake className="w-4 h-4" />
            <span>The Team</span>
          </div>
          <h2 className="type-h2 font-serif text-text">Built by</h2>
          <p className="text-sm text-muted">
            Crafted with passion in Nashik, Maharashtra to empower Indian households and recycling champions.
          </p>
        </div>

        {/* Founder Card */}
        <div className="card-premium p-8 sm:p-12 relative overflow-hidden shadow-xl border border-border">
          {/* Subtle decorative background gradient */}
          <div 
            aria-hidden="true" 
            className="absolute -top-24 -right-24 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" 
          />

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10 text-center md:text-left">
            {/* Photo Placeholder */}
            <div className="relative shrink-0 group">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-[24px] bg-gradient-to-br from-primary via-primary-hover to-accent flex items-center justify-center shadow-lg text-white font-serif font-black text-3xl sm:text-4xl ring-4 ring-primary-tint group-hover:scale-105 transition-transform">
                <span>VS</span>
              </div>
              <div 
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center border-2 border-surface shadow-xs"
                title="Verified Founder"
              >
                <UserCheck className="w-4 h-4" />
              </div>
            </div>

            {/* Profile Info */}
            <div className="space-y-4 flex-1">
              <div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-text">
                    {SITE_CONFIG.creator.name}
                  </h3>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary-tint text-primary dark:text-accent border border-primary/20 text-xs font-bold">
                    {SITE_CONFIG.creator.role}
                  </span>
                </div>

                <div className="flex items-center justify-center md:justify-start gap-1.5 text-xs text-muted font-medium mt-1.5">
                  <MapPin className="w-3.5 h-3.5 text-accent" />
                  <span>{SITE_CONFIG.creator.location}</span>
                </div>
              </div>

              {/* 2-line bio placeholder */}
              <p className="text-sm sm:text-base text-text/85 leading-relaxed font-normal max-w-2xl">
                {SITE_CONFIG.creator.bio}
              </p>

              {/* Highlights */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1 text-xs text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Full-Stack Architecture
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Civic & Circular Economy
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Open Web Technologies
                </span>
              </div>

              {/* Action Buttons: LinkedIn & GitHub */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-3">
                <a
                  href={SITE_CONFIG.links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary min-h-[44px] px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-[12px] inline-flex items-center gap-2 shadow-xs hover:scale-105 transition-all"
                >
                  <LinkedInIcon className="w-4 h-4 text-white" />
                  <span>Connect on LinkedIn</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>

                <a
                  href={SITE_CONFIG.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline min-h-[44px] px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-[12px] inline-flex items-center gap-2 hover:bg-muted-bg/80 transition-all"
                >
                  <GitHubIcon className="w-4 h-4 text-text" />
                  <span>GitHub Profile</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MISSION & LOCAL TOUCH */}
      <section className="card-premium p-8 sm:p-12 text-center max-w-3xl mx-auto space-y-6">
        <div className="w-12 h-12 rounded-[14px] bg-primary text-white flex items-center justify-center mx-auto shadow-md">
          <Recycle className="w-6 h-6 text-accent" />
        </div>

        <h3 className="font-serif text-2xl font-bold text-text">
          Fair scrap pricing for every Indian neighborhood
        </h3>

        <p className="text-sm text-muted leading-relaxed max-w-xl mx-auto">
          Whether you have a stack of old newspapers, delivery cardboard boxes, or metal fixtures, RaddiBhaav guarantees you the dignity of accurate electronic weigh-ins and competitive bids from trusted neighborhood recyclers.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <Link
            href="/sell"
            className="btn-primary w-full sm:w-auto px-6 py-3 text-sm rounded-[14px]"
          >
            <span>Sell your scrap now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/rates"
            className="btn-outline w-full sm:w-auto px-6 py-3 text-sm rounded-[14px]"
          >
            <TrendingUp className="w-4 h-4 text-accent" />
            <span>Check live mandi rates</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
