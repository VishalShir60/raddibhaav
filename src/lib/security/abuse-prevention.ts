/**
 * RaddiBhaav Security & Abuse Prevention Engine
 * 
 * Implements:
 * 1. Rate limiting on OTP requests (max 3 per 10 min window)
 * 2. Rate limiting on dealer offer submissions (max 10 per 60s window)
 * 3. Seller cancellation abuse detection (>3 cancellations in 7 days)
 * 4. Dealer lowball offer abuse detection (>40% below benchmark floor)
 */

interface RateLimitBucket {
  timestamps: number[];
}

// In-memory sliding window rate limit buckets
const otpBuckets = new Map<string, RateLimitBucket>();
const offerBuckets = new Map<string, RateLimitBucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
  error?: string;
}

export interface SellerAbuseResult {
  abuseDetected: boolean;
  cancelledCount: number;
  action: 'none' | 'warning' | 'block_new_listings';
  message?: string;
}

export interface LowballAbuseResult {
  isLowball: boolean;
  percentageBelow: number;
  action: 'allow' | 'warn' | 'reject';
  message?: string;
}

/**
 * 1. OTP Rate Limiter (Max 3 OTP requests per 10 minutes per mobile number)
 */
export function checkOtpRateLimit(
  phone: string,
  maxRequests = 3,
  windowSeconds = 600,
  now = Date.now()
): RateLimitResult {
  const normalizedPhone = phone.replace(/[^0-9]/g, '');
  const windowStart = now - windowSeconds * 1000;

  const bucket = otpBuckets.get(normalizedPhone) || { timestamps: [] };
  // Retain only requests within the current sliding window
  const activeTimestamps = bucket.timestamps.filter((ts) => ts > windowStart);

  if (activeTimestamps.length >= maxRequests) {
    const oldest = activeTimestamps[0];
    const resetInSeconds = Math.max(1, Math.ceil((oldest + windowSeconds * 1000 - now) / 1000));
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds,
      error: `Too many OTP requests for this number. Please wait ${resetInSeconds} seconds before trying again.`,
    };
  }

  activeTimestamps.push(now);
  otpBuckets.set(normalizedPhone, { timestamps: activeTimestamps });

  return {
    allowed: true,
    remaining: maxRequests - activeTimestamps.length,
    resetInSeconds: windowSeconds,
  };
}

/**
 * 2. Dealer Offer Rate Limiter (Max 10 offer submissions per 60 seconds)
 */
export function checkOfferRateLimit(
  dealerId: string,
  maxOffers = 10,
  windowSeconds = 60,
  now = Date.now()
): RateLimitResult {
  const windowStart = now - windowSeconds * 1000;
  const bucket = offerBuckets.get(dealerId) || { timestamps: [] };
  const activeTimestamps = bucket.timestamps.filter((ts) => ts > windowStart);

  if (activeTimestamps.length >= maxOffers) {
    const oldest = activeTimestamps[0];
    const resetInSeconds = Math.max(1, Math.ceil((oldest + windowSeconds * 1000 - now) / 1000));
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds,
      error: `Offer rate limit exceeded. You can submit up to ${maxOffers} bids per minute. Wait ${resetInSeconds}s.`,
    };
  }

  activeTimestamps.push(now);
  offerBuckets.set(dealerId, { timestamps: activeTimestamps });

  return {
    allowed: true,
    remaining: maxOffers - activeTimestamps.length,
    resetInSeconds: windowSeconds,
  };
}

/**
 * 3. Seller Cancellation Abuse Detection
 * Detects sellers who repeatedly create and cancel listings (>3 cancellations in 7 days).
 */
export function detectSellerCancellationAbuse(
  sellerListings: Array<{ id: string; status: string; updated_at?: string; created_at: string }>,
  maxAllowedCancellations = 3,
  lookbackDays = 7,
  now = Date.now()
): SellerAbuseResult {
  const lookbackCutoff = now - lookbackDays * 86400 * 1000;

  const recentCancelled = sellerListings.filter((l) => {
    if (l.status !== 'cancelled') return false;
    const date = new Date(l.updated_at || l.created_at).getTime();
    return date > lookbackCutoff;
  });

  const count = recentCancelled.length;

  if (count > maxAllowedCancellations) {
    return {
      abuseDetected: true,
      cancelledCount: count,
      action: 'block_new_listings',
      message: `Account flagged for high cancellation rate (${count} cancelled listings in past ${lookbackDays} days). New listing creation temporarily restricted to maintain dealer network trust.`,
    };
  }

  if (count === maxAllowedCancellations) {
    return {
      abuseDetected: false,
      cancelledCount: count,
      action: 'warning',
      message: `You have cancelled ${count} listings this week. Further cancellations may restrict your ability to post scrap requests.`,
    };
  }

  return {
    abuseDetected: false,
    cancelledCount: count,
    action: 'none',
  };
}

/**
 * 4. Anti-Lowball Abuse Detection
 * Detects dealer offers that are predatory or excessively below benchmark rates (>40% below benchmark floor).
 */
export function detectLowballOffer(
  offerTotal: number,
  benchmarkMinTotal: number
): LowballAbuseResult {
  if (benchmarkMinTotal <= 0) {
    return { isLowball: false, percentageBelow: 0, action: 'allow' };
  }

  if (offerTotal >= benchmarkMinTotal) {
    return { isLowball: false, percentageBelow: 0, action: 'allow' };
  }

  const shortfall = benchmarkMinTotal - offerTotal;
  const percentageBelow = Math.round((shortfall / benchmarkMinTotal) * 100);

  // Reject predatory bids exceeding 40% below market floor
  if (percentageBelow > 40) {
    return {
      isLowball: true,
      percentageBelow,
      action: 'reject',
      message: `Offer of ₹${offerTotal} is ${percentageBelow}% below the Mandi market benchmark floor (₹${benchmarkMinTotal}). Predatory lowballing violates RaddiBhaav fair price rules.`,
    };
  }

  // Warn on offers 20-40% below floor
  if (percentageBelow >= 20) {
    return {
      isLowball: true,
      percentageBelow,
      action: 'warn',
      message: `Your offer is ${percentageBelow}% below standard market rates. Sellers rarely accept bids far below the Mandi average.`,
    };
  }

  return {
    isLowball: false,
    percentageBelow,
    action: 'allow',
  };
}

/**
 * Helper for tests to reset state
 */
export function _resetRateLimits(): void {
  otpBuckets.clear();
  offerBuckets.clear();
}
