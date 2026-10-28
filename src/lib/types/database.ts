// ==============================================================================
// RaddiBhaav: Supabase TypeScript Definitions
// Auto-generated types matching supabase/migrations/20261027000000_init_schema.sql
// ==============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ------------------------------------------------------------------------------
// Domain Enums & Literal Unions
// ------------------------------------------------------------------------------

export type UserRole = 'seller' | 'dealer' | 'admin';

export type KycStatus = 'pending' | 'approved' | 'rejected';

export type ListingStatus = 
  | 'open'
  | 'offers_received'
  | 'accepted'
  | 'completed'
  | 'cancelled'
  | 'expired'
  // Legacy aliases for backwards-compatibility with initial demo components
  | 'open_for_bids'
  | 'bid_accepted'
  | 'pickup_scheduled'
  | 'in_progress';

export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';
export type BidStatus = OfferStatus | 'submitted' | 'expired';

export type PickupStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'arrived' | 'weighing';

export type PaymentMethod = 'cash' | 'upi' | 'other';

export type DisputeStatus = 'open' | 'investigating' | 'resolved' | 'dismissed';

export type LedgerStatus = 'recorded' | 'waived' | 'paid' | 'accrued' | 'waived_in_mvp' | 'settled';

// ------------------------------------------------------------------------------
// Exact Table Row Definitions
// ------------------------------------------------------------------------------

export interface Profile {
  id: string; // References auth.users(id)
  role: UserRole;
  name: string;
  phone: string;
  language: 'en' | 'hi' | 'mr';
  city: string;
  created_at: string;
  updated_at: string;
  // UI helper optional fields
  full_name?: string;
  avatar_url?: string;
  address?: string;
  pincode?: string;
}

export interface Dealer {
  profile_id: string; // References profiles(id)
  shop_name: string;
  service_radius_km: number;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  } | string;
  kyc_status: KycStatus;
  kyc_docs: Json;
  rating_avg: number;
  total_pickups: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Listing {
  id: string;
  seller_id: string; // References profiles(id)
  address: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  } | string;
  pickup_window: string;
  status: ListingStatus;
  bid_expires_at: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ListingItem {
  id: string;
  listing_id: string; // References listings(id)
  category: string;
  est_weight_kg: number;
  photo_urls: string[];
  created_at: string;
}

export interface Offer {
  id: string;
  listing_id: string; // References listings(id)
  dealer_id: string; // References dealers(profile_id)
  amount: number;
  note: string | null;
  status: OfferStatus;
  created_at: string;
  updated_at: string;
}

export interface Pickup {
  id: string;
  listing_id: string; // References listings(id)
  offer_id: string; // References offers(id)
  final_weight_kg: number | null;
  final_amount: number | null;
  payment_method: PaymentMethod | null;
  status: PickupStatus;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RateCard {
  id: string;
  category: string;
  min_rate: number;
  max_rate: number;
  city: string;
  updated_at: string;
}

export interface Rating {
  id: string;
  pickup_id: string; // References pickups(id)
  from_user: string; // References profiles(id)
  to_user: string; // References profiles(id)
  stars: number; // 1 to 5
  comment: string | null;
  created_at: string;
}

export interface Dispute {
  id: string;
  pickup_id: string; // References pickups(id)
  raised_by: string; // References profiles(id)
  reason: string;
  status: DisputeStatus;
  resolution: string | null;
  created_at: string;
  updated_at: string;
}

export interface CommissionLedger {
  id: string;
  dealer_id: string; // References dealers(profile_id)
  pickup_id: string; // References pickups(id)
  amount: number;
  status: LedgerStatus;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string; // References profiles(id)
  title: string;
  message: string;
  type: string;
  read: boolean;
  metadata: Json;
  created_at: string;
}

// ------------------------------------------------------------------------------
// View Definitions
// ------------------------------------------------------------------------------

export interface ListingsFeedView {
  id: string;
  seller_id: string;
  address: string; // Masked until bid acceptance for dealers
  location: {
    type: 'Point';
    coordinates: [number, number];
  } | string;
  pickup_window: string;
  status: ListingStatus;
  bid_expires_at: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ------------------------------------------------------------------------------
// Stored Procedure Function Signatures
// ------------------------------------------------------------------------------

export interface FindNearbyDealersParams {
  target_listing_id: string;
}

export interface NearbyDealerResult {
  dealer_id: string;
  shop_name: string;
  phone: string;
  rating_avg: number;
  total_pickups: number;
  service_radius_km: number;
  distance_km: number;
  location: unknown;
}

// ------------------------------------------------------------------------------
// Comprehensive Supabase Database Schema Interface
// ------------------------------------------------------------------------------

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Profile, 'id'>>;
        Relationships: [];
      };
      dealers: {
        Row: Dealer;
        Insert: Omit<Dealer, 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Dealer, 'profile_id'>>;
        Relationships: [];
      };
      listings: {
        Row: Listing;
        Insert: Omit<Listing, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Listing, 'id'>>;
        Relationships: [];
      };
      listing_items: {
        Row: ListingItem;
        Insert: Omit<ListingItem, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<ListingItem, 'id'>>;
        Relationships: [];
      };
      offers: {
        Row: Offer;
        Insert: Omit<Offer, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Offer, 'id'>>;
        Relationships: [];
      };
      pickups: {
        Row: Pickup;
        Insert: Omit<Pickup, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Pickup, 'id'>>;
        Relationships: [];
      };
      rate_cards: {
        Row: RateCard;
        Insert: Omit<RateCard, 'id' | 'updated_at'> & {
          id?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<RateCard, 'id'>>;
        Relationships: [];
      };
      ratings: {
        Row: Rating;
        Insert: Omit<Rating, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Rating, 'id'>>;
        Relationships: [];
      };
      disputes: {
        Row: Dispute;
        Insert: Omit<Dispute, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Dispute, 'id'>>;
        Relationships: [];
      };
      commission_ledger: {
        Row: CommissionLedger;
        Insert: Omit<CommissionLedger, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<CommissionLedger, 'id'>>;
        Relationships: [];
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Notification, 'id'>>;
        Relationships: [];
      };
    };
    Views: {
      listings_feed: {
        Row: ListingsFeedView;
        Relationships: [];
      };
    };
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      has_accepted_deal: {
        Args: { user_a: string; user_b: string };
        Returns: boolean;
      };
      check_and_expire_listings: {
        Args: Record<string, never>;
        Returns: number;
      };
      find_nearby_dealers: {
        Args: FindNearbyDealersParams;
        Returns: NearbyDealerResult[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// ------------------------------------------------------------------------------
// UI Composite & Convenience Models (for seamless client-side state)
// ------------------------------------------------------------------------------

export interface ScrapCategory {
  id: string;
  slug: string;
  name_en: string;
  name_hi: string;
  name_mr: string;
  icon: string;
  unit: string;
  benchmark_price_min: number;
  benchmark_price_max: number;
  trend: 'up' | 'down' | 'stable';
  display_order: number;
}

export interface ScrapListingItem {
  id: string;
  listing_id: string;
  category_slug: string;
  approx_weight_kg: number;
  final_weight_kg?: number;
  agreed_rate_per_kg?: number;
  final_item_total?: number;
}

export interface ScrapListing {
  id: string;
  seller_id: string;
  title: string;
  status: ListingStatus;
  address: string;
  city: string;
  pincode: string;
  latitude: number;
  longitude: number;
  preferred_time_slot: string;
  bid_window_expires_at: string;
  photos: string[];
  total_approx_weight_kg: number;
  items: ScrapListingItem[];
  created_at: string;
  updated_at: string;
  bids_count?: number;
  highest_bid?: number;
}

export interface DealerBid {
  id: string;
  listing_id: string;
  dealer_id: string;
  dealer_name: string;
  dealer_rating: number;
  dealer_distance_km: number;
  dealer_pickups_count?: number;
  total_estimated_amount: number;
  rate_breakdown: Record<string, number>;
  pickup_date: string;
  pickup_slot: string;
  eta_minutes: number;
  notes?: string;
  status: BidStatus;
  created_at: string;
}

export interface PickupOrder {
  id: string;
  listing_id: string;
  bid_id: string;
  seller_id: string;
  dealer_id: string;
  dealer_name: string;
  dealer_phone: string;
  status: PickupStatus;
  scheduled_at: string;
  completed_at?: string;
  payment_method?: PaymentMethod;
  final_total_amount?: number;
  final_weight_kg?: number;
  otp_code: string;
  seller_rating?: number;
  seller_feedback?: string;
  seller_rating_reason?: string;
  dealer_rating?: number;
  dealer_feedback?: string;
  dealer_rating_reason?: string;
  created_at: string;
}

export interface DealerProfile {
  dealer_id: string;
  business_name: string;
  is_verified: boolean;
  kyc_status?: KycStatus;
  rating: number;
  total_orders: number;
  radius_km: number;
  upi_id?: string;
  scale_certified: boolean;
  created_at: string;
}

export interface DealerLedgerEntry {
  id: string;
  dealer_id: string;
  pickup_id: string;
  deal_amount: number;
  commission_rate: number;
  commission_amount: number;
  status: LedgerStatus;
  notes: string;
  created_at: string;
}

// ------------------------------------------------------------------------------
// Admin Domain Models
// ------------------------------------------------------------------------------

export interface DealerKycDocument {
  doc_type: 'aadhaar' | 'shop_photo' | 'trade_license';
  title: string;
  url: string;
  uploaded_at: string;
}

export interface AdminDealerUser {
  dealer_id: string;
  business_name: string;
  owner_name: string;
  phone: string;
  city: string;
  address: string;
  is_verified: boolean;
  kyc_status: KycStatus;
  kyc_rejection_reason?: string;
  kyc_documents: DealerKycDocument[];
  is_suspended: boolean;
  suspension_reason?: string;
  rating: number;
  total_orders: number;
  radius_km: number;
  upi_id?: string;
  scale_certified: boolean;
  created_at: string;
}

export interface AdminSellerUser {
  seller_id: string;
  name: string;
  phone: string;
  city: string;
  address: string;
  total_listings: number;
  completed_pickups: number;
  is_suspended: boolean;
  suspension_reason?: string;
  created_at: string;
}

export interface AdminDisputeRecord {
  id: string;
  pickup_id: string;
  listing_id: string;
  seller_name: string;
  seller_phone: string;
  dealer_name: string;
  dealer_phone: string;
  reason: string;
  category: 'lowball_payment' | 'weight_mismatch' | 'no_show' | 'behavior';
  expected_amount: number;
  actual_paid_amount: number;
  shortfall: number;
  status: 'open' | 'investigating' | 'resolved';
  evidence_photos: string[];
  chat_notes: Array<{
    author: string;
    role: 'seller' | 'dealer' | 'admin';
    message: string;
    timestamp: string;
  }>;
  resolution_outcome?: string;
  resolution_notes?: string;
  created_at: string;
  resolved_at?: string;
}

export interface PlatformSettings {
  commission_percent: number;
  commission_waived_in_mvp: boolean;
  bid_window_default_hours: number;
  bid_window_auto_extend_hours: number;
  service_radius_default_km: number;
  service_radius_expansion_km: number;
  min_offers_before_close: number;
  weight_divergence_threshold_percent: number;
}

export interface AdminMetrics {
  listings_per_day: number;
  total_listings: number;
  avg_offers_per_listing: number;
  acceptance_rate_percent: number;
  completed_pickups: number;
  gmv_rupees: number;
  commission_accrued_rupees: number;
  commission_waived_rupees: number;
  avg_bid_spread_rupees: number;
}
