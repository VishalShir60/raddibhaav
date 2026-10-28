// ==============================================================================
// RaddiBhaav: Dealer Matching & Geospatial Filtering
// ==============================================================================

import type { GeoCoordinates, NearbyDealerCandidate } from './types';

/**
 * Calculates great-circle distance between two [longitude, latitude] points using Haversine formula.
 * Returns distance in kilometers rounded to 2 decimal places.
 */
export function calculateDistanceKm(
  coord1: GeoCoordinates,
  coord2: GeoCoordinates
): number {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;

  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  return Math.round(d * 100) / 100;
}

export interface DealerRawRecord {
  dealer_id: string;
  shop_name: string;
  phone: string;
  service_radius_km: number;
  coordinates: GeoCoordinates;
  kyc_status: 'pending' | 'approved' | 'rejected';
  is_active: boolean;
  rating_avg: number;
  total_pickups: number;
}

/**
 * Filters and ranks nearby approved dealers for a given listing location.
 * Rules:
 * 1. Dealer must have `is_active === true`.
 * 2. Dealer must have `kyc_status === 'approved'`.
 * 3. Distance must be within dealer's service radius + any extra expansion radius (e.g. +3 km on extension).
 * 4. Sorted by shortest distance first.
 */
export function findNearbyApprovedDealers(
  listingCoords: GeoCoordinates,
  dealers: DealerRawRecord[],
  extraRadiusKm = 0
): NearbyDealerCandidate[] {
  const matches: NearbyDealerCandidate[] = [];

  for (const dealer of dealers) {
    // Rule: Exclude inactive dealers
    if (!dealer.is_active) continue;

    // Rule: Exclude unapproved KYC dealers
    if (dealer.kyc_status !== 'approved') continue;

    const distance = calculateDistanceKm(listingCoords, dealer.coordinates);
    const effectiveRadius = dealer.service_radius_km + extraRadiusKm;

    if (distance <= effectiveRadius) {
      matches.push({
        dealer_id: dealer.dealer_id,
        shop_name: dealer.shop_name,
        phone: dealer.phone,
        service_radius_km: dealer.service_radius_km,
        distance_km: distance,
        rating_avg: dealer.rating_avg,
        total_pickups: dealer.total_pickups,
        kyc_status: dealer.kyc_status,
        is_active: dealer.is_active,
      });
    }
  }

  // Sort closest first
  return matches.sort((a, b) => a.distance_km - b.distance_km);
}
