// ==============================================================================
// RaddiBhaav: Pluggable Notification System Types
// ==============================================================================

export type NotificationChannel =
  | 'in_app'
  | 'web_push'
  | 'whatsapp_link'
  | 'sms_link'
  | 'whatsapp_business_api'
  | 'sms_gateway_api';

export interface NotificationRecipient {
  user_id: string;
  name: string;
  phone: string;
  role: 'seller' | 'dealer' | 'admin';
  preferred_language?: 'en' | 'hi' | 'mr';
}

export interface NotificationPayload {
  title: string;
  body: string;
  action_url?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationDeliveryResult {
  success: boolean;
  channel: NotificationChannel;
  recipient_id: string;
  reference_id?: string;
  share_url?: string; // For click-to-share WhatsApp or SMS links in MVP
  error?: string;
}

/**
 * Pluggable Notifier Interface.
 * Any delivery mechanism (In-App, Web Push, MVP Click Link, or Enterprise API)
 * implements this interface.
 */
export interface INotifier {
  readonly channel: NotificationChannel;
  notify(
    recipient: NotificationRecipient,
    payload: NotificationPayload
  ): Promise<NotificationDeliveryResult>;
}
