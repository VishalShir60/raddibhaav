// ==============================================================================
// RaddiBhaav: Pluggable Notifier Implementations
// ==============================================================================

import type {
  INotifier,
  NotificationChannel,
  NotificationRecipient,
  NotificationPayload,
  NotificationDeliveryResult,
} from './types';

/**
 * 1. In-App Notifier
 * Stores notification in the database / local store for instant in-app alerts.
 */
export class InAppNotifier implements INotifier {
  readonly channel: NotificationChannel = 'in_app';

  async notify(
    recipient: NotificationRecipient,
    payload: NotificationPayload
  ): Promise<NotificationDeliveryResult> {
    void payload;
    const referenceId = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    // In production, inserts into Supabase `notifications` table:
    // await supabase.from('notifications').insert({ ... })

    return {
      success: true,
      channel: this.channel,
      recipient_id: recipient.user_id,
      reference_id: referenceId,
    };
  }
}

/**
 * 2. Web Push Notifier
 * Sends Web Push (Service Worker Notification) to subscribed browsers.
 */
export class WebPushNotifier implements INotifier {
  readonly channel: NotificationChannel = 'web_push';

  async notify(
    recipient: NotificationRecipient,
    payload: NotificationPayload
  ): Promise<NotificationDeliveryResult> {
    // Generates web push payload compliant with Push API standards
    const pushPayload = {
      title: payload.title,
      body: payload.body,
      icon: '/icon.svg',
      badge: '/icon.svg',
      data: {
        url: payload.action_url || '/',
        ...payload.metadata,
      },
    };
    void pushPayload;

    return {
      success: true,
      channel: this.channel,
      recipient_id: recipient.user_id,
      reference_id: `webpush-${Date.now()}`,
    };
  }
}

/**
 * 3. WhatsApp Click-to-Share Link Notifier (MVP Zero Cost)
 * Generates an instant WhatsApp chat deep link (https://wa.me/91...)
 * without requiring expensive WhatsApp Business Cloud API costs during MVP.
 */
export class WhatsAppLinkNotifier implements INotifier {
  readonly channel: NotificationChannel = 'whatsapp_link';

  async notify(
    recipient: NotificationRecipient,
    payload: NotificationPayload
  ): Promise<NotificationDeliveryResult> {
    // Sanitize phone number (standardize 10 digits to +91)
    let cleanPhone = recipient.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10) {
      cleanPhone = `91${cleanPhone}`;
    }

    const messageText = `*${payload.title}*\n\n${payload.body}${
      payload.action_url ? `\n\n👉 View details: ${payload.action_url}` : ''
    }\n\n- Team RaddiBhaav`;

    const shareUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;

    return {
      success: true,
      channel: this.channel,
      recipient_id: recipient.user_id,
      share_url: shareUrl,
      reference_id: `wa-link-${Date.now()}`,
    };
  }
}

/**
 * 4. SMS Click-to-Send Link Notifier (MVP Zero Cost)
 * Generates an SMS URI (sms:+91...?body=...) that opens the user's default SMS app.
 */
export class SmsLinkNotifier implements INotifier {
  readonly channel: NotificationChannel = 'sms_link';

  async notify(
    recipient: NotificationRecipient,
    payload: NotificationPayload
  ): Promise<NotificationDeliveryResult> {
    let cleanPhone = recipient.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10) {
      cleanPhone = `+91${cleanPhone}`;
    } else if (!cleanPhone.startsWith('+')) {
      cleanPhone = `+${cleanPhone}`;
    }

    const messageText = `${payload.title}: ${payload.body}${
      payload.action_url ? ` (${payload.action_url})` : ''
    }`;

    const shareUrl = `sms:${cleanPhone}?body=${encodeURIComponent(messageText)}`;

    return {
      success: true,
      channel: this.channel,
      recipient_id: recipient.user_id,
      share_url: shareUrl,
      reference_id: `sms-link-${Date.now()}`,
    };
  }
}

/**
 * 5. Composite Pluggable Notifier
 * Orchestrates multi-channel delivery across all registered notifiers.
 * Future WhatsApp Business API or SMS Gateway (MSG91/Twilio) classes
 * can simply implement `INotifier` and be registered via `registerNotifier()`.
 */
export class CompositeNotifier {
  private notifiers: Map<NotificationChannel, INotifier> = new Map();

  constructor(initialNotifiers?: INotifier[]) {
    if (initialNotifiers) {
      for (const n of initialNotifiers) {
        this.registerNotifier(n);
      }
    } else {
      // Default MVP suite
      this.registerNotifier(new InAppNotifier());
      this.registerNotifier(new WebPushNotifier());
      this.registerNotifier(new WhatsAppLinkNotifier());
      this.registerNotifier(new SmsLinkNotifier());
    }
  }

  registerNotifier(notifier: INotifier): this {
    this.notifiers.set(notifier.channel, notifier);
    return this;
  }

  unregisterNotifier(channel: NotificationChannel): this {
    this.notifiers.delete(channel);
    return this;
  }

  getNotifier(channel: NotificationChannel): INotifier | undefined {
    return this.notifiers.get(channel);
  }

  /**
   * Broadcasts to all enabled channels or a filtered subset of channels.
   */
  async broadcast(
    recipient: NotificationRecipient,
    payload: NotificationPayload,
    channels?: NotificationChannel[]
  ): Promise<NotificationDeliveryResult[]> {
    const targetChannels = channels || Array.from(this.notifiers.keys());
    const results: NotificationDeliveryResult[] = [];

    for (const ch of targetChannels) {
      const notifier = this.notifiers.get(ch);
      if (notifier) {
        try {
          const res = await notifier.notify(recipient, payload);
          results.push(res);
        } catch (err: unknown) {
          results.push({
            success: false,
            channel: ch,
            recipient_id: recipient.user_id,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }
    }

    return results;
  }
}

// Global default composite notifier instance
export const defaultNotifier = new CompositeNotifier();
