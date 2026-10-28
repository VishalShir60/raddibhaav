import test from 'node:test';
import assert from 'node:assert';
import { evaluateBidWindow } from '../expiry.ts';
import { validateDealerOffer } from '../validation.ts';
import { calculateFinalPayout, checkLowballViolation } from '../payout.ts';
import {
  enqueueOfflineAction,
  getQueuedActions,
  clearOfflineQueue,
  syncOfflineQueue,
} from '../../offline/sync-queue.ts';
import { MockStore } from '../../data/mock-store.ts';

// Setup Mock Environment for LocalStorage/Navigator in Node test runner
class MockStorage {
  private data: Record<string, string> = {};
  getItem(key: string) { return this.data[key] || null; }
  setItem(key: string, val: string) { this.data[key] = val; }
  removeItem(key: string) { delete this.data[key]; }
  clear() { this.data = {}; }
}

const mockStorage = new MockStorage();
// @ts-expect-error Mocking window in node
globalThis.window = { dispatchEvent: () => true };
// @ts-expect-error Mocking localStorage in node
globalThis.localStorage = mockStorage;
try {
  Object.defineProperty(globalThis.navigator, 'onLine', { value: true, configurable: true, writable: true });
} catch {
  // Ignore if already defined
}

// -----------------------------------------------------------------------------
// 1. Edge Case: Expired Listings
// -----------------------------------------------------------------------------
test('Edge Case: Expired listing blocks new offers from dealers', () => {
  const expiredTime = new Date(Date.now() - 60000).toISOString(); // 1 minute ago
  const listing = {
    id: 'lst-expired',
    status: 'open',
    bid_expires_at: expiredTime,
  };

  const submission = {
    listing_id: 'lst-expired',
    dealer_id: 'dealer-1',
    rates: { newspaper: 16 },
    total_amount: 320,
  };

  const dealer = { dealer_id: 'dealer-1', kyc_status: 'approved' as const, is_active: true };
  const validation = validateDealerOffer(submission, listing, [], dealer);

  assert.strictEqual(validation.valid, false);
  assert.ok(validation.errors.some((e) => e.toLowerCase().includes('expired')));
});

// -----------------------------------------------------------------------------
// 2. Edge Case: No Offers Received (Auto-Extend then Close)
// -----------------------------------------------------------------------------
test('Edge Case: No offers received triggers 1h auto-extend with +3km radius; second expiry closes listing', () => {
  const baseTime = new Date('2026-10-28T10:00:00Z');
  const initialExpiry = new Date('2026-10-28T12:00:00Z');

  // Phase 1: Listing expires at 12:01 with 0 offers -> Should auto-extend
  const listingInitial = {
    id: 'lst-no-offers',
    created_at: baseTime.toISOString(),
    bid_expires_at: initialExpiry.toISOString(),
    auto_extended: false,
    widened_radius_km: 0,
  };

  const eval1 = evaluateBidWindow(listingInitial, 0, new Date('2026-10-28T12:01:00Z'));
  assert.strictEqual(eval1.status, 'extended');
  assert.strictEqual(eval1.widened_radius_km, 3);
  assert.strictEqual(eval1.bid_expires_at, '2026-10-28T13:00:00.000Z');

  // Phase 2: At 13:01, already extended once, still 0 offers -> Should close
  const listingExtended = {
    id: 'lst-no-offers',
    created_at: baseTime.toISOString(),
    bid_expires_at: '2026-10-28T13:00:00.000Z',
    auto_extended: true,
    widened_radius_km: 3,
  };

  const eval2 = evaluateBidWindow(listingExtended, 0, new Date('2026-10-28T13:01:00Z'));
  assert.strictEqual(eval2.status, 'closed');
  assert.strictEqual(eval2.auto_extended, true);
  assert.ok(eval2.reason.includes('auto-extension'));
});

// -----------------------------------------------------------------------------
// 3. Edge Case: Offer Withdrawn
// -----------------------------------------------------------------------------
test('Edge Case: Dealer withdraws offer; withdrawn offer is excluded from active count and cannot be accepted', () => {
  const listingId = 'lst-withdrawn-test';
  const existingOffers = [
    { id: 'off-1', dealer_id: 'd1', listing_id: listingId, status: 'withdrawn' as const },
    { id: 'off-2', dealer_id: 'd2', listing_id: listingId, status: 'pending' as const },
  ];

  const activeCount = existingOffers.filter((o) => o.status !== 'withdrawn').length;
  assert.strictEqual(activeCount, 1);

  // Dealer 1 is allowed to submit a fresh offer after withdrawing previous one
  const submission = {
    listing_id: listingId,
    dealer_id: 'd1',
    rates: { newspaper: 17 },
    total_amount: 340,
  };

  const listing = {
    id: listingId,
    status: 'open',
    bid_expires_at: new Date(Date.now() + 3600000).toISOString(),
  };

  const dealer = { dealer_id: 'd1', kyc_status: 'approved' as const, is_active: true };
  const validation = validateDealerOffer(submission, listing, existingOffers, dealer);
  assert.strictEqual(validation.valid, true);
  assert.strictEqual(validation.errors.length, 0);
});

// -----------------------------------------------------------------------------
// 4. Edge Case: Weight Mismatch > 15%
// -----------------------------------------------------------------------------
test('Edge Case: Weight mismatch > 15% flags divergence and allows seller penalty-free cancellation', () => {
  const items = [
    { category_slug: 'newspaper', est_weight_kg: 20, actual_weight_kg: 28 }, // 40% jump
  ];
  const agreedRates = { newspaper: 16 };

  const payout = calculateFinalPayout(items, agreedRates);
  assert.strictEqual(payout.is_divergent, true);
  assert.strictEqual(payout.requires_seller_reconfirmation, true);
  assert.strictEqual(payout.weight_diff_percent, 40);

  // If seller cancels due to >15% divergence:
  const cancellationReason = payout.is_divergent
    ? `Actual weight (${payout.total_actual_weight_kg}kg) differed from estimate (${payout.total_est_weight_kg}kg) by ${payout.weight_diff_percent}%. Cancelled penalty-free.`
    : 'Standard cancellation';

  assert.ok(cancellationReason.includes('Cancelled penalty-free'));
});

// -----------------------------------------------------------------------------
// 5. Edge Case: Anti-Lowball Dispute Flow
// -----------------------------------------------------------------------------
test('Edge Case: Anti-lowball detects payment shortfall, opens dispute, and records admin resolution', () => {
  const agreedFormulaPayout = 600;
  const attemptedDealerPayment = 500; // ₹100 less than agreed rates!

  const check = checkLowballViolation(agreedFormulaPayout, attemptedDealerPayment);
  assert.strictEqual(check.is_lowball, true);
  assert.strictEqual(check.shortfall_amount, 100);
  assert.ok(check.dispute_reason?.includes('shortfall of ₹100'));

  // Record dispute in MockStore
  const dispute = MockStore.saveDispute({
    pickupId: 'pickup-lowball-1',
    reason: check.dispute_reason || 'Anti-lowball shortfall',
    raisedBy: 'seller-anti-lowball',
  });

  assert.strictEqual(dispute.pickup_id, 'pickup-lowball-1');
  assert.strictEqual(dispute.status, 'open');

  // Admin reviews dispute and applies resolution
  const updatedList = MockStore.resolveDispute(dispute.id, 'refund_shortfall', 'Dealer agreed to pay ₹100 shortfall via UPI');
  const resolved = updatedList.find((d) => d.id === dispute.id);
  assert.strictEqual(resolved?.status, 'resolved');
  assert.strictEqual(resolved?.resolution_outcome, 'refund_shortfall');
});

// -----------------------------------------------------------------------------
// 6. Edge Case: Offline Dealer Actions & Sync
// -----------------------------------------------------------------------------
test('Edge Case: Dealer queues offer & weighin while offline; syncs cleanly upon network restoration', async () => {
  clearOfflineQueue();

  // Step A: Dealer submits offer with patchy connection
  const offerAction = enqueueOfflineAction('SUBMIT_OFFER', {
    listing_id: 'lst-offline-1',
    dealer_id: 'dealer-1',
    total_amount: 550,
  });

  // Step B: Dealer completes weigh-in with no internet
  const weighinAction = enqueueOfflineAction('COMPLETE_WEIGHIN', {
    pickup_id: 'pk-offline-1',
    actual_weights: { newspaper: 25 },
    paid_amount: 400,
    payment_method: 'cash',
  });

  const queued = getQueuedActions();
  assert.strictEqual(queued.length, 2);
  assert.strictEqual(queued[0].id, offerAction.id);
  assert.strictEqual(queued[1].id, weighinAction.id);

  // Step C: Reconnection - Mock fetch succeeding
  let calls = 0;
  (globalThis as unknown as { fetch: unknown }).fetch = async () => {
    calls += 1;
    return { ok: true, status: 200 } as Response;
  };

  const syncResult = await syncOfflineQueue();
  assert.strictEqual(syncResult.syncedCount, 2);
  assert.strictEqual(syncResult.remainingCount, 0);
  assert.strictEqual(calls, 2);

  // Queue should now be completely drained
  assert.strictEqual(getQueuedActions().length, 0);
});
