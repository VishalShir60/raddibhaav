// ==============================================================================
// RaddiBhaav: Bid Window Lifecycle & Auto-Extension Engine
// ==============================================================================

import type {
  BidWindowConfig,
  BidWindowEvaluation,
} from './types';

export const DEFAULT_BID_WINDOW_CONFIG: BidWindowConfig = {
  defaultHours: 2,
  autoExtendHours: 1,
  minOffersForClose: 2,
  radiusExpansionKm: 3,
};

export interface ListingExpiryInput {
  id: string;
  created_at: string;
  bid_expires_at: string;
  auto_extended?: boolean;
  widened_radius_km?: number;
}

/**
 * Creates default initial expiration timestamp (2 hours from now/creation).
 */
export function createInitialBidExpiresAt(
  startTime: Date = new Date(),
  config: BidWindowConfig = DEFAULT_BID_WINDOW_CONFIG
): string {
  const expiresAt = new Date(startTime.getTime() + config.defaultHours * 60 * 60 * 1000);
  return expiresAt.toISOString();
}

/**
 * Evaluates the status of a listing's bidding window.
 *
 * Rules:
 * 1. If now < bid_expires_at: window is still 'active'.
 * 2. If now >= bid_expires_at:
 *    a. If offersCount < minOffersForClose (default 2) AND listing has NOT been auto-extended yet:
 *       - Auto-extend once by autoExtendHours (default 1 hour).
 *       - Mark auto_extended = true.
 *       - Increase widened_radius_km by radiusExpansionKm (default +3 km).
 *       - Status is 'extended'.
 *    b. Otherwise (>= 2 offers OR already extended once):
 *       - Window is 'closed' for seller review / selection.
 */
export function evaluateBidWindow(
  listing: ListingExpiryInput,
  offersCount: number,
  now: Date = new Date(),
  config: BidWindowConfig = DEFAULT_BID_WINDOW_CONFIG
): BidWindowEvaluation {
  const expiresAtDate = new Date(listing.bid_expires_at);
  const isTimeUp = now.getTime() >= expiresAtDate.getTime();

  // If time is not up yet, window is active
  if (!isTimeUp) {
    return {
      status: 'active',
      bid_expires_at: listing.bid_expires_at,
      auto_extended: Boolean(listing.auto_extended),
      widened_radius_km: listing.widened_radius_km || 0,
      reason: 'Bidding window is actively open for dealer offers.',
      offers_count: offersCount,
    };
  }

  // Time is up. Check if fewer than 2 offers arrived and not yet extended
  const hasMinOffers = offersCount >= config.minOffersForClose;
  const alreadyExtended = Boolean(listing.auto_extended);

  if (!hasMinOffers && !alreadyExtended) {
    // Auto-extend by 1 hour and widen radius by 3 km
    const extendedExpiry = new Date(
      expiresAtDate.getTime() + config.autoExtendHours * 60 * 60 * 1000
    );

    const widenedRadius = (listing.widened_radius_km || 0) + config.radiusExpansionKm;

    return {
      status: 'extended',
      bid_expires_at: extendedExpiry.toISOString(),
      auto_extended: true,
      widened_radius_km: widenedRadius,
      reason: `Fewer than ${config.minOffersForClose} offers received (${offersCount}). Window auto-extended by ${config.autoExtendHours}h and search radius widened by ${config.radiusExpansionKm} km.`,
      offers_count: offersCount,
    };
  }

  // Otherwise, close bidding
  const closeReason = alreadyExtended
    ? `Bidding closed after 1-hour auto-extension completed with ${offersCount} offer(s).`
    : `Bidding closed with ${offersCount} competing offer(s) received.`;

  return {
    status: 'closed',
    bid_expires_at: listing.bid_expires_at,
    auto_extended: alreadyExtended,
    widened_radius_km: listing.widened_radius_km || 0,
    reason: closeReason,
    offers_count: offersCount,
  };
}
