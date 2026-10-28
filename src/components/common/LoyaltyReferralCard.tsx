'use client';

import { useState } from 'react';
import { Coins, Share2, Copy, Check, Sparkles, Award } from 'lucide-react';
import { getSellerLoyaltyProfile, getDealerLoyaltyProfile } from '@/lib/loyalty/loyalty-service';

interface LoyaltyReferralCardProps {
  role: 'seller' | 'dealer';
  userId: string;
  city?: string;
}

export function LoyaltyReferralCard({ role, userId, city }: LoyaltyReferralCardProps) {
  const [copied, setCopied] = useState(false);

  if (role === 'seller') {
    const profile = getSellerLoyaltyProfile(userId, city);

    const handleCopy = () => {
      navigator.clipboard.writeText(profile.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = () => {
      const shareText = `Sell your scrap at the best Mandi price on RaddiBhaav! Use my referral code ${profile.referralCode} to get ₹50 bonus on your first doorstep pickup: ${profile.referralLink}`;
      if (navigator.share) {
        navigator.share({
          title: 'Sell Scrap with RaddiBhaav',
          text: shareText,
          url: profile.referralLink,
        }).catch(() => {});
      } else {
        handleCopy();
      }
    };

    return (
      <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-emerald-800/80 relative overflow-hidden">
        {/* Background glow & badge */}
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-800/70 border border-emerald-600/50 text-amber-300">
                <Coins className="w-5 h-5" />
              </span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300/90 block">
                  Loyalty Rewards (MVP)
                </span>
                <h4 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  Green Coins & Bonus Credit
                  <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                    {profile.tier}
                  </span>
                </h4>
              </div>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black text-amber-400 font-mono">
                {profile.greenCoins}
              </span>
              <span className="block text-[10px] text-emerald-200/80 font-bold">
                ≈ ₹{profile.bonusCreditInRupees} Bonus Credit
              </span>
            </div>
          </div>

          <p className="text-xs text-emerald-100/80 leading-relaxed">
            Earn <strong className="text-white">2 Green Coins</strong> per kg of scrap recycled on repeat pickups. Redeemable for direct UPI bonus payout on future scrap clearouts!
          </p>

          {/* Referral Code Box */}
          <div className="bg-emerald-950/80 border border-emerald-700/60 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-emerald-300 block uppercase">
                Your Neighborhood Referral Code
              </span>
              <span className="text-base font-black tracking-wider text-amber-300 font-mono">
                {profile.referralCode}
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleCopy}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl border border-emerald-600/60 transition-colors min-h-[44px]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95 min-h-[44px]"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share & Earn ₹50</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dealer Loyalty & Priority Dispatch card
  const dealerProfile = getDealerLoyaltyProfile(userId);

  return (
    <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-emerald-800/60 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Award className="w-5 h-5" />
          </span>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
              Dealer Loyalty Program (MVP)
            </span>
            <h4 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              {dealerProfile.tier}
              {dealerProfile.priorityDispatchBadge && (
                <span className="inline-flex items-center gap-1 text-[10px] font-black bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 px-2.5 py-0.5 rounded-full shadow-xs">
                  <Sparkles className="w-3 h-3" /> Priority Dispatch Active
                </span>
              )}
            </h4>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xl font-black text-emerald-400 font-mono">
            {dealerProfile.commissionDiscountPercent}% Off
          </span>
          <span className="block text-[10px] text-slate-400 font-medium">Future Platform Fee</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700/60">
          <span className="text-slate-400 block text-[10px] font-bold">Pickups Milestone</span>
          <strong className="text-white text-sm font-black">{dealerProfile.totalPickups} Completed</strong>
        </div>
        <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700/60">
          <span className="text-slate-400 block text-[10px] font-bold">Avg Customer Rating</span>
          <strong className="text-amber-400 text-sm font-black">★ {dealerProfile.ratingAvg.toFixed(1)} / 5.0</strong>
        </div>
      </div>

      <p className="text-[11px] text-slate-300/80 leading-relaxed">
        Maintaining 10+ completed pickups and $\ge 4.5$ stars awards your shop the <strong>Priority Dispatch</strong> badge. Your offers appear at the top of seller live bid feeds.
      </p>
    </div>
  );
}
