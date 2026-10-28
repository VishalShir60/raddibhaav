import { NextRequest, NextResponse } from 'next/server';
import { evaluateBidWindow } from '@/lib/bidding/expiry';
import { findNearbyApprovedDealers, DealerRawRecord } from '@/lib/bidding/matching';
import { defaultNotifier } from '@/lib/notifications/notifiers';
import { MockStore } from '@/lib/data/mock-store';

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const listingId = body.listing_id;

    const listings = listingId
      ? [MockStore.getListingById(listingId)].filter(Boolean)
      : MockStore.getListings().filter(
          (l) => l.status === 'open' || l.status === 'offers_received' || l.status === 'open_for_bids'
        );

    const results = [];

    const mockDealers: DealerRawRecord[] = [
      {
        dealer_id: 'dealer-1',
        shop_name: 'Gupta Scrap & Metal Traders',
        phone: '9876543210',
        service_radius_km: 4.0,
        coordinates: [72.8777, 19.0760],
        kyc_status: 'approved',
        is_active: true,
        rating_avg: 4.8,
        total_pickups: 240,
      },
      {
        dealer_id: 'dealer-2',
        shop_name: 'Star Eco Recyclers',
        phone: '9820011223',
        service_radius_km: 6.0,
        coordinates: [72.8680, 19.0820],
        kyc_status: 'approved',
        is_active: true,
        rating_avg: 4.9,
        total_pickups: 512,
      },
      {
        dealer_id: 'dealer-expanded-1',
        shop_name: 'Bharat Metal Scrap (Widened Radius)',
        phone: '9833344455',
        service_radius_km: 4.0, // Initially out of range (6.2 km), eligible after +3km expansion
        coordinates: [72.8200, 19.0500],
        kyc_status: 'approved',
        is_active: true,
        rating_avg: 4.7,
        total_pickups: 180,
      },
    ];

    for (const listing of listings) {
      if (!listing) continue;
      const offers = MockStore.getBids().filter((b) => b.listing_id === listing.id);
      const offersCount = offers.filter((o) => o.status !== 'withdrawn').length;

      const evaluation = evaluateBidWindow(
        {
          id: listing.id,
          created_at: listing.created_at,
          bid_expires_at: listing.bid_window_expires_at,
          auto_extended: (listing as unknown as { auto_extended?: boolean }).auto_extended,
          widened_radius_km: (listing as unknown as { widened_radius_km?: number }).widened_radius_km,
        },
        offersCount
      );

      if (evaluation.status === 'extended') {
        // Find newly eligible dealers with widened radius (+3 km)
        const coords: [number, number] = [listing.longitude || 72.8777, listing.latitude || 19.0760];
        const newDealers = findNearbyApprovedDealers(
          coords,
          mockDealers,
          evaluation.widened_radius_km
        );

        // Notify new dealers
        for (const dealer of newDealers) {
          await defaultNotifier.broadcast(
            {
              user_id: dealer.dealer_id,
              name: dealer.shop_name,
              phone: dealer.phone,
              role: 'dealer',
            },
            {
              title: 'Urgent Scrap Request (Radius Extended)! ⚡',
              body: `Bidding was extended by 1 hour for a nearby listing (${dealer.distance_km} km away). Compete now!`,
              action_url: `/dealer?listing=${listing.id}`,
              metadata: { listing_id: listing.id, extended: true },
            }
          );
        }

        results.push({
          listing_id: listing.id,
          action: 'extended',
          evaluation,
          new_dealers_notified: newDealers.length,
        });
      } else if (evaluation.status === 'closed') {
        results.push({
          listing_id: listing.id,
          action: 'closed',
          evaluation,
        });
      } else {
        results.push({
          listing_id: listing.id,
          action: 'active',
          evaluation,
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed_count: listings.length,
      results,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
