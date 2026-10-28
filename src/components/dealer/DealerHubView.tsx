'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { MockStore, INITIAL_CATEGORIES } from '@/lib/data/mock-store';
import { ScrapListing, DealerBid, PickupOrder, DealerLedgerEntry, KycStatus } from '@/lib/types/database';
import { 
  Store, 
  MapPin, 
  Clock, 
  Scale, 
  Banknote, 
  QrCode, 
  ShieldCheck, 
  Send, 
  CheckCircle2, 
  Calendar,
  AlertTriangle,
  Phone,
  MessageCircle,
  Navigation,
  Star,
  X,
  Trash2
} from 'lucide-react';
import { DealerTrustBadges } from '@/components/common/DealerTrustBadges';
import { LoyaltyReferralCard } from '@/components/common/LoyaltyReferralCard';
import { enqueueOfflineAction } from '@/lib/offline/sync-queue';
import { OptimizedImage } from '@/components/common/OptimizedImage';

export function DealerHubView() {
  const t = useTranslations('dealer');

  // Active dealer navigation tab
  const [activeTab, setActiveTab] = useState<'requests' | 'won_jobs' | 'ledger' | 'ratings'>('requests');

  // State from MockStore
  const [listings] = useState<ScrapListing[]>(() => MockStore.getListings());
  const [pickups, setPickups] = useState<PickupOrder[]>(() => MockStore.getPickups());
  const [ledger, setLedger] = useState<DealerLedgerEntry[]>(() => MockStore.getLedger());
  const [ratings, setRatings] = useState(() => MockStore.getRatings());
  const [bidsVersion, setBidsVersion] = useState(0);

  // KYC state (defaults to 'approved', can be toggled for testing)
  const [kycStatus, setKycStatus] = useState<KycStatus>(() => MockStore.getDealerKycStatus());

  // Current dealer ID for demo
  const currentDealerId = 'dealer-1';

  // Selected listing for detail & one-tap offer modal
  const [selectedListing, setSelectedListing] = useState<ScrapListing | null>(null);
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState<number>(0);
  const [offerAmount, setOfferAmount] = useState<number>(0);
  const [offerNotes, setOfferNotes] = useState<string>('Certified electronic scale available, instant GooglePay/Cash.');
  const [offerEta, setOfferEta] = useState<number>(30);
  const [offerSlot, setOfferSlot] = useState<string>('Morning (10:00 AM)');
  const [submittingBid, setSubmittingBid] = useState(false);

  // Doorstep Weigh-in modal state
  const [weighinPickup, setWeighinPickup] = useState<PickupOrder | null>(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [actualWeights, setActualWeights] = useState<Record<string, number>>({});
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cash'>('upi');
  const [completingPickup, setCompletingPickup] = useState(false);
  const [weighinSuccess, setWeighinSuccess] = useState(false);

  // Both-way Rating: Dealer rating Household Seller
  const [ratingSellerPickup, setRatingSellerPickup] = useState<PickupOrder | null>(null);
  const [sellerRatingStars, setSellerRatingStars] = useState(5);
  const [sellerRatingReason, setSellerRatingReason] = useState('');
  const [sellerRatingReasonError, setSellerRatingReasonError] = useState('');
  const [sellerRatingComment, setSellerRatingComment] = useState('');
  const [sellerRatingSuccess, setSellerRatingSuccess] = useState(false);
  const [submittingSellerRating, setSubmittingSellerRating] = useState(false);

  // Sync bids for the selected listing or dealer
  const allBids = useMemo(() => {
    // Dependency on bidsVersion forces re-read
    const _v = bidsVersion;
    void _v;
    return MockStore.getBids();
  }, [bidsVersion]);

  // Existing bid placed by this dealer on selected listing
  const currentDealerBidOnSelected = useMemo(() => {
    if (!selectedListing) return null;
    return allBids.find(
      (b) => b.listing_id === selectedListing.id && b.dealer_id === currentDealerId && b.status !== 'withdrawn'
    ) || null;
  }, [selectedListing, allBids, currentDealerId]);

  // Won jobs for this dealer
  const wonPickups = useMemo(() => {
    return pickups.filter((p) => p.dealer_id === currentDealerId);
  }, [pickups, currentDealerId]);

  // Calculate benchmark range for selected listing
  const benchmarkRange = useMemo(() => {
    if (!selectedListing) return { min: 0, max: 0 };
    let minTotal = 0;
    let maxTotal = 0;
    selectedListing.items.forEach((item) => {
      const cat = INITIAL_CATEGORIES.find((c) => c.slug === item.category_slug);
      const minRate = cat ? cat.benchmark_price_min : 12;
      const maxRate = cat ? cat.benchmark_price_max : 16;
      minTotal += item.approx_weight_kg * minRate;
      maxTotal += item.approx_weight_kg * maxRate;
    });
    return { min: Math.round(minTotal), max: Math.round(maxTotal) };
  }, [selectedListing]);

  // Check if entered offer is far outside benchmark (>30% below min or >30% above max)
  const isFarOutsideBenchmark = useMemo(() => {
    if (!offerAmount || !benchmarkRange.min || !benchmarkRange.max) return false;
    const lowerBound = benchmarkRange.min * 0.7;
    const upperBound = benchmarkRange.max * 1.35;
    return offerAmount < lowerBound || offerAmount > upperBound;
  }, [offerAmount, benchmarkRange]);

  // Handle KYC toggle (for testing)
  const handleToggleKyc = (newStatus: KycStatus) => {
    setKycStatus(newStatus);
    MockStore.setDealerKycStatus(newStatus);
  };

  // Open Listing Detail & One-Tap Offer modal
  const openListingDetail = (listing: ScrapListing) => {
    setSelectedListing(listing);
    setSelectedPhotoIdx(0);

    const existingBid = allBids.find(
      (b) => b.listing_id === listing.id && b.dealer_id === currentDealerId && b.status !== 'withdrawn'
    );

    if (existingBid) {
      setOfferAmount(existingBid.total_estimated_amount);
      setOfferNotes(existingBid.notes || '');
      setOfferEta(existingBid.eta_minutes || 30);
      setOfferSlot(existingBid.pickup_slot || 'Morning (10:00 AM)');
    } else {
      // Default to benchmark max (competitive offer)
      let defaultTotal = 0;
      listing.items.forEach((item) => {
        const cat = INITIAL_CATEGORIES.find((c) => c.slug === item.category_slug);
        const rate = cat ? cat.benchmark_price_max : 16;
        defaultTotal += item.approx_weight_kg * rate;
      });
      setOfferAmount(Math.round(defaultTotal));
      setOfferNotes('Certified electronic scale available, instant GooglePay/Cash.');
      setOfferEta(30);
      setOfferSlot('Morning (10:00 AM)');
    }
  };

  // Submit or update one-tap offer
  const handleSaveOffer = () => {
    if (!selectedListing) return;
    if (kycStatus !== 'approved') return;

    setSubmittingBid(true);
    try {
      if (currentDealerBidOnSelected) {
        // Update existing bid
        MockStore.updateBid(currentDealerBidOnSelected.id, offerAmount, offerNotes);
      } else {
        // Create new bid with breakdown
        const breakdown: Record<string, number> = {};
        selectedListing.items.forEach((item) => {
          const cat = INITIAL_CATEGORIES.find((c) => c.slug === item.category_slug);
          breakdown[item.category_slug] = cat ? cat.benchmark_price_max : 16;
        });

        const newBid: DealerBid = {
          id: `bid-dealer-${Date.now()}`,
          listing_id: selectedListing.id,
          dealer_id: currentDealerId,
          dealer_name: 'Shree Ganesh Scrap Traders',
          dealer_rating: 4.9,
          dealer_distance_km: 1.4,
          total_estimated_amount: Math.round(offerAmount),
          rate_breakdown: breakdown,
          pickup_date: new Date().toISOString().split('T')[0],
          pickup_slot: offerSlot,
          eta_minutes: offerEta,
          notes: offerNotes,
          status: 'submitted',
          created_at: new Date().toISOString(),
        };
        MockStore.saveBid(newBid);

        // Queue for background sync if offline on patchy data
        if (typeof window !== 'undefined' && !navigator.onLine) {
          enqueueOfflineAction('SUBMIT_OFFER', {
            listing_id: selectedListing.id,
            dealer_id: currentDealerId,
            total_amount: Math.round(offerAmount),
            rates: breakdown,
            notes: offerNotes,
            eta_minutes: offerEta,
            pickup_slot: offerSlot,
          });
        }
      }

      setBidsVersion((v) => v + 1);
      setSelectedListing(null);
    } catch (err) {
      console.error('Error saving bid', err);
    } finally {
      setSubmittingBid(false);
    }
  };

  // Withdraw active offer
  const handleWithdrawOffer = () => {
    if (!currentDealerBidOnSelected) return;
    MockStore.withdrawBid(currentDealerBidOnSelected.id);
    setBidsVersion((v) => v + 1);
    setSelectedListing(null);
  };

  // Open Doorstep Weigh-in modal
  const openWeighinModal = (pickup: PickupOrder) => {
    setWeighinPickup(pickup);
    setEnteredOtp('');
    setWeighinSuccess(false);

    const listing = MockStore.getListingById(pickup.listing_id);
    const initialActual: Record<string, number> = {};
    if (listing) {
      listing.items.forEach((item) => {
        initialActual[item.category_slug] = item.approx_weight_kg;
      });
    } else {
      initialActual['newspaper'] = 20;
      initialActual['cardboard'] = 15;
    }
    setActualWeights(initialActual);
  };

  // Calculate Doorstep Final Total
  const calculatedDoorstepTotal = useMemo(() => {
    if (!weighinPickup) return 0;
    const listingBids = MockStore.getBids(weighinPickup.listing_id);
    const winningBid = listingBids.find((b) => b.id === weighinPickup.bid_id) || listingBids[0];
    const rates = winningBid?.rate_breakdown || { newspaper: 16.5, cardboard: 11.5, iron: 30 };

    return Object.entries(actualWeights).reduce((sum, [slug, weight]) => {
      const rate = rates[slug] || 16;
      return sum + weight * rate;
    }, 0);
  }, [weighinPickup, actualWeights]);

  // Complete Doorstep Deal
  const handleCompleteDeal = () => {
    if (!weighinPickup) return;
    if (enteredOtp !== weighinPickup.otp_code) {
      alert(`Invalid OTP code! Ask the seller for their 4-digit code (Hint: ${weighinPickup.otp_code})`);
      return;
    }

    setCompletingPickup(true);
    const finalTotal = Math.round(calculatedDoorstepTotal);

    setTimeout(() => {
      MockStore.completePickup(weighinPickup.id, finalTotal, paymentMethod);

      if (typeof window !== 'undefined' && !navigator.onLine) {
        enqueueOfflineAction('COMPLETE_WEIGHIN', {
          pickup_id: weighinPickup.id,
          final_amount: finalTotal,
          payment_method: paymentMethod,
          final_weights: actualWeights,
          otp_code: enteredOtp,
        });
      }

      setPickups(MockStore.getPickups());
      setLedger(MockStore.getLedger());
      setRatings(MockStore.getRatings());
      setCompletingPickup(false);
      setWeighinSuccess(true);
    }, 800);
  };

  // Submit dealer rating for household seller (both-way rating)
  const handleSubmitSellerRating = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingSellerPickup) return;

    if (sellerRatingStars <= 2 && !sellerRatingReason.trim()) {
      setSellerRatingReasonError('Please select or specify a reason for 1-2 star rating');
      return;
    }
    setSellerRatingReasonError('');

    setSubmittingSellerRating(true);
    try {
      MockStore.saveRating({
        pickupId: ratingSellerPickup.id,
        fromRole: 'dealer',
        stars: sellerRatingStars,
        reason: sellerRatingStars <= 2 ? sellerRatingReason.trim() : undefined,
        comment: sellerRatingComment.trim() || undefined,
      });
      setSellerRatingSuccess(true);
      setPickups(MockStore.getPickups());
      setTimeout(() => {
        setRatingSellerPickup(null);
        setSellerRatingSuccess(false);
        setSellerRatingReason('');
        setSellerRatingComment('');
        setSellerRatingReasonError('');
      }, 1500);
    } catch (err) {
      console.error('Error submitting seller rating', err);
    } finally {
      setSubmittingSellerRating(false);
    }
  };


  return (
    <div className="space-y-6">
      {/* KYC Status & Test Toggle Banner */}
      {kycStatus !== 'approved' ? (
        <div className="bg-amber-500/15 border-2 border-amber-500 rounded-3xl p-5 sm:p-6 text-amber-950 space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-base sm:text-lg font-black text-amber-900">
                {t('kycPendingBanner')}
              </h2>
              <p className="text-xs text-amber-800 mt-1">
                {t('kycBlockedNotice')}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-amber-300/40 flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900">
              {t('testKycToggle')}:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleToggleKyc('approved')}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white min-h-[40px] shadow-xs transition-colors"
              >
                Simulate KYC Approved
              </button>
              <button
                type="button"
                onClick={() => handleToggleKyc('pending')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border min-h-[40px] transition-colors ${
                  kycStatus === 'pending'
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-white text-amber-900 border-amber-300'
                }`}
              >
                Keep Pending
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-2xl text-xs font-bold text-emerald-900">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            {t('kycApprovedBadge')} — You are verified to submit bids and win jobs.
          </span>
          <button
            type="button"
            onClick={() => handleToggleKyc('pending')}
            className="text-[11px] text-slate-500 underline hover:text-slate-800 ml-2"
            title="Click to test bidding lock"
          >
            Test KYC Lock
          </button>
        </div>
      )}

      {/* Verified Dealer Header Card */}
      <div className="rounded-[20px] bg-primary text-white p-6 sm:p-8 shadow-xl border border-primary-hover relative overflow-hidden">
        <div 
          aria-hidden="true" 
          className="absolute -top-24 -right-24 w-80 h-80 bg-accent/15 rounded-full blur-3xl pointer-events-none" 
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-[16px] bg-white/10 border border-white/20 flex items-center justify-center text-accent shrink-0">
              <Store className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-tight">Shree Ganesh Scrap Traders</h1>
                <DealerTrustBadges
                  isKycVerified={kycStatus === 'approved'}
                  totalPickups={412}
                  rating={4.9}
                  scaleCertified={true}
                  size="sm"
                />
              </div>
              <p className="text-xs text-stone-300 mt-1">
                Radius: <strong className="text-white">7.5 km (Nashik &amp; surrounding area)</strong> • Certified Electronic Balance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-[12px] border border-white/10 text-center min-w-[80px]">
              <span className="text-[10px] uppercase font-bold text-stone-300 block">{t('avgRating')}</span>
              <span className="text-base font-black text-accent tabular-nums">★ 4.9</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-[12px] border border-white/10 text-center min-w-[80px]">
              <span className="text-[10px] uppercase font-bold text-stone-300 block">Pickups</span>
              <span className="text-base font-black text-white tabular-nums">{412 + wonPickups.filter(p => p.status === 'completed').length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dealer Loyalty & Priority Dispatch Badge Card (MVP Design Stub) */}
      <LoyaltyReferralCard role="dealer" userId="dealer-1" />

      {/* Dealer Navigation Tabs (Large Tap Targets) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {[
          { tab: 'requests', label: t('newRequestsTitle'), count: listings.filter(l => l.status === 'open_for_bids').length },
          { tab: 'won_jobs', label: t('wonJobs'), count: wonPickups.length },
          { tab: 'ledger', label: t('earningsAndLedger'), count: ledger.length },
          { tab: 'ratings', label: t('ratingsReceived'), count: ratings.length },
        ].map(({ tab, label, count }) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as typeof activeTab)}
              className={`p-3 rounded-[14px] text-xs sm:text-sm font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-2 min-h-[48px] border ${
                isActive
                  ? 'bg-primary text-white border-primary shadow-xs'
                  : 'bg-surface text-muted border-border hover:bg-muted-bg hover:text-text'
              }`}
            >
              <span>{label}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold tabular-nums ${
                isActive ? 'bg-white/20 text-white' : 'bg-muted-bg text-muted'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: New Requests Nearby Dashboard */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Hyperlocal Radius Feed (within 7.5 km)
            </span>
            <span className="text-xs text-emerald-700 font-semibold">
              Live updates enabled
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {listings
              .filter((l) => l.status === 'open_for_bids')
              .map((listing) => {
                const myBid = allBids.find(
                  (b) => b.listing_id === listing.id && b.dealer_id === currentDealerId && b.status !== 'withdrawn'
                );

                return (
                  <div
                    key={listing.id}
                    className="card-premium p-5 flex flex-col justify-between hover:border-[var(--primary)] transition-all"
                  >
                    <div>
                      {/* Top status & countdown */}
                      <div className="flex items-center justify-between pb-3 border-b border-border">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800/40">
                          <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          <span>{t('timeRemaining')}: ~3 hrs</span>
                        </span>

                        <span className="text-xs font-bold text-muted">
                          {listing.bids_count || 0} bids
                        </span>
                      </div>

                      {/* Photo Thumbnail & Title */}
                      <div className="flex items-start gap-3 mt-3">
                        {listing.photos.length > 0 && (
                          <div className="w-20 h-20 rounded-2xl overflow-hidden border border-border shrink-0 relative bg-muted/10">
                            <OptimizedImage
                              src={listing.photos[0]}
                              alt={listing.title}
                              className="w-full h-full object-cover"
                            />
                            {listing.photos.length > 1 && (
                              <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md z-20">
                                +{listing.photos.length - 1}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-foreground text-base leading-snug truncate">
                            {listing.title}
                          </h3>
                          <p className="text-xs text-muted mt-1 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-muted shrink-0" />
                            <span className="truncate">{listing.address}, {listing.city}</span>
                          </p>
                          <span className="text-[11px] font-bold text-[var(--primary)] bg-[var(--primary-tint)] dark:bg-[var(--primary)]/20 px-2 py-0.5 rounded-md inline-block mt-1">
                            ~1.4 km away
                          </span>
                        </div>
                      </div>

                      {/* Category Weights Breakdown */}
                      <div className="mt-3.5 flex flex-wrap gap-1.5">
                        {listing.items.map((item, idx) => (
                          <span
                            key={idx}
                            className="bg-muted/10 border border-border px-2.5 py-1 rounded-lg text-xs font-medium text-foreground"
                          >
                            <span className="capitalize">{item.category_slug}:</span>{' '}
                            <strong className="tabular-nums">{item.approx_weight_kg} kg</strong>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Action & Bid Status */}
                    <div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-muted uppercase block font-semibold">
                          Total Approx Weight
                        </span>
                        <span className="text-xl font-bold text-foreground font-mono tabular-nums">
                          {listing.total_approx_weight_kg} kg
                        </span>
                      </div>

                      {myBid ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[var(--primary)] bg-[var(--primary-tint)] dark:bg-[var(--primary)]/20 px-3 py-1.5 rounded-xl border border-[var(--primary)]/30 tabular-nums">
                            Bid: ₹{myBid.total_estimated_amount}
                          </span>
                          <button
                            type="button"
                            onClick={() => openListingDetail(listing)}
                            className="btn-outline text-xs px-4 py-2"
                          >
                            {t('editOffer')}
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openListingDetail(listing)}
                          disabled={kycStatus !== 'approved'}
                          className={`btn-primary text-xs sm:text-sm px-5 py-2.5 ${
                            kycStatus === 'approved'
                              ? ''
                              : 'opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <Send className="w-4 h-4" />
                          <span>{t('viewDetailsBtn')}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 2: Won Jobs & Scheduled Pickups */}
      {activeTab === 'won_jobs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-foreground">
              {t('wonJobs')} ({wonPickups.length})
            </h2>
            <span className="text-xs text-muted">
              Customer details unlocked
            </span>
          </div>

          {wonPickups.length === 0 ? (
            <div className="card-premium p-10 text-center max-w-lg mx-auto">
              <Calendar className="w-12 h-12 text-muted/40 mx-auto mb-2" />
              <h4 className="font-bold text-foreground">No Won Pickups Yet</h4>
              <p className="text-xs text-muted mt-1">
                Submit competitive bids on open requests. When a seller accepts your offer, it will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {wonPickups.map((pickup) => {
                const listing = MockStore.getListingById(pickup.listing_id);
                const sellerAddress = listing?.address || 'Near City Center, Nashik';
                const sellerCity = listing?.city || 'Nashik';
                const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${sellerAddress}, ${sellerCity}`)}`;

                return (
                  <div
                    key={pickup.id}
                    className="card-premium p-5 sm:p-6 space-y-4"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                        pickup.status === 'completed'
                          ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          : 'bg-[var(--primary-tint)] dark:bg-[var(--primary)]/30 text-[var(--primary)] dark:text-[var(--primary-tint)] border border-[var(--primary)]/30'
                      }`}>
                        {pickup.status === 'completed' ? 'Deal Completed' : 'Doorstep Pickup Won'}
                      </span>
                      <span className="text-xs text-muted font-semibold">{pickup.scheduled_at}</span>
                    </div>

                    <div>
                      <h4 className="font-bold text-foreground text-lg">
                        {listing?.title || 'Doorstep Scrap Clearance'}
                      </h4>
                      <p className="text-xs text-foreground mt-1 font-medium flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[var(--primary)] shrink-0" />
                        <span>{sellerAddress}, {sellerCity}</span>
                      </p>
                    </div>

                    {/* Action Buttons: Call, WhatsApp, Navigate (Google Maps) */}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <a
                        href={`tel:${pickup.dealer_phone}`}
                        className="btn-outline text-xs py-2 px-2"
                      >
                        <Phone className="w-4 h-4 text-[var(--primary)]" />
                        <span>{t('callSeller')}</span>
                      </a>

                      <a
                        href={`https://wa.me/${pickup.dealer_phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 text-emerald-900 dark:text-emerald-300 font-bold text-xs py-2 px-2 rounded-[14px] min-h-[48px] border border-emerald-300 dark:border-emerald-800 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4 text-emerald-600" />
                        <span>{t('whatsappSeller')}</span>
                      </a>

                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-outline text-xs py-2 px-2"
                      >
                        <Navigation className="w-4 h-4 text-[var(--primary)]" />
                        <span>Maps</span>
                      </a>
                    </div>

                    {pickup.status === 'completed' ? (
                      <div className="bg-[var(--primary-tint)] dark:bg-[var(--primary)]/20 rounded-[14px] p-4 border border-[var(--primary)]/30 text-foreground text-xs space-y-2">
                        <div className="flex justify-between items-center font-bold">
                          <span>Final Paid Settlement:</span>
                          <span className="text-lg font-bold text-[var(--primary)] dark:text-emerald-400 font-rupee tabular-nums">₹{pickup.final_total_amount}</span>
                        </div>
                        <span className="text-[11px] text-muted block">
                          Paid via {pickup.payment_method?.toUpperCase()} directly to seller.
                        </span>

                        <div className="pt-2 border-t border-[var(--primary)]/20 flex items-center justify-between">
                          {pickup.dealer_rating ? (
                            <div className="text-[11px] text-foreground flex items-center gap-1 font-bold">
                              <span>Seller Rated:</span>
                              <span className="text-[var(--accent)] font-rupee">★ {pickup.dealer_rating}</span>
                              {pickup.dealer_rating_reason && (
                                <span className="text-rose-600 text-[10px]">({pickup.dealer_rating_reason})</span>
                              )}
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setRatingSellerPickup(pickup);
                                setSellerRatingStars(5);
                                setSellerRatingReason('');
                                setSellerRatingComment('');
                                setSellerRatingReasonError('');
                              }}
                              className="btn-gold text-xs py-1.5 px-3 min-h-[40px]"
                            >
                              <Star className="w-3.5 h-3.5 fill-current" />
                              <span>Rate Household Seller</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openWeighinModal(pickup)}
                        className="w-full btn-primary text-sm py-3 justify-center"
                      >
                        <Scale className="w-5 h-5 text-[var(--accent)]" />
                        <span>{t('onSpotWeighin')}</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Earnings & Commission Ledger */}
      {activeTab === 'ledger' && (
        <div className="space-y-6">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card-premium p-5">
              <span className="text-xs font-bold text-muted uppercase block mb-1">
                {t('totalEarnings')}
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-foreground font-mono tabular-nums">
                142 kg
              </span>
              <span className="text-xs text-[var(--primary)] font-semibold block mt-1">
                Across 4 pickups
              </span>
            </div>

            <div className="card-premium p-5">
              <span className="text-xs font-bold text-muted uppercase block mb-1">
                Total Paid to Sellers
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-[var(--accent)] font-rupee tabular-nums">
                ₹{ledger.reduce((sum, e) => sum + e.deal_amount, 0)}
              </span>
              <span className="text-xs text-muted block mt-1">
                Direct Cash/UPI settlements
              </span>
            </div>

            <div className="card-premium p-5">
              <span className="text-xs font-bold text-muted uppercase block mb-1">
                {t('totalCommissionWaived')}
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-amber-600 font-rupee tabular-nums">
                ₹{Math.round(ledger.reduce((sum, e) => sum + e.commission_amount, 0))}
              </span>
              <span className="text-xs text-amber-700 dark:text-amber-400 font-bold block mt-1">
                100% Free during MVP Launch
              </span>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="card-premium p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border">
              <div>
                <h3 className="font-bold text-foreground text-lg">{t('ledgerTitle')}</h3>
                <p className="text-xs text-muted mt-0.5">{t('ledgerNote')}</p>
              </div>
              <span className="text-xs font-bold text-[var(--primary)] bg-[var(--primary-tint)] dark:bg-[var(--primary)]/20 px-3 py-1.5 rounded-xl border border-[var(--primary)]/30 self-start sm:self-auto">
                0% Platform Fee in MVP Beta
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/10 text-muted uppercase font-bold border-y border-border">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Pickup ID</th>
                    <th className="py-2.5 px-3">Deal Total</th>
                    <th className="py-2.5 px-3">Platform Fee (5%)</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {ledger.map((entry) => (
                    <tr key={entry.id} className="hover:bg-muted/5">
                      <td className="py-3 px-3 text-muted">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 font-mono text-foreground">
                        {entry.pickup_id}
                      </td>
                      <td className="py-3 px-3 font-bold text-foreground font-rupee tabular-nums">
                        ₹{entry.deal_amount}
                      </td>
                      <td className="py-3 px-3 text-muted line-through font-rupee tabular-nums">
                        ₹{entry.commission_amount}
                      </td>
                      <td className="py-3 px-3">
                        <span className="bg-[var(--primary-tint)] dark:bg-[var(--primary)]/30 text-[var(--primary)] dark:text-[var(--primary-tint)] font-bold px-2 py-0.5 rounded-md text-[10px]">
                          {t('commissionWaived')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Ratings Received */}
      {activeTab === 'ratings' && (
        <div className="card-premium p-6 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div>
              <h3 className="font-bold text-foreground text-lg">
                {t('ratingsReceived')}
              </h3>
              <p className="text-xs text-muted mt-0.5">
                Feedback from households after doorstep weigh-in and payment
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 px-3.5 py-2 rounded-2xl border border-amber-200 dark:border-amber-800">
              <Star className="w-5 h-5 fill-[var(--accent)] text-[var(--accent)]" />
              <span className="text-lg font-bold text-foreground font-rupee tabular-nums">4.9</span>
              <span className="text-xs text-muted font-bold">/ 5.0</span>
            </div>
          </div>

          <div className="space-y-3.5">
            {ratings.map((review) => (
              <div key={review.id} className="bg-muted/10 p-4 rounded-2xl border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= review.stars
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>

                {review.comment && (
                  <p className="text-xs text-slate-700 italic">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LISTING DETAIL & ONE-TAP OFFER MODAL */}
      {selectedListing && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-[20px] max-w-lg w-full p-6 shadow-2xl border border-border max-h-[92vh] overflow-y-auto space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-foreground text-lg">
                {selectedListing.title}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedListing(null)}
                className="p-1.5 text-muted hover:text-foreground rounded-lg min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo Gallery with Thumbnail Strip */}
            {selectedListing.photos.length > 0 && (
              <div className="space-y-2">
                <div className="rounded-2xl overflow-hidden aspect-video border border-border relative bg-muted/10">
                  <OptimizedImage
                    src={selectedListing.photos[selectedPhotoIdx] || selectedListing.photos[0]}
                    alt="Scrap item"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[11px] font-bold px-2 py-0.5 rounded-lg z-20">
                    Photo {selectedPhotoIdx + 1} of {selectedListing.photos.length}
                  </div>
                </div>

                {selectedListing.photos.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {selectedListing.photos.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedPhotoIdx(i)}
                        className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 ${
                          selectedPhotoIdx === i ? 'border-[var(--primary)]' : 'border-border opacity-60'
                        }`}
                      >
                        <OptimizedImage src={url} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Scrap Items & Market Rate-Card Reference */}
            <div className="bg-muted/10 p-4 rounded-2xl border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted uppercase tracking-wider">
                  Items & Benchmark Rates
                </span>
                <span className="text-xs font-bold text-[var(--primary)]">
                  {t('marketRateCard', { min: benchmarkRange.min, max: benchmarkRange.max })}
                </span>
              </div>

              <div className="space-y-1.5 pt-1">
                {selectedListing.items.map((item, idx) => {
                  const cat = INITIAL_CATEGORIES.find((c) => c.slug === item.category_slug);
                  return (
                    <div key={idx} className="flex justify-between text-xs font-medium text-foreground">
                      <span className="capitalize">
                        {item.category_slug} ({item.approx_weight_kg} kg)
                      </span>
                      <span className="text-foreground font-bold font-rupee tabular-nums">
                        ₹{cat ? `${cat.benchmark_price_min}-${cat.benchmark_price_max}` : '15'}/kg
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* One-Tap Offer Form */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Your Total Offer (₹):
                </label>

                {/* Quick Benchmark Preset Buttons */}
                <div className="flex items-center gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setOfferAmount(benchmarkRange.min)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-muted/10 hover:bg-muted/20 text-foreground border border-border min-h-[40px] font-rupee tabular-nums"
                  >
                    Min (₹{benchmarkRange.min})
                  </button>
                  <button
                    type="button"
                    onClick={() => setOfferAmount(Math.round((benchmarkRange.min + benchmarkRange.max) / 2))}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-muted/10 hover:bg-muted/20 text-foreground border border-border min-h-[40px] font-rupee tabular-nums"
                  >
                    Mid (₹{Math.round((benchmarkRange.min + benchmarkRange.max) / 2)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setOfferAmount(benchmarkRange.max)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--primary-tint)] dark:bg-[var(--primary)]/20 hover:bg-[var(--primary-tint)]/80 text-[var(--primary)] dark:text-[var(--primary-tint)] border border-[var(--primary)]/30 min-h-[40px] font-rupee tabular-nums"
                  >
                    Top (₹{benchmarkRange.max})
                  </button>
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-muted">₹</span>
                  <input
                    type="number"
                    min="50"
                    step="10"
                    value={offerAmount || ''}
                    onChange={(e) => setOfferAmount(parseInt(e.target.value, 10) || 0)}
                    placeholder="Enter total offer amount"
                    className="w-full bg-muted/10 border border-border rounded-2xl pl-9 pr-4 py-3 text-xl font-bold text-foreground focus:bg-surface focus:outline-hidden focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] min-h-[48px] font-rupee tabular-nums"
                  />
                </div>
              </div>

              {/* Warning if Offer is Far Outside Benchmark Range */}
              {isFarOutsideBenchmark && (
                <div className="bg-amber-500/15 border border-amber-500/60 rounded-2xl p-3 text-amber-950 dark:text-amber-200 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    {t('warningOutsideRange', { amount: offerAmount, min: benchmarkRange.min, max: benchmarkRange.max })}
                  </span>
                </div>
              )}

              {/* Note to Seller */}
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  {t('notesLabel')}
                </label>
                <textarea
                  rows={2}
                  value={offerNotes}
                  onChange={(e) => setOfferNotes(e.target.value)}
                  placeholder={t('notesPlaceholder')}
                  className="w-full bg-muted/10 border border-border rounded-xl p-3 text-xs text-foreground focus:bg-surface focus:outline-hidden focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>

              {/* Existing Bid Actions (Withdraw / Edit) */}
              {currentDealerBidOnSelected && (
                <div className="bg-[var(--primary-tint)] dark:bg-[var(--primary)]/20 border border-[var(--primary)]/30 rounded-2xl p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-[var(--primary)] dark:text-[var(--primary-tint)] block font-rupee tabular-nums">
                      Your Current Bid: ₹{currentDealerBidOnSelected.total_estimated_amount}
                    </span>
                    <span className="text-[10px] text-muted">
                      Placed on {new Date(currentDealerBidOnSelected.created_at).toLocaleTimeString()}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleWithdrawOffer}
                    className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-800 min-h-[40px] transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t('withdrawOffer')}</span>
                  </button>
                </div>
              )}

              {/* KYC block banner inside modal if blocked */}
              {kycStatus !== 'approved' && (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-3 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{t('kycBlockedNotice')}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedListing(null)}
                  className="btn-ghost text-xs px-4 py-2"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveOffer}
                  disabled={submittingBid || !offerAmount || kycStatus !== 'approved'}
                  className="btn-primary text-xs sm:text-sm px-6 py-2.5"
                >
                  <Send className="w-4 h-4" />
                  <span>{currentDealerBidOnSelected ? t('editOffer') : t('oneTapOffer')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DOORSTEP PICKUP FINAL WEIGH-IN MODAL */}
      {weighinPickup && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-[20px] max-w-lg w-full p-6 shadow-2xl border border-border max-h-[92vh] overflow-y-auto space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-[var(--primary)]" />
                <h3 className="font-bold text-foreground text-lg">
                  {t('onSpotWeighin')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setWeighinPickup(null)}
                className="text-muted hover:text-foreground p-1.5 min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {weighinSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-xl font-bold text-foreground">Deal Completed Successfully!</h4>
                <p className="text-xs text-muted max-w-sm mx-auto">
                  Final payment of <strong className="text-foreground font-rupee tabular-nums">₹{Math.round(calculatedDoorstepTotal)}</strong> was settled with seller via {paymentMethod.toUpperCase()}.
                </p>
                <button
                  type="button"
                  onClick={() => setWeighinPickup(null)}
                  className="btn-primary text-xs px-6 py-2.5"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <span className="text-xs font-bold text-foreground block">
                    1. {t('enterActualWeights')}:
                  </span>
                  {Object.entries(actualWeights).map(([slug, weight]) => (
                    <div key={slug} className="flex items-center justify-between bg-muted/10 p-3 rounded-2xl border border-border">
                      <span className="capitalize text-xs font-bold text-foreground">
                        {slug}
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          value={weight}
                          onChange={(e) =>
                            setActualWeights((prev) => ({
                              ...prev,
                              [slug]: parseFloat(e.target.value) || 0,
                            }))
                          }
                          className="w-24 bg-surface border border-border rounded-xl px-2.5 py-2 text-sm font-bold text-foreground text-center min-h-[44px] tabular-nums"
                        />
                        <span className="text-xs font-bold text-muted">kg</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Final Recalculated Payout */}
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300 uppercase">
                      {t('finalPayout')}
                    </span>
                    <p className="text-xs text-muted">Auto-calculated from winning rates</p>
                  </div>
                  <span className="text-3xl font-bold text-[var(--accent)] font-rupee tabular-nums">
                    ₹{Math.round(calculatedDoorstepTotal)}
                  </span>
                </div>

                {/* Payment method selector */}
                <div>
                  <span className="text-xs font-bold text-foreground block mb-2">
                    2. Select Direct Payment Mode:
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upi')}
                      className={`p-3.5 rounded-[14px] border flex items-center justify-center gap-2.5 text-xs font-bold min-h-[48px] transition-all ${
                        paymentMethod === 'upi'
                          ? 'border-[var(--primary)] bg-[var(--primary-tint)] dark:bg-[var(--primary)]/20 text-[var(--primary)] dark:text-[var(--primary-tint)] ring-2 ring-[var(--primary)]/20'
                          : 'border-border text-foreground hover:bg-muted/10'
                      }`}
                    >
                      <QrCode className="w-5 h-5 text-[var(--primary)]" />
                      <span>{t('payViaUpi')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cash')}
                      className={`p-3.5 rounded-[14px] border flex items-center justify-center gap-2.5 text-xs font-bold min-h-[48px] transition-all ${
                        paymentMethod === 'cash'
                          ? 'border-[var(--primary)] bg-[var(--primary-tint)] dark:bg-[var(--primary)]/20 text-[var(--primary)] dark:text-[var(--primary-tint)] ring-2 ring-[var(--primary)]/20'
                          : 'border-border text-foreground hover:bg-muted/10'
                      }`}
                    >
                      <Banknote className="w-5 h-5 text-[var(--primary)]" />
                      <span>{t('payViaCash')}</span>
                    </button>
                  </div>
                </div>

                {/* Seller 4-digit verification code */}
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1">
                    3. {t('otpVerificationDesc')} (Hint: {weighinPickup.otp_code}):
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="4-digit code"
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value.trim())}
                    className="w-full bg-muted/10 border border-border rounded-2xl px-4 py-3 text-center font-mono text-2xl tracking-widest font-bold text-foreground focus:bg-surface focus:outline-hidden focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] min-h-[48px]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setWeighinPickup(null)}
                    className="btn-ghost text-xs px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCompleteDeal}
                    disabled={completingPickup || enteredOtp.length !== 4}
                    className="btn-primary text-xs sm:text-sm px-6 py-2.5 disabled:opacity-50"
                  >
                    {completingPickup ? 'Verifying...' : t('confirmCompleted')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Dealer Rating Household Seller (Both-Way Rating) */}
      {ratingSellerPickup && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Rate Household Seller
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pickup Ref: #{ratingSellerPickup.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRatingSellerPickup(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {sellerRatingSuccess ? (
              <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl border border-emerald-200 text-sm text-center font-bold">
                ✓ Seller review submitted successfully!
              </div>
            ) : (
              <form onSubmit={handleSubmitSellerRating} className="space-y-4">
                {/* 5-Star Interactive Selector */}
                <div className="flex items-center justify-center gap-2 py-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSellerRatingStars(star)}
                      className="p-2 min-w-[48px] min-h-[48px] flex items-center justify-center rounded-xl hover:bg-amber-50 active:scale-95 transition-all"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= sellerRatingStars
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                {/* Mandatory Reason Prompt for 1-2 Stars */}
                {sellerRatingStars <= 2 && (
                  <div className="space-y-2 bg-rose-50 border border-rose-200 p-3.5 rounded-2xl animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        Required: What was the issue?
                      </label>
                      <span className="text-[10px] font-black text-rose-700 bg-rose-200/80 px-2 py-0.5 rounded-md uppercase">
                        Mandatory
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {[
                        'Weights exaggerated in estimate (>30% mismatch)',
                        'Refused entry / no response on arrival',
                        'Contaminated / damp scrap material',
                        'Disagreed with agreed offer on spot',
                      ].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => {
                            setSellerRatingReason(preset);
                            setSellerRatingReasonError('');
                          }}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-xl transition-all ${
                            sellerRatingReason === preset
                              ? 'bg-rose-700 text-white shadow-xs'
                              : 'bg-white text-rose-900 border border-rose-200 hover:bg-rose-100'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>

                    <input
                      type="text"
                      value={sellerRatingReason}
                      onChange={(e) => {
                        setSellerRatingReason(e.target.value);
                        setSellerRatingReasonError('');
                      }}
                      placeholder="Or specify dealer grievance..."
                      className="w-full bg-white border border-rose-300 rounded-xl px-3 py-2 text-xs text-rose-950 placeholder:text-rose-400 focus:outline-hidden focus:border-rose-600"
                    />

                    {sellerRatingReasonError && (
                      <p className="text-[11px] text-rose-600 font-bold">{sellerRatingReasonError}</p>
                    )}
                  </div>
                )}

                <textarea
                  rows={3}
                  value={sellerRatingComment}
                  onChange={(e) => setSellerRatingComment(e.target.value)}
                  placeholder="Notes on scrap sorting, packaging, and door cooperation (optional)..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:border-emerald-600"
                />

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRatingSellerPickup(null);
                      setSellerRatingReason('');
                      setSellerRatingReasonError('');
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 min-h-[48px]"
                  >
                    Skip
                  </button>

                  <button
                    type="submit"
                    disabled={submittingSellerRating || (sellerRatingStars <= 2 && !sellerRatingReason.trim())}
                    className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs min-h-[48px]"
                  >
                    {submittingSellerRating ? 'Submitting...' : 'Submit Rating'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
