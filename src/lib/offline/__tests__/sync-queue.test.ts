import test from 'node:test';
import assert from 'node:assert';
import {
  enqueueOfflineAction,
  getQueuedActions,
  removeQueuedAction,
  clearOfflineQueue,
  syncOfflineQueue,
} from '../sync-queue.ts';

// Setup Mock Browser Environment for Node test runner
class MockLocalStorage {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}

const mockStorage = new MockLocalStorage();

// @ts-expect-error Mocking window in node environment
globalThis.window = {
  dispatchEvent: () => true,
};
// @ts-expect-error Mocking localStorage in node environment
globalThis.localStorage = mockStorage;

try {
  Object.defineProperty(globalThis.navigator, 'onLine', {
    value: true,
    configurable: true,
    writable: true,
  });
} catch {
  // If navigator cannot be overridden
}

test('OfflineSyncQueue: starts with empty queue', () => {
  mockStorage.clear();
  const queue = getQueuedActions();
  assert.strictEqual(queue.length, 0);
});

test('OfflineSyncQueue: enqueues SUBMIT_OFFER action correctly', () => {
  mockStorage.clear();
  const payload = { listing_id: 'lst-101', total_amount: 550, rates: { newspaper: 16 } };
  const action = enqueueOfflineAction('SUBMIT_OFFER', payload);

  assert.ok(action.id.startsWith('offline-'));
  assert.strictEqual(action.type, 'SUBMIT_OFFER');
  assert.strictEqual(action.retryCount, 0);
  assert.deepStrictEqual(action.payload, payload);

  const queue = getQueuedActions();
  assert.strictEqual(queue.length, 1);
  assert.strictEqual(queue[0].id, action.id);
});

test('OfflineSyncQueue: enqueues COMPLETE_WEIGHIN action correctly', () => {
  const payload = {
    pickup_id: 'pk-99',
    listing_id: 'lst-101',
    final_weight_kg: 34.5,
    final_amount: 552,
    payment_method: 'upi',
  };
  const action = enqueueOfflineAction('COMPLETE_WEIGHIN', payload);

  assert.strictEqual(action.type, 'COMPLETE_WEIGHIN');
  const queue = getQueuedActions();
  assert.strictEqual(queue.length, 2);
});

test('OfflineSyncQueue: removes action by ID', () => {
  const queueBefore = getQueuedActions();
  const targetId = queueBefore[0].id;

  removeQueuedAction(targetId);
  const queueAfter = getQueuedActions();
  assert.strictEqual(queueAfter.length, queueBefore.length - 1);
  assert.strictEqual(queueAfter.some((a) => a.id === targetId), false);
});

test('OfflineSyncQueue: clearOfflineQueue empties everything', () => {
  clearOfflineQueue();
  const queue = getQueuedActions();
  assert.strictEqual(queue.length, 0);
});

test('OfflineSyncQueue: syncOfflineQueue handles successful responses and retries', async () => {
  clearOfflineQueue();

  enqueueOfflineAction('SUBMIT_OFFER', { listing_id: 'l1', amount: 500 });
  enqueueOfflineAction('COMPLETE_WEIGHIN', { listing_id: 'l2', weight: 20 });

  // Mock global fetch to succeed for offer, fail for weighin
  let fetchCallCount = 0;
  // @ts-expect-error Mocking fetch
  globalThis.fetch = async (url: string) => {
    fetchCallCount += 1;
    if (url === '/api/offers') {
      return { ok: true, status: 200 } as Response;
    }
    // Simulate temporary server 500 or network failure
    return { ok: false, status: 500 } as Response;
  };

  const result = await syncOfflineQueue();
  assert.strictEqual(result.syncedCount, 1);
  assert.strictEqual(result.remainingCount, 1);
  assert.strictEqual(fetchCallCount, 2);

  // Check that remaining action has retryCount incremented
  const remaining = getQueuedActions();
  assert.strictEqual(remaining.length, 1);
  assert.strictEqual(remaining[0].type, 'COMPLETE_WEIGHIN');
  assert.strictEqual(remaining[0].retryCount, 1);
});
