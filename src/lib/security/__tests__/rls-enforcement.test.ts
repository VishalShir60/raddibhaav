import test from 'node:test';
import assert from 'node:assert';
import {
  canSelectProfile,
  canSelectDealer,
  canSelectListing,
  canUpdateListing,
  canSelectOffer,
  canInsertOffer,
  canWithdrawOffer,
  canAcceptOffer,
  canSelectPickup,
  canSelectDispute,
  canSelectLedger,
  canAccessKycStorageObject,
  type AuthContext,
  type ProfileRecord,
  type DealerRecord,
  type ListingRecord,
  type OfferRecord,
  type PickupRecord,
  type DisputeRecord,
  type LedgerRecord,
  type StorageObjectRecord,
} from '../rls-simulator.ts';

// Test Actors
const sellerA: AuthContext = { uid: 'seller-a', role: 'seller' };
const sellerB: AuthContext = { uid: 'seller-b', role: 'seller' };
const dealerApproved: AuthContext = { uid: 'dealer-1', role: 'dealer' };
const dealerCompeting: AuthContext = { uid: 'dealer-2', role: 'dealer' };
const dealerUnapproved: AuthContext = { uid: 'dealer-unverified', role: 'dealer' };
const adminUser: AuthContext = { uid: 'admin-1', role: 'admin' };
const anonUser: AuthContext = { uid: null, role: 'anon' };

const profileSellerB: ProfileRecord = {
  id: 'seller-b',
  role: 'seller',
  name: 'Sunita Sharma',
  phone: '9876543210',
  city: 'Mumbai',
};

const dealerRecord1: DealerRecord = {
  profile_id: 'dealer-1',
  shop_name: 'Gupta Traders',
  service_radius_km: 5.0,
  latitude: 19.0760,
  longitude: 72.8777,
  kyc_status: 'approved',
  is_active: true,
};

const dealerRecordUnapproved: DealerRecord = {
  profile_id: 'dealer-unverified',
  shop_name: 'Pending Shop',
  service_radius_km: 5.0,
  latitude: 19.0760,
  longitude: 72.8777,
  kyc_status: 'pending',
  is_active: true,
};

const listingSellerA: ListingRecord = {
  id: 'list-101',
  seller_id: 'seller-a',
  status: 'open',
  latitude: 19.0760,
  longitude: 72.8777, // Same location as dealer-1
  bid_expires_at: new Date(Date.now() + 3600000).toISOString(),
};

const listingFarAway: ListingRecord = {
  id: 'list-far',
  seller_id: 'seller-a',
  status: 'open',
  latitude: 19.9975, // Nashik (~140 km from Mumbai)
  longitude: 73.7898,
  bid_expires_at: new Date(Date.now() + 3600000).toISOString(),
};

test('RLS Profile: Seller A cannot read Seller B profile unless counterparty in pickup', () => {
  assert.strictEqual(canSelectProfile(sellerA, profileSellerB, []), false);
  assert.strictEqual(canSelectProfile(anonUser, profileSellerB, []), false);

  // Self can read
  assert.strictEqual(canSelectProfile(sellerB, profileSellerB, []), true);

  // Admin can read
  assert.strictEqual(canSelectProfile(adminUser, profileSellerB, []), true);

  // When involved in an active pickup together, dealer can see seller profile
  const pickup: PickupRecord = {
    id: 'pk-1',
    listing_id: 'list-101',
    seller_id: 'seller-b',
    dealer_id: 'dealer-1',
    final_amount: 500,
    status: 'scheduled',
  };
  assert.strictEqual(canSelectProfile(dealerApproved, profileSellerB, [pickup]), true);
});

test('RLS Dealer: Unapproved dealer is NOT visible to public or other dealers', () => {
  assert.strictEqual(canSelectDealer(anonUser, dealerRecordUnapproved), false);
  assert.strictEqual(canSelectDealer(dealerCompeting, dealerRecordUnapproved), false);

  // Unapproved dealer can view own profile
  assert.strictEqual(canSelectDealer(dealerUnapproved, dealerRecordUnapproved), true);

  // Admin can view unapproved dealer
  assert.strictEqual(canSelectDealer(adminUser, dealerRecordUnapproved), true);

  // Approved dealer is visible to authenticated users
  assert.strictEqual(canSelectDealer(sellerA, dealerRecord1), true);
});

test('RLS Listing: Unapproved dealer or dealer outside radius cannot see listings', () => {
  const dealers = [dealerRecord1, dealerRecordUnapproved];

  // Unapproved dealer cannot see
  assert.strictEqual(canSelectListing(dealerUnapproved, listingSellerA, dealers), false);

  // Approved dealer within radius can see
  assert.strictEqual(canSelectListing(dealerApproved, listingSellerA, dealers), true);

  // Approved dealer outside radius cannot see
  assert.strictEqual(canSelectListing(dealerApproved, listingFarAway, dealers), false);

  // Another seller (Seller B) cannot see Seller A's listing
  assert.strictEqual(canSelectListing(sellerB, listingSellerA, dealers), false);

  // Admin can view all
  assert.strictEqual(canSelectListing(adminUser, listingSellerA, dealers), true);
});

test('RLS Listing: Seller B cannot update Seller A listing', () => {
  assert.strictEqual(canUpdateListing(sellerB, listingSellerA), false);
  assert.strictEqual(canUpdateListing(dealerApproved, listingSellerA), false);
  assert.strictEqual(canUpdateListing(sellerA, listingSellerA), true);
  assert.strictEqual(canUpdateListing(adminUser, listingSellerA), true);
});

test('RLS Offers: Competing dealer cannot view another dealer offer on open listing', () => {
  const offerDealer1: OfferRecord = {
    id: 'off-1',
    listing_id: 'list-101',
    dealer_id: 'dealer-1',
    amount: 600,
    status: 'pending',
  };

  // Competing dealer (dealer-2) MUST NOT be able to view dealer-1's offer
  assert.strictEqual(canSelectOffer(dealerCompeting, offerDealer1, listingSellerA), false);

  // Anonymous user cannot view
  assert.strictEqual(canSelectOffer(anonUser, offerDealer1, listingSellerA), false);

  // Seller who owns the listing CAN view
  assert.strictEqual(canSelectOffer(sellerA, offerDealer1, listingSellerA), true);

  // Dealer-1 CAN view their own offer
  assert.strictEqual(canSelectOffer(dealerApproved, offerDealer1, listingSellerA), true);

  // Admin CAN view
  assert.strictEqual(canSelectOffer(adminUser, offerDealer1, listingSellerA), true);
});

test('RLS Offers: Prevents unauthorized bid insertion', () => {
  // Seller cannot submit offer
  assert.strictEqual(canInsertOffer(sellerA, listingSellerA, dealerRecord1).allowed, false);

  // Unapproved dealer cannot submit offer
  const unapprovedCheck = canInsertOffer(dealerUnapproved, listingSellerA, dealerRecordUnapproved);
  assert.strictEqual(unapprovedCheck.allowed, false);
  assert.strictEqual(unapprovedCheck.reason, 'KYC approval required to bid');

  // Dealer outside service radius cannot submit offer
  const outOfRadiusCheck = canInsertOffer(dealerApproved, listingFarAway, dealerRecord1);
  assert.strictEqual(outOfRadiusCheck.allowed, false);
  assert.strictEqual(outOfRadiusCheck.reason, 'Listing is outside dealer service radius');

  // Dealer bidding for another dealer ID fails
  const impersonateCheck = canInsertOffer(dealerCompeting, listingSellerA, dealerRecord1);
  assert.strictEqual(impersonateCheck.allowed, false);

  // Valid approved dealer within radius succeeds
  assert.strictEqual(canInsertOffer(dealerApproved, listingSellerA, dealerRecord1).allowed, true);
});

test('RLS Offers: Dealer B cannot withdraw Dealer A offer', () => {
  const offer: OfferRecord = {
    id: 'off-1',
    listing_id: 'list-101',
    dealer_id: 'dealer-1',
    amount: 600,
    status: 'pending',
  };

  assert.strictEqual(canWithdrawOffer(dealerCompeting, offer), false);
  assert.strictEqual(canWithdrawOffer(sellerA, offer), false);
  assert.strictEqual(canWithdrawOffer(dealerApproved, offer), true);
});

test('RLS Offers: Non-owner seller cannot accept offer', () => {
  const offer: OfferRecord = {
    id: 'off-1',
    listing_id: 'list-101',
    dealer_id: 'dealer-1',
    amount: 600,
    status: 'pending',
  };

  assert.strictEqual(canAcceptOffer(sellerB, offer, listingSellerA), false);
  assert.strictEqual(canAcceptOffer(dealerApproved, offer, listingSellerA), false);
  assert.strictEqual(canAcceptOffer(sellerA, offer, listingSellerA), true);
});

test('RLS Pickups & Ledger: Third-party cannot view pickups or commission ledger', () => {
  const pickup: PickupRecord = {
    id: 'pk-1',
    listing_id: 'list-101',
    seller_id: 'seller-a',
    dealer_id: 'dealer-1',
    final_amount: 550,
    status: 'completed',
  };

  const ledger: LedgerRecord = {
    id: 'led-1',
    dealer_id: 'dealer-1',
    amount: 25,
    status: 'accrued',
  };

  // Third party (Seller B or Dealer 2) cannot see pickup
  assert.strictEqual(canSelectPickup(sellerB, pickup), false);
  assert.strictEqual(canSelectPickup(dealerCompeting, pickup), false);

  // Involved parties can see
  assert.strictEqual(canSelectPickup(sellerA, pickup), true);
  assert.strictEqual(canSelectPickup(dealerApproved, pickup), true);

  // Dispute visibility policy: only counter-parties or admin
  const dispute: DisputeRecord = {
    id: 'disp-1',
    pickup_id: 'pk-1',
    raised_by: 'seller-a',
    status: 'opened',
  };
  assert.strictEqual(canSelectDispute(sellerB, dispute, pickup), false);
  assert.strictEqual(canSelectDispute(dealerCompeting, dispute, pickup), false);
  assert.strictEqual(canSelectDispute(sellerA, dispute, pickup), true);
  assert.strictEqual(canSelectDispute(dealerApproved, dispute, pickup), true);
  assert.strictEqual(canSelectDispute(adminUser, dispute, pickup), true);

  // Dealer 2 cannot see Dealer 1's commission ledger
  assert.strictEqual(canSelectLedger(dealerCompeting, ledger), false);
  assert.strictEqual(canSelectLedger(sellerA, ledger), false);
  assert.strictEqual(canSelectLedger(dealerApproved, ledger), true);
  assert.strictEqual(canSelectLedger(adminUser, ledger), true);
});

test('RLS Storage: Dealer cannot view another dealer KYC document', () => {
  const docDealer1: StorageObjectRecord = {
    bucket_id: 'kyc-documents',
    name: 'dealer-1/aadhaar-front.jpg',
    owner: 'dealer-1',
  };

  // Competing dealer cannot view
  assert.strictEqual(canAccessKycStorageObject(dealerCompeting, docDealer1), false);
  assert.strictEqual(canAccessKycStorageObject(sellerA, docDealer1), false);
  assert.strictEqual(canAccessKycStorageObject(anonUser, docDealer1), false);

  // Dealer 1 can view own doc
  assert.strictEqual(canAccessKycStorageObject(dealerApproved, docDealer1), true);

  // Admin can view all KYC docs
  assert.strictEqual(canAccessKycStorageObject(adminUser, docDealer1), true);
});
