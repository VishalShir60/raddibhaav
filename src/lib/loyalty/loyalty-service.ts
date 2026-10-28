/**
 * RaddiBhaav Referral & Loyalty Engine (Design Stub for MVP)
 * 
 * Provides:
 * 1. Household Seller referral codes & Green Coin accrual for repeat pickups
 * 2. Dealer loyalty tiering: 10+ pickups + high rating unlocks 'Priority Dispatch' badge
 * 3. Bonus credit accumulation design hook (redeemable for bonus UPI credits)
 */

export interface SellerLoyaltyProfile {
  sellerId: string;
  referralCode: string;
  referralLink: string;
  greenCoins: number;
  completedPickups: number;
  streakCount: number; // pickups in current cycle
  bonusCreditInRupees: number; // Future redemption credit
  tier: 'Silver Recycler' | 'Gold Recycler' | 'Platinum Eco Hero';
  nextRewardThreshold: number;
}

export interface DealerLoyaltyProfile {
  dealerId: string;
  totalPickups: number;
  ratingAvg: number;
  priorityDispatchBadge: boolean;
  commissionDiscountPercent: number;
  priorityDispatchExpiry?: string;
  tier: 'Standard Partner' | 'Preferred Dealer' | 'Champion Kabadiwala';
}

// In-memory store for MVP simulation
const sellerLoyaltyStore = new Map<string, SellerLoyaltyProfile>();
const dealerLoyaltyStore = new Map<string, DealerLoyaltyProfile>();

/**
 * Generate or retrieve a seller's referral & loyalty profile
 */
export function getSellerLoyaltyProfile(sellerId: string, city = 'Nashik'): SellerLoyaltyProfile {
  if (sellerLoyaltyStore.has(sellerId)) {
    return sellerLoyaltyStore.get(sellerId)!;
  }

  // Generate deterministic referral code
  const cityCode = city.slice(0, 3).toUpperCase();
  const idHash = Math.abs(sellerId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 900) + 100;
  const referralCode = `RADDI-${cityCode}-${idHash}`;

  const defaultProfile: SellerLoyaltyProfile = {
    sellerId,
    referralCode,
    referralLink: `https://raddibhaav.in/r/${referralCode}`,
    greenCoins: 150, // Welcome signup bonus
    completedPickups: 2,
    streakCount: 2,
    bonusCreditInRupees: 75,
    tier: 'Gold Recycler',
    nextRewardThreshold: 200,
  };

  sellerLoyaltyStore.set(sellerId, defaultProfile);
  return defaultProfile;
}

/**
 * Record a completed pickup for seller loyalty accrual
 */
export function recordSellerPickupLoyalty(sellerId: string, scrapKg: number): SellerLoyaltyProfile {
  const profile = getSellerLoyaltyProfile(sellerId);
  const earnedCoins = Math.max(25, Math.round(scrapKg * 2)); // 2 coins per kg scrap
  const earnedRupees = Math.round(earnedCoins * 0.5); // ₹0.5 per coin redemption value

  profile.completedPickups += 1;
  profile.streakCount += 1;
  profile.greenCoins += earnedCoins;
  profile.bonusCreditInRupees += earnedRupees;

  if (profile.completedPickups >= 10) {
    profile.tier = 'Platinum Eco Hero';
  } else if (profile.completedPickups >= 3) {
    profile.tier = 'Gold Recycler';
  }

  sellerLoyaltyStore.set(sellerId, profile);
  return profile;
}

/**
 * Retrieve a dealer's loyalty & priority dispatch status
 */
export function getDealerLoyaltyProfile(dealerId: string, totalPickups = 15, ratingAvg = 4.85): DealerLoyaltyProfile {
  if (dealerLoyaltyStore.has(dealerId)) {
    return dealerLoyaltyStore.get(dealerId)!;
  }

  const hasPriorityBadge = totalPickups >= 10 && ratingAvg >= 4.5;
  const tier: DealerLoyaltyProfile['tier'] = 
    totalPickups >= 50 && ratingAvg >= 4.8
      ? 'Champion Kabadiwala'
      : totalPickups >= 10 && ratingAvg >= 4.5
      ? 'Preferred Dealer'
      : 'Standard Partner';

  const commissionDiscount = tier === 'Champion Kabadiwala' ? 30 : tier === 'Preferred Dealer' ? 15 : 0;

  const profile: DealerLoyaltyProfile = {
    dealerId,
    totalPickups,
    ratingAvg,
    priorityDispatchBadge: hasPriorityBadge,
    commissionDiscountPercent: commissionDiscount,
    priorityDispatchExpiry: hasPriorityBadge ? 'Active for current month' : undefined,
    tier,
  };

  dealerLoyaltyStore.set(dealerId, profile);
  return profile;
}
