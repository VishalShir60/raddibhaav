import test from 'node:test';
import assert from 'node:assert';
import {
  evaluateBidWindow,
  createInitialBidExpiresAt,
} from '../expiry.ts';

test('createInitialBidExpiresAt: sets 2 hours from current time by default', () => {
  const baseTime = new Date('2026-10-27T10:00:00Z');
  const expiresAt = createInitialBidExpiresAt(baseTime);

  assert.strictEqual(expiresAt, '2026-10-27T12:00:00.000Z');
});

test('evaluateBidWindow: returns active when current time is before expiration', () => {
  const listing = {
    id: 'l1',
    created_at: '2026-10-27T10:00:00Z',
    bid_expires_at: '2026-10-27T12:00:00Z',
  };

  const now = new Date('2026-10-27T11:15:00Z');
  const result = evaluateBidWindow(listing, 1, now);

  assert.strictEqual(result.status, 'active');
  assert.strictEqual(result.bid_expires_at, listing.bid_expires_at);
  assert.strictEqual(result.auto_extended, false);
});

test('evaluateBidWindow: auto-extends once by 1 hour and +3 km when < 2 offers arrive', () => {
  const listing = {
    id: 'l1',
    created_at: '2026-10-27T10:00:00Z',
    bid_expires_at: '2026-10-27T12:00:00Z',
    auto_extended: false,
    widened_radius_km: 0,
  };

  // Time is 12:01 PM (window expired), but only 1 offer has arrived
  const now = new Date('2026-10-27T12:01:00Z');
  const result = evaluateBidWindow(listing, 1, now);

  assert.strictEqual(result.status, 'extended');
  assert.strictEqual(result.auto_extended, true);
  assert.strictEqual(result.widened_radius_km, 3);
  assert.strictEqual(result.bid_expires_at, '2026-10-27T13:00:00.000Z'); // 1 hour after original 12:00
});

test('evaluateBidWindow: does NOT extend if already extended once (closes instead)', () => {
  const listing = {
    id: 'l1',
    created_at: '2026-10-27T10:00:00Z',
    bid_expires_at: '2026-10-27T13:00:00Z',
    auto_extended: true, // Already extended previously
    widened_radius_km: 3,
  };

  // Time is 13:01 PM, still only 1 offer arrived
  const now = new Date('2026-10-27T13:01:00Z');
  const result = evaluateBidWindow(listing, 1, now);

  assert.strictEqual(result.status, 'closed');
  assert.strictEqual(result.auto_extended, true);
  assert.strictEqual(result.widened_radius_km, 3);
});

test('evaluateBidWindow: closes when >= 2 offers have arrived at expiration', () => {
  const listing = {
    id: 'l1',
    created_at: '2026-10-27T10:00:00Z',
    bid_expires_at: '2026-10-27T12:00:00Z',
    auto_extended: false,
  };

  // Time is 12:00 PM, 3 competing offers arrived
  const now = new Date('2026-10-27T12:00:00Z');
  const result = evaluateBidWindow(listing, 3, now);

  assert.strictEqual(result.status, 'closed');
  assert.strictEqual(result.auto_extended, false);
});
