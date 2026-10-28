'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { MockStore } from '@/lib/data/mock-store';
import { ScrapListing, PickupOrder } from '@/lib/types/database';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { 
  MapPin, 
  Radio, 
  CheckCircle2, 
  Phone, 
  Star, 
  Banknote, 
  Loader2,
  Clock,
  MessageCircle,
  AlertTriangle,
  Scale,
  Sparkles,
  X,
  PlusCircle
} from 'lucide-react';
import { DealerTrustBadges } from '@/components/common/DealerTrustBadges';
import { LoyaltyReferralCard } from '@/components/common/LoyaltyReferralCard';
import { OptimizedImage } from '@/components/common/OptimizedImage';

export function LiveBiddingView() {
  const t = useTranslations('bids');
  const searchParams = useSearchParams();
  const requestedListingId = searchParams.get('listingId');

  // History Tab: 'active' | 'history'
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  // Listings state
  const [listings, setListings] = useState<ScrapListing[]>(() => MockStore.getListings());
  const [selectedListingId, setSelectedListingId] = useState<string | null>(() => {
    const all = MockStore.getListings();
    if (requestedListingId && all.some(l => l.id === requestedListingId)) {
      return requestedListingId;
    }
    return all[0]?.id || null;
  });

  // Realtime bids version counter to trigger recalculation when bids change
  const [bidsVersion, setBidsVersion] = useState(0);

  // Bids computed directly for currently selected listing, sorted highest first
  const bids = useMemo(() => {
    if (!selectedListingId) return [];
    // bidsVersion as dependency allows forcing recomputation
    const _v = bidsVersion;
    void _v;
    const currentBids = MockStore.getBids(selectedListingId);
    return [...currentBids].sort((a, b) => b.total_estimated_amount - a.total_estimated_amount);
  }, [selectedListingId, bidsVersion]);

  const refreshBids = useCallback(() => {
    setBidsVersion((v) => v + 1);
  }, []);

  const [pickups, setPickups] = useState<PickupOrder[]>(() => MockStore.getPickups());
  const [acceptingBidId, setAcceptingBidId] = useState<string | null>(null);

  // Time remaining string
  const [timeRemaining, setTimeRemaining] = useState<string>('02h : 45m : 12s');

  // Dispute modal state
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeSuccess, setDisputeSuccess] = useState(false);
  const [submittingDispute, setSubmittingDispute] = useState(false);

  // Rating modal state
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingReason, setRatingReason] = useState('');
  const [ratingReasonError, setRatingReasonError] = useState('');
  const [ratingComment, setRatingComment] = useState('');
  const [ratingSuccess, setRatingSuccess] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [targetPickupForRating, setTargetPickupForRating] = useState<PickupOrder | null>(null);

  // Filter listings based on active tab
  const activeListings = useMemo(() => {
    return listings.filter((l) => l.status !== 'completed' && l.status !== 'cancelled');
  }, [listings]);

  const completedListings = useMemo(() => {
    return listings.filter((l) => l.status === 'completed');
  }, [listings]);

  // Active displayed listing
  const currentListing = useMemo(() => {
    if (!selectedListingId) return null;
    return listings.find((l) => l.id === selectedListingId) || null;
  }, [listings, selectedListingId]);

  // Associated pickup order for current listing
  const currentPickup = useMemo(() => {
    if (!currentListing) return undefined;
    return pickups.find((p) => p.listing_id === currentListing.id);
  }, [currentListing, pickups]);

  // Realtime subscription via Supabase if configured
  useEffect(() => {
    if (!selectedListingId || !isSupabaseConfigured()) return;

    try {
      const supabase = createClient();
      const channel = supabase
        .channel(`listing-offers-${selectedListingId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'offers',
            filter: `listing_id=eq.${selectedListingId}`,
          },
          () => {
            refreshBids();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.warn('Realtime subscription skipped or offline', err);
    }
  }, [selectedListingId, refreshBids]);

  // Live countdown ticker to bid expiry
  useEffect(() => {
    if (!currentListing) return;

    const updateCountdown = () => {
      const expiry = new Date(currentListing.bid_window_expires_at).getTime();
      const now = Date.now();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeRemaining('Bidding Ended');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      const hStr = hours < 10 ? `0${hours}` : `${hours}`;
      const mStr = mins < 10 ? `0${mins}` : `${mins}`;
      const sStr = secs < 10 ? `0${secs}` : `${secs}`;

      setTimeRemaining(`${hStr}h : ${mStr}m : ${sStr}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [currentListing]);

  // Handler: Accept an offer
  const handleAcceptBid = (bidId: string) => {
    if (!currentListing) return;
    setAcceptingBidId(bidId);

    try {
      const { pickup } = MockStore.acceptBid(currentListing.id, bidId);
      setPickups(MockStore.getPickups());
      setListings(MockStore.getListings());
      refreshBids();
      
      // Auto-switch to newly created pickup
      if (pickup) {
        setPickups((prev) => {
          const exists = prev.some(p => p.id === pickup.id);
          return exists ? prev : [pickup, ...prev];
        });
      }
    } catch (err) {
      console.error('Accept error', err);
    } finally {
      setAcceptingBidId(null);
    }
  };

  // Handler: Confirm doorstep weighing & payment received
  const handleConfirmWeighin = () => {
    if (!currentPickup) return;
    const completed = MockStore.confirmPickupWeighin(currentPickup.id);
    if (completed) {
      setPickups(MockStore.getPickups());
      setListings(MockStore.getListings());
      // Prompt 5-star rating modal immediately upon payment confirmation
      setTargetPickupForRating(completed);
      setIsRatingOpen(true);
    }
  };

  // Handler: Submit dispute
  const handleSubmitDispute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPickup || !disputeReason.trim()) return;

    setSubmittingDispute(true);
    try {
      MockStore.saveDispute({
        pickupId: currentPickup.id,
        reason: disputeReason.trim(),
      });
      setDisputeSuccess(true);
      setTimeout(() => {
        setIsDisputeOpen(false);
        setDisputeSuccess(false);
        setDisputeReason('');
      }, 2000);
    } catch (err) {
      console.error('Dispute submission error', err);
    } finally {
      setSubmittingDispute(false);
    }
  };

  // Handler: Submit rating with mandatory reason for 1-2 stars
  const handleSubmitRating = (e: React.FormEvent) => {
    e.preventDefault();
    const target = targetPickupForRating || currentPickup;
    if (!target) return;

    // Validate: 1-2 stars strictly requires a reason
    if (ratingStars <= 2 && !ratingReason.trim()) {
      setRatingReasonError('Please select or specify a reason for 1-2 star rating');
      return;
    }
    setRatingReasonError('');

    setSubmittingRating(true);
    try {
      MockStore.saveRating({
        pickupId: target.id,
        fromRole: 'seller',
        stars: ratingStars,
        reason: ratingStars <= 2 ? ratingReason.trim() : undefined,
        comment: ratingComment.trim() || undefined,
      });
      setRatingSuccess(true);
      setPickups(MockStore.getPickups());
      setTimeout(() => {
        setIsRatingOpen(false);
        setRatingSuccess(false);
        setRatingComment('');
        setRatingReason('');
        setRatingReasonError('');
        setTargetPickupForRating(null);
      }, 1800);
    } catch (err) {
      console.error('Rating submission error', err);
    } finally {
      setSubmittingRating(false);
    }
  };

  // Identify highest offer among bids
  const highestOfferAmount = useMemo(() => {
    if (bids.length === 0) return 0;
    return Math.max(...bids.map((b) => b.total_estimated_amount));
  }, [bids]);

  // Determine current timeline step (1 to 4)
  const timelineStep = useMemo(() => {
    if (!currentListing) return 1;
    if (currentListing.status === 'completed') return 4;
    if (currentPickup?.status === 'weighing') return 3;
    if (currentListing.status === 'bid_accepted' || currentPickup) return 2;
    return 1;
  }, [currentListing, currentPickup]);

  return (
    <div className="space-y-6">
      {/* Tabs: Active Listings vs Completed History */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => {
            setActiveTab('active');
            if (activeListings.length > 0 && !activeListings.some(l => l.id === selectedListingId)) {
              setSelectedListingId(activeListings[0].id);
            }
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm min-h-[48px] transition-all ${
            activeTab === 'active'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
          }`}
        >
          <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>{t('tabsActive', { count: activeListings.length })}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('history');
            if (completedListings.length > 0 && !completedListings.some(l => l.id === selectedListingId)) {
              setSelectedListingId(completedListings[0].id);
            }
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm min-h-[48px] transition-all ${
            activeTab === 'history'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{t('tabsHistory', { count: completedListings.length })}</span>
        </button>
      </div>

      {/* Listing Selector Pills */}
      {((activeTab === 'active' ? activeListings : completedListings).length > 0) && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {(activeTab === 'active' ? activeListings : completedListings).map((l) => (
            <button
              key={l.id}
              onClick={() => setSelectedListingId(l.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border min-h-[48px] ${
                selectedListingId === l.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              {l.title} ({l.total_approx_weight_kg} kg)
            </button>
          ))}
        </div>
      )}

      {/* Empty State */}
      {((activeTab === 'active' ? activeListings : completedListings).length === 0) && (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-xs max-w-lg mx-auto">
          <Radio className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">
            {activeTab === 'active' ? 'No Active Scrap Listings' : 'No Completed History Yet'}
          </h3>
          <p className="text-sm text-slate-500 mt-1 mb-6">
            {activeTab === 'active'
              ? 'Post a quick scrap pickup request to receive competing dealer bids within minutes.'
              : 'Pickups you mark completed will be archived here along with dealer ratings and receipts.'}
          </p>
          <Link
            href="/sell"
            className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-3 rounded-2xl shadow-xs text-sm min-h-[48px]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Scrap Now</span>
          </Link>
        </div>
      )}

      {currentListing && (
        <div className="space-y-6">
          {/* Status Timeline */}
          <div className="card-premium p-5 sm:p-6">
            <span className="text-xs font-bold text-muted uppercase tracking-wider block mb-3">
              {t('timelineTitle')}
            </span>
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { step: 1, label: t('timelineStep1') },
                { step: 2, label: t('timelineStep2') },
                { step: 3, label: t('timelineStep3') },
                { step: 4, label: t('timelineStep4') },
              ].map(({ step, label }) => {
                const isCurrent = timelineStep === step;
                const isDone = timelineStep >= step;
                return (
                  <div key={step} className="flex flex-col items-center gap-1.5">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        isDone
                          ? 'bg-[var(--primary)] text-white shadow-xs'
                          : 'bg-muted/10 text-muted border border-border'
                      } ${isCurrent ? 'ring-4 ring-[var(--primary)]/20' : ''}`}
                    >
                      {isDone ? '✓' : step}
                    </div>
                    <span
                      className={`text-[11px] font-bold ${
                        isDone ? 'text-foreground' : 'text-muted'
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Listing Overview & Live Countdown */}
            <div className="lg:col-span-1 space-y-5">
              <div className="card-premium p-5 sm:p-6">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      currentListing.status === 'completed'
                        ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        : currentListing.status === 'open_for_bids'
                        ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                        : 'bg-[var(--primary-tint)] dark:bg-[var(--primary)]/20 text-[var(--primary)] dark:text-[var(--primary-tint)] border border-[var(--primary)]/30'
                    }`}
                  >
                    {currentListing.status === 'completed'
                      ? t('statusCompleted')
                      : currentListing.status === 'open_for_bids'
                      ? 'Bidding In Progress'
                      : t('statusScheduled')}
                  </span>
                  <span className="text-xs text-muted font-medium">
                    {currentListing.items.length} categories
                  </span>
                </div>

                <h2 className="font-bold text-foreground text-lg mt-3">
                  {currentListing.title}
                </h2>

                <p className="text-xs text-muted mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-muted shrink-0" />
                  <span>{currentListing.address}, {currentListing.city}</span>
                </p>

                {/* Photo thumbnail */}
                {currentListing.photos.length > 0 && (
                  <div className="mt-4 rounded-2xl overflow-hidden aspect-video relative border border-border bg-muted/10">
                    <OptimizedImage
                      src={currentListing.photos[0]}
                      alt={currentListing.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded-lg z-20 tabular-nums">
                      {currentListing.total_approx_weight_kg} kg approx
                    </div>
                  </div>
                )}

                {/* Category Weight Breakdown */}
                <div className="mt-4 pt-3 border-t border-border space-y-2">
                  <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
                    Weight Estimate:
                  </span>
                  {currentListing.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-xs text-foreground font-medium">
                      <span className="capitalize">{item.category_slug}</span>
                      <span className="font-bold text-foreground tabular-nums">{item.approx_weight_kg} kg</span>
                    </div>
                  ))}
                </div>

                {/* Live Countdown Box (when open for bids) */}
                {currentListing.status === 'open_for_bids' && (
                  <div className="mt-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider mb-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>{t('biddingTimer')}</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-amber-900 dark:text-amber-200 tracking-wider font-mono tabular-nums">
                      {timeRemaining}
                    </div>
                  </div>
                )}
              </div>

              {/* Hand-to-Hand Direct Payment Banner */}
              <div className="bg-[var(--primary-tint)] dark:bg-[var(--primary)]/20 rounded-[14px] p-4 border border-[var(--primary)]/30 text-foreground text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-[var(--primary)] dark:text-emerald-300">
                  <Banknote className="w-4 h-4 text-[var(--primary)] dark:text-emerald-300" />
                  <span>Zero Platform Middleman</span>
                </div>
                <p className="text-muted leading-relaxed">
                  The winning dealer brings a certified digital scale to your doorstep, checks actual weight, and pays you immediately via Cash or your UPI QR code. RaddiBhaav never collects or holds your payout.
                </p>
              </div>
            </div>

            {/* Right Column: Bids, Doorstep Completion & Accepted Banner */}
            <div className="lg:col-span-2 space-y-4">
              {/* Accepted Offer & Doorstep Safety Code Card */}
              {currentPickup && (
                <div className="bg-gradient-to-br from-[#0F3D2E] to-[#07140F] text-white rounded-[20px] p-6 sm:p-7 shadow-lg border border-[var(--primary)]/40 space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      {t('acceptedBadge')} — {currentPickup.status === 'completed' ? t('statusCompleted') : t('statusScheduled')}
                    </span>

                    {currentPickup.status === 'completed' && (
                      <button
                        type="button"
                        onClick={() => {
                          setTargetPickupForRating(currentPickup);
                          setIsRatingOpen(true);
                        }}
                        className="btn-gold text-xs py-1.5 px-3 min-h-[40px]"
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>Rate Dealer</span>
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-serif font-bold text-white">{currentPickup.dealer_name}</h3>
                      <p className="text-sm text-emerald-200/80 mt-1">
                        Scheduled: {currentPickup.scheduled_at}
                      </p>
                    </div>

                    {/* Unlocked Contact Actions (Direct Phone & WhatsApp) */}
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${currentPickup.dealer_phone}`}
                        className="btn-primary text-xs py-2 px-4"
                      >
                        <Phone className="w-4 h-4" />
                        <span>{t('callDealer')}</span>
                      </a>

                      <a
                        href={`https://wa.me/${currentPickup.dealer_phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-[14px] shadow-xs text-xs min-h-[48px] transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>{t('whatsappDealer')}</span>
                      </a>
                    </div>
                  </div>

                  {/* 4-digit Doorstep Safety Code */}
                  <div className="pt-4 border-t border-emerald-700/50 bg-white/5 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs text-emerald-200 font-bold block">
                        {t('doorstepOtp')}
                      </span>
                      <p className="text-[11px] text-emerald-300/70 mt-0.5">
                        {t('doorstepOtpDesc')}
                      </p>
                    </div>
                    <div className="text-3xl font-bold tracking-widest text-[var(--accent)] bg-black/60 px-5 py-2.5 rounded-2xl border border-[var(--accent)]/30 font-mono self-start sm:self-auto tabular-nums">
                      {currentPickup.otp_code}
                    </div>
                  </div>
                </div>
              )}

              {/* Pickup Completion & Doorstep Weigh-in Card */}
              {currentPickup && currentPickup.status === 'weighing' && (
                <div className="bg-amber-500/10 border-2 border-amber-500/40 rounded-[20px] p-5 sm:p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <Scale className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-foreground text-base">
                        {t('finalWeighinTitle')}
                      </h4>
                      <p className="text-xs text-muted mt-0.5">
                        {t('finalWeighinDesc')}
                      </p>
                    </div>
                  </div>

                  {/* Weight and Payout Summary */}
                  <div className="grid grid-cols-2 gap-3 bg-surface p-4 rounded-2xl border border-border">
                    <div>
                      <span className="text-xs font-bold text-muted block">
                        {t('finalWeight')}
                      </span>
                      <span className="text-xl sm:text-2xl font-bold text-foreground font-mono tabular-nums">
                        {currentPickup.final_weight_kg || 36.2} kg
                      </span>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-muted block">
                        {t('finalAmount')}
                      </span>
                      <span className="text-xl sm:text-2xl font-bold text-[var(--primary)] dark:text-emerald-400 font-rupee tabular-nums">
                        ₹{currentPickup.final_total_amount || 645}
                      </span>
                    </div>
                  </div>

                  {/* Confirm or Dispute Actions */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleConfirmWeighin}
                      className="w-full sm:w-auto flex-1 btn-primary text-sm py-3 justify-center"
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                      <span>{t('confirmPaymentBtn')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsDisputeOpen(true)}
                      className="w-full sm:w-auto btn-outline text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs py-3 justify-center border-rose-300"
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>{t('raiseDisputeBtn')}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Competing Dealer Bids Header */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl">
                    {t('bidsCount', { count: bids.length })}
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                    {t('realtimeActive')}
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  Sorted by highest payout
                </span>
              </div>

              {bids.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-xs">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto mb-3" />
                  <h4 className="font-bold text-slate-800 text-base">{t('noBidsYet')}</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Nearby kabadiwalas are reviewing your scrap items and weight.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bids.map((bid) => {
                    const isAccepted = bid.status === 'accepted';
                    const isRejected = bid.status === 'rejected';
                    const isHighestOffer = bid.total_estimated_amount === highestOfferAmount && bids.length > 1;

                    return (
                      <div
                        key={bid.id}
                        className={`card-premium p-6 sm:p-7 relative transition-all ${
                          isAccepted
                            ? 'border-2 border-primary ring-2 ring-primary/20 shadow-md'
                            : isHighestOffer
                            ? 'border-2 border-accent shadow-[0_6px_28px_-4px_rgba(201,162,39,0.22)]'
                            : isRejected
                            ? 'opacity-60'
                            : 'hover:border-primary/40'
                        }`}
                      >
                        {/* Highest Offer / Best Offer Badge */}
                        {isHighestOffer && !isAccepted && (
                          <div className="absolute -top-3.5 left-6 bg-accent text-slate-950 text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-sm flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                            <span>{t('highestOfferBadge')}</span>
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-border">
                          <div className="space-y-1.5">
                            <h4 className="font-serif font-bold text-text text-base sm:text-lg">
                              {bid.dealer_name}
                            </h4>

                            {/* Trust Badges */}
                            <DealerTrustBadges
                              isKycVerified={true}
                              totalPickups={bid.dealer_pickups_count || 14}
                              rating={bid.dealer_rating}
                              scaleCertified={true}
                              size="sm"
                            />

                            <div className="flex items-center gap-3 text-xs text-muted pt-0.5">
                              <span>{bid.dealer_distance_km} km {t('dealerDistance')}</span>
                              <span>•</span>
                              <span className="text-primary dark:text-accent font-semibold">{t('eta')} ~{bid.eta_minutes} mins</span>
                            </div>
                          </div>

                          {/* Estimated Payout Price Badge */}
                          <div className="text-left sm:text-right">
                            <span className="text-[11px] font-semibold text-muted block">
                              {t('estimatedPayout')}
                            </span>
                            <span className="text-2xl sm:text-3xl font-black text-accent tabular-nums font-sans">
                              ₹{bid.total_estimated_amount}
                            </span>
                          </div>
                        </div>

                        {/* Rates Breakdown */}
                        <div className="py-3 flex flex-wrap gap-2 text-xs">
                          {Object.entries(bid.rate_breakdown).map(([slug, rate]) => (
                            <span
                              key={slug}
                              className="bg-muted-bg/60 px-3 py-1.5 rounded-[10px] border border-border text-text font-medium"
                            >
                              <span className="capitalize">{slug}:</span>{' '}
                              <strong className="text-text font-sans font-bold tabular-nums">₹{rate}/kg</strong>
                            </span>
                          ))}
                        </div>

                        {bid.notes && (
                          <p className="text-xs text-muted italic bg-muted-bg/40 p-3 rounded-[12px] border border-border">
                            &ldquo;{bid.notes}&rdquo;
                          </p>
                        )}

                        {/* Masked Contact Protection Notice */}
                        <div className="mt-3 p-3 rounded-[14px] bg-muted-bg/60 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2 text-muted">
                            <Phone className="w-3.5 h-3.5 text-muted shrink-0" />
                            <span>
                              Dealer Contact:{' '}
                              {isAccepted ? (
                                <strong className="text-primary dark:text-accent font-sans font-bold">{currentPickup?.dealer_phone || '+91 98334 11223'}</strong>
                              ) : (
                                <span className="font-sans text-muted tracking-wider">+91 98XXX XXXXX</span>
                              )}
                            </span>
                          </div>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-[8px] ${
                            isAccepted
                              ? 'bg-primary-tint text-primary dark:text-accent'
                              : 'bg-accent-tint text-text border border-accent/20'
                          }`}>
                            {isAccepted ? 'Direct Calling Unlocked' : 'Masked & Protected until Accepted'}
                          </span>
                        </div>

                        {/* Accept Action */}
                        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                          <span className="text-xs text-muted">
                            Pickup Slot: <strong className="text-text">{bid.pickup_slot}</strong>
                          </span>

                          {isAccepted ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary dark:text-accent bg-primary-tint px-4 py-2 rounded-[12px] border border-primary/20 min-h-[48px]">
                              <CheckCircle2 className="w-4 h-4 text-primary dark:text-accent" />
                              {t('acceptedBadge')}
                            </span>
                          ) : currentListing.status === 'open_for_bids' ? (
                            <button
                              type="button"
                              onClick={() => handleAcceptBid(bid.id)}
                              disabled={acceptingBidId === bid.id}
                              className="btn-primary text-xs font-bold px-6 py-2.5 min-h-[48px]"
                            >
                              {acceptingBidId === bid.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4 text-accent" />
                              )}
                              <span>{t('acceptOffer')}</span>
                            </button>
                          ) : (
                            <span className="text-xs text-muted font-medium">Closed</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Seller Loyalty & Referral Rewards Card (MVP Design Stub) */}
      <LoyaltyReferralCard 
        role="seller" 
        userId="seller-demo-user" 
        city={currentListing?.city || 'Nashik'} 
      />

      {/* DISPUTE MODAL */}
      {isDisputeOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-[20px] p-6 sm:p-7 max-w-md w-full shadow-2xl border border-border space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-base">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>{t('disputeTitle')}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsDisputeOpen(false)}
                className="p-1.5 text-muted hover:text-foreground rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {disputeSuccess ? (
              <div className="bg-[var(--primary-tint)] dark:bg-[var(--primary)]/20 text-[var(--primary)] dark:text-[var(--primary-tint)] p-4 rounded-2xl border border-[var(--primary)]/30 text-sm text-center font-medium">
                Dispute submitted successfully. Our support team will investigate and contact you shortly.
              </div>
            ) : (
              <form onSubmit={handleSubmitDispute} className="space-y-4">
                <p className="text-xs text-muted">
                  If the dealer scale gave an incorrect weight or the payout amount did not match the agreed rate, report it below.
                </p>

                <textarea
                  rows={4}
                  required
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder={t('disputePlaceholder')}
                  className="w-full bg-muted/10 border border-border rounded-xl p-3 text-sm text-foreground focus:bg-surface focus:outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                />

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsDisputeOpen(false)}
                    className="btn-ghost text-xs px-4 py-2"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submittingDispute || !disputeReason.trim()}
                    className="btn-primary bg-rose-600 hover:bg-rose-700 text-xs px-5 py-2.5 disabled:opacity-50"
                  >
                    {submittingDispute && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{t('submitDispute')}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* RATING MODAL */}
      {isRatingOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-[20px] p-6 sm:p-7 max-w-md w-full shadow-2xl border border-border space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="font-bold text-foreground text-base">
                  {t('rateDealerTitle', { dealer: (targetPickupForRating || currentPickup)?.dealer_name || 'Dealer' })}
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  {t('rateDealerSubtitle')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRatingOpen(false)}
                className="p-1.5 text-muted hover:text-foreground rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {ratingSuccess ? (
              <div className="bg-[var(--primary-tint)] dark:bg-[var(--primary)]/20 text-[var(--primary)] dark:text-[var(--primary-tint)] p-4 rounded-2xl border border-[var(--primary)]/30 text-sm text-center font-bold">
                {t('ratingSuccess')}
              </div>
            ) : (
              <form onSubmit={handleSubmitRating} className="space-y-4">
                {/* 5-Star Interactive Selector */}
                <div className="flex items-center justify-center gap-2 py-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingStars(star)}
                      className="p-2 min-w-[48px] min-h-[48px] flex items-center justify-center rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/40 active:scale-95 transition-all"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= ratingStars
                            ? 'text-[var(--accent)] fill-[var(--accent)]'
                            : 'text-muted/30'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                {/* Mandatory Reason Prompt for 1-2 Stars */}
                {ratingStars <= 2 && (
                  <div className="space-y-2 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 p-3.5 rounded-2xl animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-rose-950 dark:text-rose-200 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        Required: What went wrong?
                      </label>
                      <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 bg-rose-200/80 dark:bg-rose-900/50 px-2 py-0.5 rounded-md uppercase">
                        Mandatory
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {[
                        'Paid less than agreed offer',
                        'Scale reading tare dispute',
                        'Arrived very late / No-show',
                        'Rude / unprofessional behavior',
                      ].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => {
                            setRatingReason(preset);
                            setRatingReasonError('');
                          }}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-xl transition-all ${
                            ratingReason === preset
                              ? 'bg-rose-700 text-white shadow-xs'
                              : 'bg-surface text-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-800 hover:bg-rose-100'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>

                    <input
                      type="text"
                      value={ratingReason}
                      onChange={(e) => {
                        setRatingReason(e.target.value);
                        setRatingReasonError('');
                      }}
                      placeholder="Or specify the reason for low rating..."
                      className="w-full bg-surface border border-rose-300 dark:border-rose-700 rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted focus:outline-hidden focus:border-rose-500"
                    />

                    {ratingReasonError && (
                      <p className="text-[11px] text-rose-600 font-bold">{ratingReasonError}</p>
                    )}
                  </div>
                )}

                <textarea
                  rows={3}
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  placeholder="Additional details about scale accuracy, speed, and behavior (optional)..."
                  className="w-full bg-muted/10 border border-border rounded-xl p-3 text-sm text-foreground focus:bg-surface focus:outline-hidden focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                />

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRatingOpen(false);
                      setRatingReason('');
                      setRatingReasonError('');
                    }}
                    className="btn-ghost text-xs px-4 py-2"
                  >
                    Skip
                  </button>

                  <button
                    type="submit"
                    disabled={submittingRating || (ratingStars <= 2 && !ratingReason.trim())}
                    className="btn-primary text-xs px-5 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingRating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{t('submitRating')}</span>
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
