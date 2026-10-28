import test from 'node:test';
import assert from 'node:assert';
import {
  calculateDistanceKm,
  findNearbyApprovedDealers,
} from '../matching.ts';
import type { DealerRawRecord } from '../matching.ts';

test('calculateDistanceKm: computes distance between Mumbai coordinates accurately', () => {
  // Mumbai CST to Dadar ~ 8.5 - 9.5 km
  const cst: [number, number] = [72.8354, 18.9401];
  const dadar: [number, number] = [72.8432, 19.0178];

  const distance = calculateDistanceKm(cst, dadar);
  assert.ok(distance > 8.0 && distance < 10.0, `Expected ~8.7 km, got ${distance}`);

  // Distance to same point is 0
  assert.strictEqual(calculateDistanceKm(cst, cst), 0);
});

test('findNearbyApprovedDealers: matches only approved, active dealers within service radius', () => {
  const listingLocation: [number, number] = [72.8777, 19.0760]; // Mumbai Central

  const dealers: DealerRawRecord[] = [
    {
      dealer_id: 'd1-approved-in-range',
      shop_name: 'Gupta Scrap',
      phone: '9876543210',
      service_radius_km: 5.0,
      coordinates: [72.8800, 19.0780], // ~0.3 km away
      kyc_status: 'approved',
      is_active: true,
      rating_avg: 4.8,
      total_pickups: 200,
    },
    {
      dealer_id: 'd2-pending-kyc',
      shop_name: 'Unverified Scrap',
      phone: '9820000000',
      service_radius_km: 10.0,
      coordinates: [72.8790, 19.0770], // Close, but KYC pending!
      kyc_status: 'pending',
      is_active: true,
      rating_avg: 4.0,
      total_pickups: 10,
    },
    {
      dealer_id: 'd3-inactive',
      shop_name: 'Closed Scrap Shop',
      phone: '9819999999',
      service_radius_km: 10.0,
      coordinates: [72.8780, 19.0765], // Close, but inactive!
      kyc_status: 'approved',
      is_active: false,
      rating_avg: 4.5,
      total_pickups: 50,
    },
    {
      dealer_id: 'd4-out-of-range',
      shop_name: 'Faraway Scrap',
      phone: '9811111111',
      service_radius_km: 2.0, // Only serves 2 km radius
      coordinates: [72.8000, 19.0200], // ~10 km away
      kyc_status: 'approved',
      is_active: true,
      rating_avg: 4.9,
      total_pickups: 300,
    },
  ];

  const matched = findNearbyApprovedDealers(listingLocation, dealers);

  assert.strictEqual(matched.length, 1);
  assert.strictEqual(matched[0].dealer_id, 'd1-approved-in-range');
  assert.ok(matched[0].distance_km < 1.0);
});

test('findNearbyApprovedDealers: matches extra radius when expanded (+3 km)', () => {
  const listingLocation: [number, number] = [72.8777, 19.0760];

  const dealers: DealerRawRecord[] = [
    {
      dealer_id: 'd1-initially-out-of-range',
      shop_name: 'Expansion Scrap',
      phone: '9876543210',
      service_radius_km: 3.0,
      coordinates: [72.9200, 19.0900], // ~4.7 km away (exceeds 3.0 km service radius)
      kyc_status: 'approved',
      is_active: true,
      rating_avg: 4.7,
      total_pickups: 150,
    },
  ];

  // Without expansion
  const normalMatches = findNearbyApprovedDealers(listingLocation, dealers, 0);
  assert.strictEqual(normalMatches.length, 0);

  // With +3 km expansion (effective radius becomes 3 + 3 = 6 km)
  const expandedMatches = findNearbyApprovedDealers(listingLocation, dealers, 3);
  assert.strictEqual(expandedMatches.length, 1);
  assert.strictEqual(expandedMatches[0].dealer_id, 'd1-initially-out-of-range');
});

test('findNearbyApprovedDealers: returns results sorted by shortest distance', () => {
  const listingLocation: [number, number] = [72.8777, 19.0760];

  const dealers: DealerRawRecord[] = [
    {
      dealer_id: 'further-dealer',
      shop_name: 'Further Shop',
      phone: '9876543210',
      service_radius_km: 10.0,
      coordinates: [72.9000, 19.0900], // ~2.8 km
      kyc_status: 'approved',
      is_active: true,
      rating_avg: 4.8,
      total_pickups: 100,
    },
    {
      dealer_id: 'closer-dealer',
      shop_name: 'Closer Shop',
      phone: '9876543211',
      service_radius_km: 10.0,
      coordinates: [72.8800, 19.0770], // ~0.3 km
      kyc_status: 'approved',
      is_active: true,
      rating_avg: 4.9,
      total_pickups: 120,
    },
  ];

  const matched = findNearbyApprovedDealers(listingLocation, dealers);
  assert.strictEqual(matched.length, 2);
  assert.strictEqual(matched[0].dealer_id, 'closer-dealer');
  assert.strictEqual(matched[1].dealer_id, 'further-dealer');
});
