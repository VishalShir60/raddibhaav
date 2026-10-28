import test from 'node:test';
import assert from 'node:assert';
import {
  calculateFinalPayout,
  checkLowballViolation,
} from '../payout.ts';

test('calculateFinalPayout: correctly computes payout based on actual weights and category rates', () => {
  const items = [
    { category_slug: 'newspaper', est_weight_kg: 20, actual_weight_kg: 22 },
    { category_slug: 'iron', est_weight_kg: 10, actual_weight_kg: 10 },
  ];

  const rates = {
    newspaper: 16, // 22 * 16 = 352
    iron: 30,      // 10 * 30 = 300
  };

  const payout = calculateFinalPayout(items, rates);

  assert.strictEqual(payout.final_payout_amount, 652);
  assert.strictEqual(payout.total_est_weight_kg, 30);
  assert.strictEqual(payout.total_actual_weight_kg, 32);
});

test('calculateFinalPayout: enforces 15% Final-Weight rule (divergence <= 15% is standard)', () => {
  // Estimated: 100 kg. Actual: 110 kg (+10% difference <= 15%)
  const items = [
    { category_slug: 'newspaper', est_weight_kg: 100, actual_weight_kg: 110 },
  ];

  const rates = { newspaper: 15 };
  const payout = calculateFinalPayout(items, rates);

  assert.strictEqual(payout.weight_diff_percent, 10);
  assert.strictEqual(payout.is_divergent, false);
  assert.strictEqual(payout.requires_seller_reconfirmation, false);
  assert.strictEqual(payout.can_cancel_without_penalty, false);
});

test('calculateFinalPayout: enforces 15% Final-Weight rule (divergence > 15% allows penalty-free cancel)', () => {
  // Estimated: 50 kg. Actual: 35 kg (-30% difference > 15%)
  const items = [
    { category_slug: 'newspaper', est_weight_kg: 50, actual_weight_kg: 35 },
  ];

  const rates = { newspaper: 16 };
  const payout = calculateFinalPayout(items, rates);

  assert.strictEqual(payout.weight_diff_percent, 30);
  assert.strictEqual(payout.is_divergent, true);
  assert.strictEqual(payout.requires_seller_reconfirmation, true);
  assert.strictEqual(payout.can_cancel_without_penalty, true);
});

test('checkLowballViolation: passes when paid amount matches or exceeds formula calculation', () => {
  const expected = 500;
  const actualPaid = 500;

  const result = checkLowballViolation(expected, actualPaid);
  assert.strictEqual(result.is_lowball, false);
  assert.strictEqual(result.shortfall_amount, 0);
  assert.strictEqual(result.action, 'none');
});

test('checkLowballViolation: flags dispute when dealer attempts to pay less than agreed rates', () => {
  const expected = 600;
  const actualPaid = 450; // Dealer tries to shortchange by ₹150

  const result = checkLowballViolation(expected, actualPaid);
  assert.strictEqual(result.is_lowball, true);
  assert.strictEqual(result.shortfall_amount, 150);
  assert.strictEqual(result.action, 'open_dispute');
  assert.ok(result.dispute_reason?.includes('shortfall of ₹150'));
});
