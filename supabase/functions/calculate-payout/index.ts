// ==============================================================================
// Supabase Edge Function: calculate-payout
// Computes final doorstep payout from actual weighed kg and agreed rates
// Checks 15% weight divergence rule and anti-lowball protection
// ==============================================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { items, rates, paid_amount } = await req.json();

    if (!Array.isArray(items) || !rates) {
      return new Response(
        JSON.stringify({ error: "Missing items array or rates object" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let totalEst = 0;
    let totalActual = 0;
    let calculatedPayout = 0;

    const breakdown = items.map((it: any) => {
      const rate = Number(rates[it.category_slug] ?? 0);
      const estKg = Number(it.est_weight_kg || 0);
      const actKg = Number(it.actual_weight_kg || 0);
      const payout = Math.round(actKg * rate * 100) / 100;

      totalEst += estKg;
      totalActual += actKg;
      calculatedPayout += payout;

      return {
        category_slug: it.category_slug,
        est_weight_kg: estKg,
        actual_weight_kg: actKg,
        rate_per_kg: rate,
        item_payout: payout,
      };
    });

    totalEst = Math.round(totalEst * 100) / 100;
    totalActual = Math.round(totalActual * 100) / 100;
    calculatedPayout = Math.round(calculatedPayout * 100) / 100;

    const diffKg = Math.round(Math.abs(totalActual - totalEst) * 100) / 100;
    const diffPercent = totalEst > 0 ? Math.round((diffKg / totalEst) * 10000) / 100 : 0;
    const isDivergent = diffPercent > 15;

    // Anti-lowball check
    const paid = paid_amount !== undefined ? Number(paid_amount) : calculatedPayout;
    const shortfall = Math.round((calculatedPayout - paid) * 100) / 100;
    const isLowball = shortfall > 1.0;

    return new Response(
      JSON.stringify({
        success: true,
        breakdown,
        total_est_weight_kg: totalEst,
        total_actual_weight_kg: totalActual,
        calculated_payout_amount: calculatedPayout,
        weight_diff_kg: diffKg,
        weight_diff_percent: diffPercent,
        is_divergent: isDivergent,
        requires_seller_reconfirmation: isDivergent,
        can_cancel_without_penalty: isDivergent,
        anti_lowball: {
          is_lowball: isLowball,
          shortfall_amount: shortfall > 0 ? shortfall : 0,
          action: isLowball ? "open_dispute" : "none",
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
