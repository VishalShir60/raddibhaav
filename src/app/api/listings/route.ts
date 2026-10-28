import { NextRequest, NextResponse } from 'next/server';
import { findNearbyApprovedDealers } from '@/lib/bidding/matching';
import { createInitialBidExpiresAt } from '@/lib/bidding/expiry';
import { defaultNotifier } from '@/lib/notifications/notifiers';
import { MockStore } from '@/lib/data/mock-store';
import { batchModerateListingPhotos } from '@/lib/media/image-moderation';
import { detectSellerCancellationAbuse } from '@/lib/security/abuse-prevention';
import type { DealerRawRecord } from '@/lib/bidding/matching';

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { seller_id, address, coordinates, items, photos, pickup_window, bid_window_hours } = body;

    if (!seller_id || !coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      return NextResponse.json(
        { error: 'Invalid coordinates. Expected [longitude, latitude].' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Scrap items array cannot be empty.' },
        { status: 400 }
      );
    }

    // Photo Requirement: Minimum 1 photo required per listing
    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return NextResponse.json(
        { error: 'Photo requirement: At least 1 clear photo of your scrap is required for dealers to submit bids.' },
        { status: 400 }
      );
    }

    // Image Moderation Hook: Verify scrap relevance and safe content
    const moderation = await batchModerateListingPhotos(photos);
    if (!moderation.allApproved) {
      return NextResponse.json(
        {
          error: 'Image moderation failed',
          details: moderation.failedReason,
        },
        { status: 422 }
      );
    }

    // Abuse Prevention: Check seller cancellation frequency
    const existingListings = MockStore.getListings().filter((l) => l.seller_id === seller_id);
    const abuseCheck = detectSellerCancellationAbuse(existingListings);
    if (abuseCheck.action === 'block_new_listings') {
      return NextResponse.json(
        {
          error: 'Account temporarily restricted from creating new listings',
          details: abuseCheck.message,
        },
        { status: 403 }
      );
    }

    // 1. Calculate bid window expiration (default 2 hours, or configurable)
    const windowHours = Number(bid_window_hours) > 0 ? Number(bid_window_hours) : 2;
    const bidExpiresAt = createInitialBidExpiresAt(new Date(), {
      defaultHours: windowHours,
      autoExtendHours: 1,
      minOffersForClose: 2,
      radiusExpansionKm: 3,
    });

    const listingId = `listing-${Date.now()}`;

    // Record listing in store
    MockStore.saveListing({
      id: listingId,
      seller_id,
      title: `${items.length} Scrap Items`,
      status: 'open',
      address: address || 'Mumbai',
      city: 'Mumbai',
      pincode: '400001',
      latitude: coordinates[1],
      longitude: coordinates[0],
      preferred_time_slot: pickup_window || 'Morning (9 AM - 12 PM)',
      bid_window_expires_at: bidExpiresAt,
      photos: [],
      total_approx_weight_kg: items.reduce(
        (sum: number, it: { approx_weight_kg?: number }) => sum + (it.approx_weight_kg || 0),
        0
      ),
      items: items.map(
        (it: { category_slug: string; approx_weight_kg?: number }, idx: number) => ({
          id: `item-${listingId}-${idx}`,
          listing_id: listingId,
          category_slug: it.category_slug,
          approx_weight_kg: it.approx_weight_kg || 10,
        })
      ),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      bids_count: 0,
    });

    // 2. Query nearby approved dealers
    // In production: SELECT * FROM public.find_nearby_dealers(listing_id)
    // For local mock / serverless fallback:
    const mockDealers: DealerRawRecord[] = [
      {
        dealer_id: 'dealer-1',
        shop_name: 'Gupta Scrap & Metal Traders',
        phone: '9876543210',
        service_radius_km: 5.0,
        coordinates: [72.8777, 19.0760], // Mumbai Central
        kyc_status: 'approved',
        is_active: true,
        rating_avg: 4.8,
        total_pickups: 240,
      },
      {
        dealer_id: 'dealer-2',
        shop_name: 'Star Eco Recyclers',
        phone: '9820011223',
        service_radius_km: 7.0,
        coordinates: [72.8680, 19.0820],
        kyc_status: 'approved',
        is_active: true,
        rating_avg: 4.9,
        total_pickups: 512,
      },
      {
        dealer_id: 'dealer-3',
        shop_name: 'Om Sai Paper Mart',
        phone: '9819998877',
        service_radius_km: 3.5,
        coordinates: [72.8900, 19.0650],
        kyc_status: 'approved',
        is_active: true,
        rating_avg: 4.6,
        total_pickups: 89,
      },
      {
        dealer_id: 'dealer-unverified',
        shop_name: 'Pending Kabadiwala',
        phone: '9811122233',
        service_radius_km: 10.0,
        coordinates: [72.8700, 19.0700],
        kyc_status: 'pending', // Must be ignored
        is_active: true,
        rating_avg: 0,
        total_pickups: 0,
      },
    ];

    const nearbyDealers = findNearbyApprovedDealers(
      coordinates as [number, number],
      mockDealers
    );

    // 3. Notify all nearby approved dealers via pluggable notifier
    const notificationResults = [];
    for (const dealer of nearbyDealers) {
      const results = await defaultNotifier.broadcast(
        {
          user_id: dealer.dealer_id,
          name: dealer.shop_name,
          phone: dealer.phone,
          role: 'dealer',
        },
        {
          title: 'New Scrap Request Nearby! 📦',
          body: `A new request (~${items.length} categories) was posted ${dealer.distance_km} km away. Submit your offer before the ${windowHours}h window closes!`,
          action_url: `/dealer?listing=${listingId}`,
          metadata: { listing_id: listingId, distance_km: dealer.distance_km },
        }
      );
      notificationResults.push({ dealer_id: dealer.dealer_id, delivery: results });
    }

    return NextResponse.json({
      success: true,
      listing_id: listingId,
      bid_expires_at: bidExpiresAt,
      bid_window_hours: windowHours,
      notified_dealers_count: nearbyDealers.length,
      dealers_matched: nearbyDealers.map((d) => ({
        dealer_id: d.dealer_id,
        shop_name: d.shop_name,
        distance_km: d.distance_km,
      })),
      notifications: notificationResults,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
