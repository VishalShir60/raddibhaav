'use client';

import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Star, 
  MapPin, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp,
  Award
} from 'lucide-react';

export function HeroPhoneMockup() {
  const containerVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.96 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1] as const,
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }
    }
  };

  return (
    <motion.div 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={containerVariants}
      className="relative mx-auto w-full max-w-[340px] sm:max-w-[380px]"
    >
      {/* Decorative ambient glowing backdrops */}
      <div 
        aria-hidden="true" 
        className="absolute -inset-4 bg-gradient-to-tr from-primary/15 via-accent/20 to-primary/10 rounded-[44px] blur-2xl -z-10" 
      />

      {/* Smartphone Chassis */}
      <div className="relative rounded-[38px] p-3 sm:p-3.5 bg-gradient-to-b from-stone-800 via-stone-900 to-black shadow-[0_25px_60px_-15px_rgba(15,61,46,0.35),0_0_0_1px_rgba(255,255,255,0.12)]">
        {/* Dynamic Island / Speaker Notch */}
        <div className="absolute top-4 inset-x-0 flex justify-center z-20">
          <div className="h-4 w-24 bg-black rounded-full flex items-center justify-end px-2 gap-1.5 border border-white/5">
            <span className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse" />
            <span className="w-1.5 h-1.5 rounded-full bg-stone-700" />
          </div>
        </div>

        {/* Inner Screen */}
        <div className="rounded-[30px] overflow-hidden bg-background dark:bg-[#07140F] border border-border/80 text-text pt-7 pb-4 px-3.5 sm:px-4 space-y-3">
          {/* Status Bar */}
          <div className="flex items-center justify-between text-[11px] font-bold text-muted px-1">
            <span>9:41</span>
            <span className="flex items-center gap-1.5 font-medium">
              <span>5G</span>
              <span className="w-4 h-2 rounded-xs border border-muted flex items-center p-0.5">
                <span className="w-full h-full bg-muted rounded-xs" />
              </span>
            </span>
          </div>

          {/* Screen Mini Header */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary dark:text-accent flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Live Bidding Window
              </span>
              <h4 className="font-serif font-bold text-sm text-text">
                35 kg Mixed Scrap Clearance
              </h4>
            </div>
            <div className="text-right">
              <span className="inline-block px-2 py-0.5 rounded-full bg-primary-tint text-primary dark:text-accent font-bold text-[10px]">
                3 Offers
              </span>
            </div>
          </div>

          {/* COMPETING OFFER 1: ₹600 (Best Offer - Highlighted in Gold) */}
          <motion.div 
            variants={itemVariants}
            className="relative rounded-[18px] p-3 sm:p-3.5 bg-surface border-2 border-accent shadow-[0_4px_20px_-2px_rgba(201,162,39,0.22)]"
          >
            {/* Best Offer Ribbon */}
            <div className="absolute -top-2.5 right-3 bg-accent text-slate-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-slate-950" />
              Best Offer
            </div>

            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <h5 className="font-bold text-xs sm:text-sm text-text leading-tight">
                    Shree Ganesh Traders
                  </h5>
                  <ShieldCheck className="w-3.5 h-3.5 text-primary dark:text-accent shrink-0" />
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted font-medium">
                  <span className="flex items-center text-amber-500 font-bold">
                    <Star className="w-3 h-3 fill-amber-500 stroke-amber-500 mr-0.5" />
                    4.9
                  </span>
                  <span>•</span>
                  <span className="flex items-center">
                    <MapPin className="w-2.5 h-2.5 mr-0.5" />
                    1.4 km
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="text-right">
                <div className="text-xl sm:text-2xl font-black tabular-nums text-accent leading-none font-sans">
                  ₹600
                </div>
                <span className="text-[10px] text-emerald-800 dark:text-emerald-400 font-bold">+50% vs Street</span>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-border flex items-center justify-between text-[10px]">
              <span className="text-muted truncate max-w-[170px]">ISO digital scale • UPI / Cash</span>
              <span className="font-bold text-primary dark:text-accent bg-primary-tint/70 px-2 py-0.5 rounded-md">
                Accept Offer →
              </span>
            </div>
          </motion.div>

          {/* COMPETING OFFER 2: ₹550 (Standard Dealer) */}
          <motion.div 
            variants={itemVariants}
            className="rounded-[18px] p-3 bg-surface border border-border shadow-xs space-y-1.5"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <h5 className="font-bold text-xs text-text">City Green Recyclers</h5>
                  <ShieldCheck className="w-3 h-3 text-muted shrink-0" />
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted">
                  <span className="flex items-center text-amber-500 font-semibold">
                    <Star className="w-3 h-3 fill-amber-500 stroke-amber-500 mr-0.5" />
                    4.7
                  </span>
                  <span>•</span>
                  <span>2.8 km away</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-bold tabular-nums text-text font-sans">
                  ₹550
                </div>
                <span className="text-[10px] text-muted">Market rate</span>
              </div>
            </div>
          </motion.div>

          {/* COMPETING OFFER 3: ₹400 (Street Baseline) */}
          <motion.div 
            variants={itemVariants}
            className="rounded-[18px] p-2.5 bg-muted-bg/50 border border-border/60 opacity-75 space-y-1"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h5 className="font-medium text-xs text-muted">Traditional Hawker Baseline</h5>
                <span className="text-[10px] text-danger font-medium">Uncalibrated spring scale</span>
              </div>
              <div className="text-right">
                <div className="text-base font-bold tabular-nums text-muted font-sans line-through opacity-80">
                  ₹400
                </div>
              </div>
            </div>
          </motion.div>

          {/* Micro Footer Notice */}
          <div className="pt-1 text-center">
            <span className="text-[10px] text-muted flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-primary dark:text-accent" />
              100% Free for sellers • Pay on final weight
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
