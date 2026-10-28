// ==============================================================================
// RaddiBhaav: Bidding Engine Types & Interfaces
// ==============================================================================

export type GeoCoordinates = [number, number]; // [longitude, latitude]

export interface NearbyDealerCandidate {
  dealer_id: string;
  shop_name: string;
  phone: string;
  service_radius_km: number;
  distance_km: number;
  rating_avg: number;
  total_pickups: number;
  kyc_status: 'pending' | 'approved' | 'rejected';
  is_active: boolean;
}

export interface BidWindowConfig {
  defaultHours: number;        // Default 2 hours
  autoExtendHours: number;     // Auto-extend by 1 hour
  minOffersForClose: number;   // Need at least 2 offers before closing
  radiusExpansionKm: number;   // Widen radius by 3 km on extension
}


export type BidWindowStatus = 'active' | 'extended' | 'closed';

export interface BidWindowEvaluation {
  status: BidWindowStatus;
  bid_expires_at: string;
  auto_extended: boolean;
  widened_radius_km: number;
  reason: string;
  offers_count: number;
}

export interface CategoryRateOffer {
  category_slug: string;
  rate_per_kg: number;
}

export interface OfferSubmission {
  listing_id: string;
  dealer_id: string;
  rates: Record<string, number>; // per-category rates e.g. { newspaper: 16, iron: 30 }
  total_amount: number;          // estimated total based on initial weights
  notes?: string;
  eta_minutes?: number;
  pickup_slot?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface PayoutItem {
  category_slug: string;
  est_weight_kg: number;
  actual_weight_kg: number;
  rate_per_kg: number;
  item_payout: number;
}

export interface PayoutCalculationResult {
  items: PayoutItem[];
  total_est_weight_kg: number;
  total_actual_weight_kg: number;
  final_payout_amount: number;
  weight_diff_kg: number;
  weight_diff_percent: number;
  is_divergent: boolean;               // true if weight difference > 15%
  requires_seller_reconfirmation: boolean; // seller can re-confirm or cancel
  can_cancel_without_penalty: boolean;
}

export interface LowballCheckResult {
  is_lowball: boolean;
  expected_amount: number;
  actual_paid_amount: number;
  shortfall_amount: number;
  action: 'none' | 'open_dispute';
  dispute_reason?: string;
}
