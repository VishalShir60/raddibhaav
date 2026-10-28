import test from 'node:test';
import assert from 'node:assert';
import { validateDealerOffer } from '../validation.ts';
import type { ExistingOfferCheck } from '../validation.ts';

test('validateDealerOffer: passes for valid offer from approved dealer on active listing', () => {
  const submission = {
    listing_id: 'l1',
    dealer_id: 'd1',
    rates: { newspaper: 16, iron: 30 },
    total_amount: 500,
  };

  const listing = {
    id: 'l1',
    status: 'open',
    bid_expires_at: new Date(Date.now() + 3600000).toISOString(),
  };

  const existingOffers: ExistingOfferCheck[] = [];
  const dealer = { dealer_id: 'd1', kyc_status: 'approved' as const, is_active: true };

  const result = validateDealerOffer(submission, listing, existingOffers, dealer);
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.errors.length, 0);
});

test('validateDealerOffer: blocks duplicate active offer from same dealer', () => {
  const submission = {
    listing_id: 'l1',
    dealer_id: 'd1',
    rates: { newspaper: 16 },
    total_amount: 320,
  };

  const listing = {
    id: 'l1',
    status: 'open',
    bid_expires_at: new Date(Date.now() + 3600000).toISOString(),
  };

  const existingOffers = [
    { id: 'b1', dealer_id: 'd1', listing_id: 'l1', status: 'pending' },
  ];

  const dealer = { dealer_id: 'd1', kyc_status: 'approved' as const, is_active: true };

  const result = validateDealerOffer(submission, listing, existingOffers, dealer);
  assert.strictEqual(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes('Duplicate offer')));
});

test('validateDealerOffer: blocks unapproved KYC dealer', () => {
  const submission = {
    listing_id: 'l1',
    dealer_id: 'd-unverified',
    rates: { newspaper: 16 },
    total_amount: 320,
  };

  const listing = {
    id: 'l1',
    status: 'open',
    bid_expires_at: new Date(Date.now() + 3600000).toISOString(),
  };

  const dealer = { dealer_id: 'd-unverified', kyc_status: 'pending' as const, is_active: true };

  const result = validateDealerOffer(submission, listing, [], dealer);
  assert.strictEqual(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes('KYC is not approved')));
});

test('validateDealerOffer: rejects non-positive amounts and crazy out-of-bound rates', () => {
  const submissionZero = {
    listing_id: 'l1',
    dealer_id: 'd1',
    rates: { newspaper: 16 },
    total_amount: 0, // <= 0
  };

  const submissionCrazyRate = {
    listing_id: 'l1',
    dealer_id: 'd1',
    rates: { newspaper: 50000 }, // 50,000/kg is insane
    total_amount: 50000,
  };

  const listing = {
    id: 'l1',
    status: 'open',
    bid_expires_at: new Date(Date.now() + 3600000).toISOString(),
  };

  const dealer = { dealer_id: 'd1', kyc_status: 'approved' as const, is_active: true };

  const resZero = validateDealerOffer(submissionZero, listing, [], dealer);
  assert.strictEqual(resZero.valid, false);
  assert.ok(resZero.errors.some((e) => e.includes('must be greater than zero')));

  const resCrazy = validateDealerOffer(submissionCrazyRate, listing, [], dealer);
  assert.strictEqual(resCrazy.valid, false);
  assert.ok(resCrazy.errors.some((e) => e.includes('outside sane bounds')));
});
