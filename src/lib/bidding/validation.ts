// ==============================================================================
// RaddiBhaav: Dealer Offer Validation & Anti-Spam Guardrails
// ==============================================================================

import type { OfferSubmission, ValidationResult } from './types';

export interface ExistingOfferCheck {
  id: string;
  dealer_id: string;
  listing_id: string;
  status: string; // 'pending' | 'accepted' | 'rejected' | 'withdrawn'
}

export interface ListingStatusCheck {
  id: string;
  status: string; // 'open' | 'offers_received' | 'accepted' | 'completed' | 'cancelled' | 'expired'
  bid_expires_at: string;
}

export interface DealerKycCheck {
  dealer_id: string;
  kyc_status: 'pending' | 'approved' | 'rejected';
  is_active: boolean;
}

// Sane bounds for scrap category rates (₹/kg)
export const SANE_RATE_BOUNDS: Record<string, { min: number; max: number }> = {
  newspaper: { min: 5, max: 50 },
  cardboard: { min: 2, max: 35 },
  iron: { min: 10, max: 90 },
  plastic: { min: 4, max: 60 },
  ewaste: { min: 10, max: 350 },
  appliances: { min: 15, max: 400 },
};

export const GLOBAL_RATE_FLOOR = 1;      // ₹1/kg minimum
export const GLOBAL_RATE_CEILING = 1000; // ₹1,000/kg maximum for ordinary scrap

/**
 * Validates a dealer offer before insertion.
 * Rules:
 * 1. Dealer KYC must be 'approved' and account active.
 * 2. Listing must be open for bidding and not expired.
 * 3. Prevents duplicate active/pending offers from the same dealer on this listing.
 * 4. Total amount must be strictly > 0.
 * 5. All per-category rates must be > 0 and within reasonable sane bounds.
 */
export function validateDealerOffer(
  submission: OfferSubmission,
  listing: ListingStatusCheck,
  existingOffers: ExistingOfferCheck[],
  dealer: DealerKycCheck,
  now: Date = new Date()
): ValidationResult {
  const errors: string[] = [];

  // 1. KYC Check
  if (dealer.kyc_status !== 'approved') {
    errors.push('Dealer KYC is not approved. Bidding is blocked until KYC verification is complete.');
  }

  if (!dealer.is_active) {
    errors.push('Dealer account is deactivated.');
  }

  // 2. Listing Status & Expiry Check
  const openStatuses = ['open', 'offers_received', 'open_for_bids'];
  if (!openStatuses.includes(listing.status)) {
    errors.push(`Listing is not open for bidding (current status: ${listing.status}).`);
  }

  const expiryTime = new Date(listing.bid_expires_at).getTime();
  if (now.getTime() > expiryTime) {
    errors.push('Bidding window for this listing has expired.');
  }

  // 3. Duplicate Offer Check
  const hasActiveOffer = existingOffers.some(
    (o) =>
      o.listing_id === submission.listing_id &&
      o.dealer_id === submission.dealer_id &&
      o.status !== 'withdrawn' &&
      o.status !== 'rejected'
  );

  if (hasActiveOffer) {
    errors.push('Duplicate offer: Dealer already has an active offer on this listing. Use edit or withdraw instead.');
  }

  // 4. Amount > 0 Check
  if (!submission.total_amount || submission.total_amount <= 0 || isNaN(submission.total_amount)) {
    errors.push('Offer total amount must be greater than zero.');
  }

  // 5. Per-Category Rates Check
  const rateEntries = Object.entries(submission.rates || {});
  if (rateEntries.length === 0) {
    errors.push('At least one scrap category rate must be specified.');
  } else {
    for (const [category, rate] of rateEntries) {
      if (typeof rate !== 'number' || isNaN(rate) || rate <= 0) {
        errors.push(`Invalid rate for category "${category}": must be greater than 0.`);
        continue;
      }

      if (rate < GLOBAL_RATE_FLOOR || rate > GLOBAL_RATE_CEILING) {
        errors.push(
          `Rate for category "${category}" (₹${rate}/kg) is outside sane bounds (₹${GLOBAL_RATE_FLOOR} - ₹${GLOBAL_RATE_CEILING}/kg).`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
