import { NextRequest, NextResponse } from 'next/server';
import { validateDealerOffer } from '@/lib/bidding/validation';
import { defaultNotifier } from '@/lib/notifications/notifiers';
import { MockStore, INITIAL_CATEGORIES } from '@/lib/data/mock-store';
import { checkOfferRateLimit, detectLowballOffer } from '@/lib/security/abuse-prevention';

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { listing_id, dealer_id, rates, total_amount, notes, eta_minutes, pickup_slot } = body;

    if (!listing_id || !dealer_id) {
      return NextResponse.json(
        { error: 'listing_id and dealer_id are required.' },
        { status: 400 }
      );
    }

    // 1. Rate Limiting on Offer Submission (Max 10 offers per minute per dealer)
    const rateLimit = checkOfferRateLimit(dealer_id);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          details: rateLimit.error,
          resetInSeconds: rateLimit.resetInSeconds,
        },
        { status: 429 }
      );
    }

    // 2. Fetch listing and dealer status (from MockStore or Supabase)
    const listing = MockStore.getListingById(listing_id);
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found.' }, { status: 404 });
    }

    // 3. Anti-Lowball Abuse Detection (Floor validation against Mandi benchmark)
    const benchmarkMin = (listing.items || []).reduce((acc, it) => {
      const cat = INITIAL_CATEGORIES.find((c) => c.slug === it.category_slug);
      const minRate = cat ? cat.benchmark_price_min : 10;
      return acc + (it.approx_weight_kg || 1) * minRate;
    }, 0);

    const lowballCheck = detectLowballOffer(Number(total_amount), benchmarkMin);
    if (lowballCheck.action === 'reject') {
      return NextResponse.json(
        {
          error: 'Predatory offer rejected',
          details: lowballCheck.message,
          benchmarkMin,
        },
        { status: 422 }
      );
    }

    const dealerKycStatus = MockStore.getDealerKycStatus();
    const dealerKycCheck = {
      dealer_id,
      kyc_status: dealerKycStatus,
      is_active: true,
    };

    const existingOffers = MockStore.getBids()
      .filter((b) => b.listing_id === listing_id)
      .map((b) => ({
        id: b.id,
        dealer_id: b.dealer_id,
        listing_id: b.listing_id,
        status: b.status,
      }));

    // 2. Validate offer submission
    const validation = validateDealerOffer(
      {
        listing_id,
        dealer_id,
        rates: rates || {},
        total_amount: Number(total_amount),
        notes,
        eta_minutes,
        pickup_slot,
      },
      {
        id: listing.id,
        status: listing.status,
        bid_expires_at: listing.bid_window_expires_at,
      },
      existingOffers,
      dealerKycCheck
    );

    if (!validation.valid) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.errors,
        },
        { status: 422 }
      );
    }

    // 3. Record offer
    const newOffer = {
      id: `bid-${Date.now()}`,
      listing_id,
      dealer_id,
      dealer_name: 'Gupta Scrap Traders',
      dealer_rating: 4.8,
      dealer_distance_km: 1.2,
      total_estimated_amount: Number(total_amount),
      rate_breakdown: rates || {},
      category_rates: rates,
      notes: notes || 'Certified electronic scale with instant UPI/Cash',
      eta_minutes: eta_minutes || 30,
      pickup_date: new Date().toISOString().split('T')[0],
      pickup_slot: pickup_slot || 'Morning (10:00 AM)',
      status: 'submitted' as const,
      created_at: new Date().toISOString(),
    };

    MockStore.saveBid(newOffer);

    // 4. Notify seller of competing offer
    const sellerNotification = await defaultNotifier.broadcast(
      {
        user_id: listing.seller_id,
        name: 'Seller',
        phone: '9876500000',
        role: 'seller',
      },
      {
        title: 'New Competing Scrap Offer! 💰',
        body: `A verified kabadiwala offered ₹${total_amount} for your scrap. Compare competing offers now!`,
        action_url: `/bids?listing=${listing_id}`,
        metadata: { listing_id, offer_id: newOffer.id, amount: total_amount },
      }
    );

    return NextResponse.json({
      success: true,
      offer: newOffer,
      seller_notified: sellerNotification,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
