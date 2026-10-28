// ==============================================================================
// RaddiBhaav: Payout Calculation, 15% Weight Divergence Rule, & Anti-Lowball
// ==============================================================================

import type {
  PayoutCalculationResult,
  PayoutItem,
  LowballCheckResult,
} from './types';

export interface RawWeighinItem {
  category_slug: string;
  est_weight_kg: number;
  actual_weight_kg: number;
}

export const WEIGHT_DIVERGENCE_THRESHOLD_PERCENT = 15;

/**
 * Calculates final payout from actual weighed kilograms and agreed category rates.
 * Also evaluates the 15% Final-Weight rule:
 * If actual total weight differs from estimate by > 15%, seller has the right to re-confirm or cancel without penalty.
 */
export function calculateFinalPayout(
  items: RawWeighinItem[],
  categoryRates: Record<string, number>
): PayoutCalculationResult {
  let totalEstWeight = 0;
  let totalActualWeight = 0;
  let totalPayout = 0;

  const payoutItems: PayoutItem[] = [];

  for (const item of items) {
    const rate = categoryRates[item.category_slug] ?? 0;
    const estWeight = Math.max(0, item.est_weight_kg);
    const actualWeight = Math.max(0, item.actual_weight_kg);

    const itemPayout = Math.round(actualWeight * rate * 100) / 100;

    totalEstWeight += estWeight;
    totalActualWeight += actualWeight;
    totalPayout += itemPayout;

    payoutItems.push({
      category_slug: item.category_slug,
      est_weight_kg: estWeight,
      actual_weight_kg: actualWeight,
      rate_per_kg: rate,
      item_payout: itemPayout,
    });
  }

  // Rounded values
  totalEstWeight = Math.round(totalEstWeight * 100) / 100;
  totalActualWeight = Math.round(totalActualWeight * 100) / 100;
  totalPayout = Math.round(totalPayout * 100) / 100;

  const weightDiffKg = Math.round(Math.abs(totalActualWeight - totalEstWeight) * 100) / 100;
  const weightDiffPercent =
    totalEstWeight > 0
      ? Math.round((weightDiffKg / totalEstWeight) * 10000) / 100
      : 0;

  const isDivergent = weightDiffPercent > WEIGHT_DIVERGENCE_THRESHOLD_PERCENT;

  return {
    items: payoutItems,
    total_est_weight_kg: totalEstWeight,
    total_actual_weight_kg: totalActualWeight,
    final_payout_amount: totalPayout,
    weight_diff_kg: weightDiffKg,
    weight_diff_percent: weightDiffPercent,
    is_divergent: isDivergent,
    requires_seller_reconfirmation: isDivergent,
    can_cancel_without_penalty: isDivergent,
  };
}

/**
 * Anti-Lowball Verification Rule:
 * If a dealer attempts to pay less than the formulaically agreed rate-card calculation,
 * the platform flags it and empowers the seller to raise an immediate dispute.
 */
export function checkLowballViolation(
  expectedPayoutAmount: number,
  actualPaidAmount: number
): LowballCheckResult {
  const expected = Math.round(expectedPayoutAmount * 100) / 100;
  const actual = Math.round(actualPaidAmount * 100) / 100;

  // Tolerance of ₹1 for minor rounding differences
  const shortfall = Math.round((expected - actual) * 100) / 100;
  const isLowball = shortfall > 1.0;

  if (isLowball) {
    return {
      is_lowball: true,
      expected_amount: expected,
      actual_paid_amount: actual,
      shortfall_amount: shortfall,
      action: 'open_dispute',
      dispute_reason: `Dealer paid ₹${actual}, which is less than the rate-card calculated ₹${expected} (shortfall of ₹${shortfall}). Anti-lowball protection initiated.`,
    };
  }

  return {
    is_lowball: false,
    expected_amount: expected,
    actual_paid_amount: actual,
    shortfall_amount: 0,
    action: 'none',
  };
}
