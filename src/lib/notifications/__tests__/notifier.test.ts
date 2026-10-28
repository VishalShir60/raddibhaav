import test from 'node:test';
import assert from 'node:assert';
import {
  InAppNotifier,
  WebPushNotifier,
  WhatsAppLinkNotifier,
  SmsLinkNotifier,
  CompositeNotifier,
} from '../notifiers.ts';

test('WhatsAppLinkNotifier: generates zero-cost click-to-chat URL with proper phone and URI encoding', async () => {
  const notifier = new WhatsAppLinkNotifier();
  const recipient = {
    user_id: 'd1',
    name: 'Gupta Traders',
    phone: '9876543210',
    role: 'dealer' as const,
  };

  const payload = {
    title: 'New Scrap Request! 📦',
    body: 'Household in Bandra posted 35 kg scrap.',
    action_url: 'https://raddibhaav.in/dealer?listing=123',
  };

  const res = await notifier.notify(recipient, payload);
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.channel, 'whatsapp_link');
  assert.ok(res.share_url?.startsWith('https://wa.me/919876543210?text='));
  assert.ok(res.share_url?.includes(encodeURIComponent('New Scrap Request! 📦')));
});

test('SmsLinkNotifier: generates standard sms: URI with encoded body', async () => {
  const notifier = new SmsLinkNotifier();
  const recipient = {
    user_id: 's1',
    name: 'Household Seller',
    phone: '9820011223',
    role: 'seller' as const,
  };

  const payload = {
    title: 'Offer Received',
    body: 'A dealer offered ₹550.',
    action_url: 'https://raddibhaav.in/bids?listing=123',
  };

  const res = await notifier.notify(recipient, payload);
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.channel, 'sms_link');
  assert.ok(res.share_url?.startsWith('sms:+919820011223?body='));
});

test('CompositeNotifier: broadcasts across all registered channels and supports custom providers', async () => {
  const composite = new CompositeNotifier();

  const recipient = {
    user_id: 'u1',
    name: 'Test User',
    phone: '9876543210',
    role: 'dealer' as const,
  };

  const payload = {
    title: 'Test Notification',
    body: 'Testing multi-channel delivery',
  };

  const results = await composite.broadcast(recipient, payload);
  assert.strictEqual(results.length, 4); // in_app, web_push, whatsapp_link, sms_link
  assert.ok(results.every((r) => r.success));

  // Test targeting specific channels only
  const waOnly = await composite.broadcast(recipient, payload, ['whatsapp_link']);
  assert.strictEqual(waOnly.length, 1);
  assert.strictEqual(waOnly[0].channel, 'whatsapp_link');
});

test('InAppNotifier & WebPushNotifier: deliver in-app references and push payloads', async () => {
  const inApp = new InAppNotifier();
  const webPush = new WebPushNotifier();

  const recipient = {
    user_id: 'u2',
    name: 'Seller 2',
    phone: '9811122233',
    role: 'seller' as const,
  };

  const payload = {
    title: 'Offer Accepted',
    body: 'Dealer will arrive today.',
  };

  const inAppRes = await inApp.notify(recipient, payload);
  assert.strictEqual(inAppRes.success, true);
  assert.strictEqual(inAppRes.channel, 'in_app');
  assert.ok(inAppRes.reference_id?.startsWith('notif-'));

  const pushRes = await webPush.notify(recipient, payload);
  assert.strictEqual(pushRes.success, true);
  assert.strictEqual(pushRes.channel, 'web_push');
  assert.ok(pushRes.reference_id?.startsWith('webpush-'));
});
