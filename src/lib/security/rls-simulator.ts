/**
 * RLS (Row Level Security) Simulation Engine
 * 
 * Accurately models and verifies the PostgreSQL Row Level Security policies
 * defined in supabase/migrations/20261027000000_init_schema.sql and
 * supabase/migrations/20261027020000_storage_kyc.sql.
 */

export interface AuthContext {
  uid: string | null;
  role: 'seller' | 'dealer' | 'admin' | 'anon';
}

export interface ProfileRecord {
  id: string;
  role: 'seller' | 'dealer' | 'admin';
  name: string;
  phone: string;
  city: string;
}

export interface DealerRecord {
  profile_id: string;
  shop_name: string;
  service_radius_km: number;
  latitude: number;
  longitude: number;
  kyc_status: 'pending' | 'approved' | 'rejected';
  is_active: boolean;
}

export interface ListingRecord {
  id: string;
  seller_id: string;
  status: 'open' | 'offers_received' | 'accepted' | 'completed' | 'cancelled' | 'expired';
  latitude: number;
  longitude: number;
  bid_expires_at: string;
}

export interface OfferRecord {
  id: string;
  listing_id: string;
  dealer_id: string;
  amount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
}

export interface PickupRecord {
  id: string;
  listing_id: string;
  seller_id: string;
  dealer_id: string;
  final_amount: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

export interface DisputeRecord {
  id: string;
  pickup_id: string;
  raised_by: string;
  status: 'opened' | 'under_review' | 'resolved' | 'dismissed';
}

export interface LedgerRecord {
  id: string;
  dealer_id: string;
  amount: number;
  status: 'accrued' | 'settled' | 'waived';
}

export interface StorageObjectRecord {
  bucket_id: string;
  name: string; // e.g. "user-123/aadhaar.jpg"
  owner: string;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * 1. Policy: Profiles are viewable by owner, accepted counterparty, or admin
 */
export function canSelectProfile(
  auth: AuthContext,
  targetProfile: ProfileRecord,
  activePickups: PickupRecord[]
): boolean {
  if (!auth.uid) return false;
  if (auth.role === 'admin') return true;
  if (auth.uid === targetProfile.id) return true;

  // Counterparty rule: only visible if in an accepted/active pickup together
  return activePickups.some(
    (p) =>
      (p.seller_id === auth.uid && p.dealer_id === targetProfile.id) ||
      (p.dealer_id === auth.uid && p.seller_id === targetProfile.id)
  );
}

/**
 * 2. Policy: Active approved dealers are viewable by authenticated users;
 * Unapproved dealers are only viewable by self or admin
 */
export function canSelectDealer(
  auth: AuthContext,
  dealer: DealerRecord
): boolean {
  if (!auth.uid) return false;
  if (auth.role === 'admin') return true;
  if (dealer.profile_id === auth.uid) return true;
  return dealer.is_active && dealer.kyc_status === 'approved';
}

/**
 * 3. Policy: Listings visibility by role and radius
 * - Sellers only see their own listings
 * - Approved active dealers see listings within their service radius
 * - Unapproved dealers or dealers outside radius cannot see listings
 * - Admins can view all
 */
export function canSelectListing(
  auth: AuthContext,
  listing: ListingRecord,
  dealers: DealerRecord[]
): boolean {
  if (!auth.uid) return false;
  if (auth.role === 'admin') return true;
  if (listing.seller_id === auth.uid) return true;

  if (auth.role === 'dealer') {
    const dealer = dealers.find((d) => d.profile_id === auth.uid);
    if (!dealer || !dealer.is_active || dealer.kyc_status !== 'approved') {
      return false;
    }
    const dist = calculateDistance(dealer.latitude, dealer.longitude, listing.latitude, listing.longitude);
    return dist <= dealer.service_radius_km;
  }

  return false;
}

/**
 * 4. Policy: Sellers can update their own listings; admin can update all
 */
export function canUpdateListing(
  auth: AuthContext,
  listing: ListingRecord
): boolean {
  if (!auth.uid) return false;
  if (auth.role === 'admin') return true;
  return listing.seller_id === auth.uid;
}

/**
 * 5. Policy: Offers visibility
 * - Sellers see all offers submitted on their listings
 * - Dealers see ONLY their own submitted offers (cannot spy on competitors)
 * - Admins see all
 */
export function canSelectOffer(
  auth: AuthContext,
  offer: OfferRecord,
  listing: ListingRecord
): boolean {
  if (!auth.uid) return false;
  if (auth.role === 'admin') return true;
  if (offer.dealer_id === auth.uid) return true;
  if (listing.seller_id === auth.uid) return true;
  return false;
}

/**
 * 6. Policy: Dealers can insert offers on open listings within radius
 * - Listing must be open / not expired
 * - Dealer must be approved, active, and within radius
 */
export function canInsertOffer(
  auth: AuthContext,
  listing: ListingRecord,
  dealer: DealerRecord
): { allowed: boolean; reason?: string } {
  if (!auth.uid) return { allowed: false, reason: 'Unauthenticated' };
  if (auth.role !== 'dealer') return { allowed: false, reason: 'Only dealers can submit bids' };
  if (dealer.profile_id !== auth.uid) return { allowed: false, reason: 'Cannot submit bid for another dealer' };
  if (!dealer.is_active || dealer.kyc_status !== 'approved') {
    return { allowed: false, reason: 'KYC approval required to bid' };
  }
  if (listing.status !== 'open' && listing.status !== 'offers_received') {
    return { allowed: false, reason: 'Listing is no longer accepting bids' };
  }
  if (new Date(listing.bid_expires_at).getTime() <= Date.now()) {
    return { allowed: false, reason: 'Bid window has expired' };
  }
  const dist = calculateDistance(dealer.latitude, dealer.longitude, listing.latitude, listing.longitude);
  if (dist > dealer.service_radius_km) {
    return { allowed: false, reason: 'Listing is outside dealer service radius' };
  }
  return { allowed: true };
}

/**
 * 7. Policy: Dealers can withdraw their own pending offers; non-owners cannot
 */
export function canWithdrawOffer(
  auth: AuthContext,
  offer: OfferRecord
): boolean {
  if (!auth.uid) return false;
  if (auth.role === 'admin') return true;
  return offer.dealer_id === auth.uid && offer.status === 'pending';
}

/**
 * 8. Policy: Sellers can accept offers on their listing; other users cannot
 */
export function canAcceptOffer(
  auth: AuthContext,
  offer: OfferRecord,
  listing: ListingRecord
): boolean {
  if (!auth.uid) return false;
  if (auth.role === 'admin') return true;
  if (listing.seller_id !== auth.uid) return false;
  return offer.status === 'pending' && listing.status !== 'expired' && listing.status !== 'cancelled';
}

/**
 * 9. Policy: Pickups visible only to involved parties or admin
 */
export function canSelectPickup(
  auth: AuthContext,
  pickup: PickupRecord
): boolean {
  if (!auth.uid) return false;
  if (auth.role === 'admin') return true;
  return pickup.seller_id === auth.uid || pickup.dealer_id === auth.uid;
}

/**
 * 10. Policy: Disputes visible only to involved parties or admin
 */
export function canSelectDispute(
  auth: AuthContext,
  dispute: DisputeRecord,
  pickup: PickupRecord
): boolean {
  if (!auth.uid) return false;
  if (auth.role === 'admin') return true;
  return pickup.seller_id === auth.uid || pickup.dealer_id === auth.uid;
}

/**
 * 11. Policy: Commission ledger visible only to dealer owner or admin
 */
export function canSelectLedger(
  auth: AuthContext,
  ledger: LedgerRecord
): boolean {
  if (!auth.uid) return false;
  if (auth.role === 'admin') return true;
  return ledger.dealer_id === auth.uid;
}

/**
 * 12. Policy: Storage Objects (KYC bucket)
 * - Private bucket
 * - Dealers only access their own user folder (auth.uid()/...)
 * - Admins access all
 */
export function canAccessKycStorageObject(
  auth: AuthContext,
  object: StorageObjectRecord
): boolean {
  if (!auth.uid) return false;
  if (auth.role === 'admin') return true;
  if (object.bucket_id !== 'kyc-documents') return false;

  const folderName = object.name.split('/')[0];
  return folderName === auth.uid;
}
