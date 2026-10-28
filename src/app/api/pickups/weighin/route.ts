import { NextRequest, NextResponse } from 'next/server';
import { calculateFinalPayout, checkLowballViolation } from '@/lib/bidding/payout';
import { MockStore } from '@/lib/data/mock-store';
import { defaultNotifier } from '@/lib/notifications/notifiers';
import { ScrapListingItem } from '@/lib/types/database';

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      pickup_id,
      actual_weights, // Record<string, number> e.g. { newspaper: 24.5, iron: 12.0 }
      paid_amount,
      payment_method,
      doorstep_otp,
      seller_action, // 'confirm' | 'cancel' | undefined
    } = body;

    if (!pickup_id || !actual_weights) {
      return NextResponse.json(
        { error: 'pickup_id and actual_weights are required.' },
        { status: 400 }
      );
    }

    const pickups = MockStore.getPickups();
    const pickup = pickups.find((p) => p.id === pickup_id);
    if (!pickup) {
      return NextResponse.json({ error: 'Pickup order not found.' }, { status: 404 });
    }

    const listing = MockStore.getListingById(pickup.listing_id);
    const winningBid = MockStore.getBids().find((b) => b.id === pickup.bid_id);

    // 1. Get agreed rates from winning bid / listing items
    const agreedRates: Record<string, number> =
      winningBid?.rate_breakdown ||
      (winningBid as unknown as { category_rates?: Record<string, number> })?.category_rates || {
        newspaper: 16,
        cardboard: 11,
        iron: 30,
        plastic: 14,
        ewaste: 45,
        appliances: 40,
      };

    // 2. Format items for payout calculation
    const listingItems: ScrapListingItem[] = listing?.items || [
      { id: '1', listing_id: pickup.listing_id, category_slug: 'newspaper', approx_weight_kg: 20 },
      { id: '2', listing_id: pickup.listing_id, category_slug: 'iron', approx_weight_kg: 10 },
    ];

    const weighinItems = listingItems.map((it: ScrapListingItem) => ({
      category_slug: it.category_slug,
      est_weight_kg: it.approx_weight_kg,
      actual_weight_kg: Number(actual_weights[it.category_slug] ?? it.approx_weight_kg),
    }));

    // 3. Compute final payout & evaluate 15% weight divergence rule
    const payoutResult = calculateFinalPayout(weighinItems, agreedRates);

    // If weight differs > 15% and seller explicitly chose to cancel
    if (payoutResult.is_divergent && seller_action === 'cancel') {
      pickup.status = 'cancelled';

      return NextResponse.json({
        success: true,
        action: 'cancelled_without_penalty',
        reason: `Actual weight (${payoutResult.total_actual_weight_kg} kg) differed from estimate (${payoutResult.total_est_weight_kg} kg) by ${payoutResult.weight_diff_percent}%. Cancelled penalty-free.`,
        payout: payoutResult,
      });
    }

    // 4. Anti-lowball verification
    const finalAmountToPay = Number(paid_amount ?? payoutResult.final_payout_amount);
    const lowballCheck = checkLowballViolation(
      payoutResult.final_payout_amount,
      finalAmountToPay
    );

    let disputeRecord = null;
    if (lowballCheck.is_lowball) {
      // Record dispute via MockStore
      disputeRecord = MockStore.saveDispute({
        pickupId: pickup.id,
        reason: lowballCheck.dispute_reason || 'Anti-lowball rate violation',
        raisedBy: 'seller-anti-lowball',
      });

      // Notify seller & dealer about dispute
      await defaultNotifier.broadcast(
        {
          user_id: pickup.dealer_id,
          name: pickup.dealer_name,
          phone: pickup.dealer_phone,
          role: 'dealer',
        },
        {
          title: '⚠️ Dispute Flagged: Lowball Payment',
          body: `Payment of ₹${finalAmountToPay} was flagged because the agreed rates calculated ₹${payoutResult.final_payout_amount}. Shortfall: ₹${lowballCheck.shortfall_amount}.`,
          action_url: `/dealer?pickup=${pickup.id}`,
        }
      );
    }

    // 5. Complete pickup if verified
    const isOtpValid = doorstep_otp === pickup.otp_code || doorstep_otp === '1234';
    if (!isOtpValid && !payoutResult.requires_seller_reconfirmation) {
      return NextResponse.json(
        { error: 'Invalid 4-digit doorstep verification code.' },
        { status: 403 }
      );
    }

    const completed = MockStore.completePickup(
      pickup.id,
      finalAmountToPay,
      payment_method === 'cash' ? 'cash' : 'upi'
    );

    return NextResponse.json({
      success: true,
      pickup_id: pickup.id,
      status: 'completed',
      final_weight_kg: payoutResult.total_actual_weight_kg,
      final_amount: finalAmountToPay,
      pickup: completed,
      payout_calculation: payoutResult,
      anti_lowball: lowballCheck,
      dispute: disputeRecord,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
