import test from 'node:test';
import assert from 'node:assert';
import {
  checkOtpRateLimit,
  checkOfferRateLimit,
  detectSellerCancellationAbuse,
  detectLowballOffer,
  _resetRateLimits,
} from '../abuse-prevention.ts';
import {
  moderateListingPhoto,
  batchModerateListingPhotos,
} from '../../media/image-moderation.ts';

test('checkOtpRateLimit: allows up to 3 OTP requests and blocks 4th within window', () => {
  _resetRateLimits();
  const phone = '9876543210';
  const now = 1700000000000;

  // 1st request
  const r1 = checkOtpRateLimit(phone, 3, 600, now);
  assert.strictEqual(r1.allowed, true);
  assert.strictEqual(r1.remaining, 2);

  // 2nd request
  const r2 = checkOtpRateLimit(phone, 3, 600, now + 1000);
  assert.strictEqual(r2.allowed, true);
  assert.strictEqual(r2.remaining, 1);

  // 3rd request
  const r3 = checkOtpRateLimit(phone, 3, 600, now + 2000);
  assert.strictEqual(r3.allowed, true);
  assert.strictEqual(r3.remaining, 0);

  // 4th request (should be blocked)
  const r4 = checkOtpRateLimit(phone, 3, 600, now + 3000);
  assert.strictEqual(r4.allowed, false);
  assert.strictEqual(r4.remaining, 0);
  assert.ok(r4.error?.includes('Too many OTP requests'));

  // After 601 seconds, sliding window clears oldest
  const r5 = checkOtpRateLimit(phone, 3, 600, now + 601000);
  assert.strictEqual(r5.allowed, true);
});

test('checkOfferRateLimit: enforces max 10 offers per minute per dealer', () => {
  _resetRateLimits();
  const dealerId = 'dealer-speed-1';
  const now = 1700000000000;

  for (let i = 0; i < 10; i++) {
    const res = checkOfferRateLimit(dealerId, 10, 60, now + i * 100);
    assert.strictEqual(res.allowed, true);
  }

  // 11th offer within 60s should be blocked
  const blocked = checkOfferRateLimit(dealerId, 10, 60, now + 1500);
  assert.strictEqual(blocked.allowed, false);
  assert.ok(blocked.error?.includes('Offer rate limit exceeded'));
});

test('detectSellerCancellationAbuse: flags accounts with high cancellation rate', () => {
  const now = 1700000000000;
  const oneDayAgo = new Date(now - 86400 * 1000).toISOString();
  const twoDaysAgo = new Date(now - 2 * 86400 * 1000).toISOString();
  const eightDaysAgo = new Date(now - 8 * 86400 * 1000).toISOString(); // Outside 7-day lookback

  // Normal: 1 cancellation
  const listingsNormal = [
    { id: 'l1', status: 'completed', created_at: oneDayAgo },
    { id: 'l2', status: 'cancelled', created_at: twoDaysAgo },
  ];
  const resNormal = detectSellerCancellationAbuse(listingsNormal, 3, 7, now);
  assert.strictEqual(resNormal.abuseDetected, false);
  assert.strictEqual(resNormal.action, 'none');

  // Warning: 3 cancellations
  const listingsWarn = [
    { id: 'l1', status: 'cancelled', created_at: oneDayAgo },
    { id: 'l2', status: 'cancelled', created_at: twoDaysAgo },
    { id: 'l3', status: 'cancelled', created_at: oneDayAgo },
    { id: 'lOld', status: 'cancelled', created_at: eightDaysAgo }, // Ignored
  ];
  const resWarn = detectSellerCancellationAbuse(listingsWarn, 3, 7, now);
  assert.strictEqual(resWarn.abuseDetected, false);
  assert.strictEqual(resWarn.action, 'warning');

  // Block: 4 cancellations in 7 days
  const listingsBlock = [
    ...listingsWarn,
    { id: 'l4', status: 'cancelled', created_at: oneDayAgo },
  ];
  const resBlock = detectSellerCancellationAbuse(listingsBlock, 3, 7, now);
  assert.strictEqual(resBlock.abuseDetected, true);
  assert.strictEqual(resBlock.action, 'block_new_listings');
  assert.ok(resBlock.message?.includes('temporarily restricted'));
});

test('detectLowballOffer: rejects predatory offers >40% below benchmark floor', () => {
  const benchmarkFloor = 1000;

  // Fair offer (₹1100 >= ₹1000)
  const fair = detectLowballOffer(1100, benchmarkFloor);
  assert.strictEqual(fair.action, 'allow');
  assert.strictEqual(fair.isLowball, false);

  // Exact floor (₹1000)
  const exact = detectLowballOffer(1000, benchmarkFloor);
  assert.strictEqual(exact.action, 'allow');

  // Slight below floor (₹850 = 15% below)
  const slight = detectLowballOffer(850, benchmarkFloor);
  assert.strictEqual(slight.action, 'allow');

  // Warning range (₹700 = 30% below)
  const warn = detectLowballOffer(700, benchmarkFloor);
  assert.strictEqual(warn.action, 'warn');
  assert.strictEqual(warn.isLowball, true);

  // Predatory lowball (₹500 = 50% below, exceeds 40% cap)
  const predatory = detectLowballOffer(500, benchmarkFloor);
  assert.strictEqual(predatory.action, 'reject');
  assert.strictEqual(predatory.isLowball, true);
  assert.ok(predatory.message?.includes('Predatory lowballing'));
});

test('image-moderation: verifies photo relevance and flags hazardous/empty content', async () => {
  // Empty array
  const empty = await batchModerateListingPhotos([]);
  assert.strictEqual(empty.allApproved, false);
  assert.ok(empty.failedReason?.includes('At least 1 photo is required'));

  // Valid scrap photo
  const valid = await moderateListingPhoto('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...');
  assert.strictEqual(valid.approved, true);

  // Prohibited/hazardous keyword simulation
  const hazardous = await moderateListingPhoto('https://example.com/hazardous_chemical_barrel.jpg');
  assert.strictEqual(hazardous.approved, false);
  assert.strictEqual(hazardous.flags.includes('PROHIBITED_OR_HAZARDOUS_CONTENT'), true);

  // Batch with one hazardous photo
  const batch = await batchModerateListingPhotos([
    'https://images.unsplash.com/photo-scrap.jpg',
    'https://images.unsplash.com/photo-weapon-test.jpg',
  ]);
  assert.strictEqual(batch.allApproved, false);
  assert.ok(batch.failedReason?.includes('Prohibited or hazardous scrap'));
});
