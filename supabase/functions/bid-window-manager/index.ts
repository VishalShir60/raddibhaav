// ==============================================================================
// Supabase Edge Function: bid-window-manager
// Invoked periodically via pg_cron or scheduled trigger
// Auto-extends 2h bid window by 1h if < 2 offers arrive and widens radius by 3 km
// ==============================================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.118.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const now = new Date().toISOString();

    // 1. Fetch expired active listings
    const { data: expiredListings, error: fetchErr } = await supabaseClient
      .from("listings")
      .select("id, created_at, bid_expires_at, status, notes")
      .in("status", ["open", "offers_received"])
      .lte("bid_expires_at", now);

    if (fetchErr) throw fetchErr;

    const results = [];

    for (const listing of expiredListings || []) {
      // 2. Count non-withdrawn offers
      const { count: offersCount, error: countErr } = await supabaseClient
        .from("offers")
        .select("*", { count: "exact", head: true })
        .eq("listing_id", listing.id)
        .neq("status", "withdrawn");

      if (countErr) continue;

      const hasBeenExtended = listing.notes?.includes("AUTO_EXTENDED");

      if ((offersCount || 0) < 2 && !hasBeenExtended) {
        // Auto-extend by 1 hour and mark +3 km search radius
        const newExpiry = new Date(Date.now() + 60 * 60 * 1000).toISOString();
        const updatedNotes = `${listing.notes || ""} [AUTO_EXTENDED_1H_PLUS_3KM]`.trim();

        await supabaseClient
          .from("listings")
          .update({
            bid_expires_at: newExpiry,
            notes: updatedNotes,
          })
          .eq("id", listing.id);

        results.push({
          listing_id: listing.id,
          action: "auto_extended_1h",
          new_expiry: newExpiry,
          offers_count: offersCount,
        });
      } else {
        // Close bidding
        await supabaseClient
          .from("listings")
          .update({
            status: (offersCount || 0) > 0 ? "offers_received" : "expired",
          })
          .eq("id", listing.id);

        results.push({
          listing_id: listing.id,
          action: "closed",
          offers_count: offersCount,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed_count: results.length,
        results,
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
