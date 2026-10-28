'use client';

import { ShieldCheck, Scale, Award, Star } from 'lucide-react';

interface DealerTrustBadgesProps {
  isKycVerified: boolean;
  totalPickups: number;
  rating?: number;
  scaleCertified?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function DealerTrustBadges({
  isKycVerified,
  totalPickups,
  rating = 4.8,
  scaleCertified = true,
  size = 'sm',
  className = '',
}: DealerTrustBadgesProps) {
  const isSmall = size === 'sm';

  const badgeTextClass = isSmall ? 'text-[10px] font-bold' : 'text-xs font-bold';
  const iconSizeClass = isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5';
  const paddingClass = isSmall ? 'px-2 py-0.5' : 'px-2.5 py-1';

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {/* 1. KYC Verified Badge */}
      {isKycVerified && (
        <span
          className={`inline-flex items-center gap-1 rounded-full bg-emerald-100/90 text-emerald-900 border border-emerald-300 ${paddingClass} ${badgeTextClass}`}
          title="Identity and shop verified by RaddiBhaav ops team"
        >
          <ShieldCheck className={`${iconSizeClass} text-emerald-700 shrink-0`} />
          <span>KYC Verified</span>
        </span>
      )}

      {/* 2. Pickup Milestone Badge (10+ or 50+ Pickups) */}
      {totalPickups >= 10 ? (
        <span
          className={`inline-flex items-center gap-1 rounded-full bg-blue-100/90 text-blue-900 border border-blue-300 ${paddingClass} ${badgeTextClass}`}
          title={`${totalPickups} completed doorstep scrap collections`}
        >
          <Award className={`${iconSizeClass} text-blue-700 shrink-0`} />
          <span>{totalPickups >= 50 ? '50+ Pickups' : '10+ Pickups'}</span>
        </span>
      ) : (
        <span
          className={`inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${paddingClass} ${badgeTextClass}`}
        >
          <span>Rising Collector</span>
        </span>
      )}

      {/* 3. Rating Badge */}
      {rating > 0 && (
        <span
          className={`inline-flex items-center gap-1 rounded-full bg-amber-100/90 text-amber-950 border border-amber-300 ${paddingClass} ${badgeTextClass}`}
          title={`Average customer rating: ${rating} out of 5 stars`}
        >
          <Star className={`${iconSizeClass} fill-amber-500 text-amber-500 shrink-0`} />
          <span>★ {rating.toFixed(1)}</span>
        </span>
      )}

      {/* 4. Digital Scale Certified */}
      {scaleCertified && (
        <span
          className={`inline-flex items-center gap-1 rounded-full bg-teal-100/90 text-teal-950 border border-teal-300 ${paddingClass} ${badgeTextClass}`}
          title="Uses verified electronic weighing scale"
        >
          <Scale className={`${iconSizeClass} text-teal-700 shrink-0`} />
          <span>Scale Certified</span>
        </span>
      )}
    </div>
  );
}
