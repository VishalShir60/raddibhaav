// ==============================================================================
// Supabase Edge Function: notify-dealers
// Invoked via Database Webhook on INSERT into public.listings
// Finds nearby KYC-approved dealers and triggers notifications
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

    const { record: listing } = await req.json();

    if (!listing || !listing.id) {
      return new Response(JSON.stringify({ error: "Missing listing record" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Call PostGIS RPC: find_nearby_dealers
    const { data: nearbyDealers, error: rpcError } = await supabaseClient.rpc(
      "find_nearby_dealers",
      { target_listing_id: listing.id }
    );

    if (rpcError) {
      throw rpcError;
    }

    // 2. Insert In-App notifications and dispatch webhooks
    const notificationsToInsert = (nearbyDealers || []).map((dealer: any) => ({
      user_id: dealer.dealer_id,
      title: "New Scrap Request Nearby! 📦",
      message: `A new request was posted ${dealer.distance_km} km away. Submit your competing offer within 2 hours!`,
      type: "new_listing_nearby",
      metadata: {
        listing_id: listing.id,
        distance_km: dealer.distance_km,
        shop_name: dealer.shop_name,
        action_url: `/dealer?listing=${listing.id}`,
        // MVP zero-cost click-to-share WhatsApp link
        whatsapp_share_url: `https://wa.me/91${dealer.phone}?text=${encodeURIComponent(
          `*New Scrap Request Nearby!*\nPosted ${dealer.distance_km} km away.\nhttps://raddibhaav.in/dealer?listing=${listing.id}`
        )}`,
      },
    }));

    if (notificationsToInsert.length > 0) {
      await supabaseClient.from("notifications").insert(notificationsToInsert);
    }

    return new Response(
      JSON.stringify({
        success: true,
        listing_id: listing.id,
        dealers_notified_count: notificationsToInsert.length,
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
