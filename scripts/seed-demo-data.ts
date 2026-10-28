/**
 * RaddiBhaav Demo Seed Script (Nashik Market Launch)
 * Creates 1 Demo Admin, 3 Verified Local Dealers, 1 Household Seller, and Sample Listings for Nashik.
 *
 * SAFETY GUARD:
 * This script runs ONLY when explicitly enabled via environment variable:
 *   ENABLE_DEMO_SEED=true or SEED_DEMO_DATA=true
 * In production without this flag, it exits immediately without modifying data.
 *
 * Usage:
 *   npx tsx scripts/seed-demo-data.ts
 */

import { createClient } from '@supabase/supabase-js';

// Pre-generated deterministic UUIDs for repeatable demo seeding
const DEMO_IDS = {
  admin: '00000000-0000-0000-0000-000000000001',
  seller: '00000000-0000-0000-0000-000000000002',
  dealer1: '00000000-0000-0000-0000-000000000011',
  dealer2: '00000000-0000-0000-0000-000000000012',
  dealer3: '00000000-0000-0000-0000-000000000013',
  listing1: '00000000-0000-0000-0000-000000000101',
  listing2: '00000000-0000-0000-0000-000000000102',
  offer1: '00000000-0000-0000-0000-000000000201',
  offer2: '00000000-0000-0000-0000-000000000202',
  offer3: '00000000-0000-0000-0000-000000000203',
};

async function main() {
  const isEnabled = process.env.ENABLE_DEMO_SEED === 'true' || process.env.SEED_DEMO_DATA === 'true';

  if (!isEnabled) {
    console.log('\n[RaddiBhaav Seed Guard] Demo seeding is disabled by default.');
    console.log('To run this script in development/demo mode, set:');
    console.log('  export ENABLE_DEMO_SEED=true');
    console.log('Exiting safely without modifying database.\n');
    process.exit(0);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pekvmmqcknclmkhtbagn.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('================================================================');
  console.log('🌱 RaddiBhaav: Seeding Nashik Demo Marketplace Data');
  console.log(`Target Supabase URL: ${supabaseUrl}`);
  console.log('================================================================');

  if (!serviceRoleKey) {
    console.warn('\n⚠️  SUPABASE_SERVICE_ROLE_KEY is not defined in environment.');
    console.log('Printing deterministic SQL seed queries for direct execution via Supabase SQL editor:');
    console.log('----------------------------------------------------------------');
    console.log(generateSqlSeed());
    console.log('----------------------------------------------------------------\n');
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    // 1. Seed Profiles
    console.log('1. Seeding User Profiles (Admin, Seller, Dealers)...');
    const profiles = [
      {
        id: DEMO_IDS.admin,
        role: 'admin',
        name: 'Nashik Market Admin Officer',
        phone: '+919999900000',
        language: 'en',
        city: 'Nashik',
      },
      {
        id: DEMO_IDS.seller,
        role: 'seller',
        name: 'Sanjay Patil (Household)',
        phone: '+919876543210',
        language: 'mr',
        city: 'Nashik',
      },
      {
        id: DEMO_IDS.dealer1,
        role: 'dealer',
        name: 'Ganesh Shinde',
        phone: '+919823011111',
        language: 'mr',
        city: 'Nashik',
      },
      {
        id: DEMO_IDS.dealer2,
        role: 'dealer',
        name: 'Rajesh Gupta',
        phone: '+919823022222',
        language: 'hi',
        city: 'Nashik',
      },
      {
        id: DEMO_IDS.dealer3,
        role: 'dealer',
        name: 'Vijay Deshmukh',
        phone: '+919823033333',
        language: 'en',
        city: 'Nashik',
      },
    ];

    for (const p of profiles) {
      await supabase.from('profiles').upsert(p, { onConflict: 'id' });
    }

    // 2. Seed Dealers with PostGIS locations in Nashik
    console.log('2. Seeding Verified Nashik Scrap Dealers (Kabadiwalas)...');
    const dealers = [
      {
        profile_id: DEMO_IDS.dealer1,
        shop_name: 'Shree Ganesh Scrap Traders',
        service_radius_km: 8.0,
        // College Road, Nashik (19.9975, 73.7898)
        location: 'POINT(73.7898 19.9975)',
        kyc_status: 'approved',
        kyc_docs: { verified_at: new Date().toISOString(), scale_type: 'ISO Digital Crane Scale 300kg' },
        rating_avg: 4.90,
        total_pickups: 412,
        is_active: true,
      },
      {
        profile_id: DEMO_IDS.dealer2,
        shop_name: 'Godavari Eco Recyclers',
        service_radius_km: 6.5,
        // Panchavati, Nashik (20.0110, 73.7900)
        location: 'POINT(73.7900 20.0110)',
        kyc_status: 'approved',
        kyc_docs: { verified_at: new Date().toISOString(), scale_type: 'Calibrated Platform Scale' },
        rating_avg: 4.85,
        total_pickups: 289,
        is_active: true,
      },
      {
        profile_id: DEMO_IDS.dealer3,
        shop_name: 'Nashik Metal & Raddi Mart',
        service_radius_km: 10.0,
        // CIDCO New Nashik (19.9650, 73.7650)
        location: 'POINT(73.7650 19.9650)',
        kyc_status: 'approved',
        kyc_docs: { verified_at: new Date().toISOString(), scale_type: 'Precision Digital Scale' },
        rating_avg: 4.75,
        total_pickups: 175,
        is_active: true,
      },
    ];

    for (const d of dealers) {
      await supabase.from('dealers').upsert(d, { onConflict: 'profile_id' });
    }

    // 3. Seed Sample Listings in Nashik
    console.log('3. Seeding Sample Scrap Listings in Nashik...');
    const now = Date.now();
    const listings = [
      {
        id: DEMO_IDS.listing1,
        seller_id: DEMO_IDS.seller,
        address: 'Flat 402, Shriram Heights, Gangapur Road, Nashik',
        location: 'POINT(73.7750 20.0050)',
        pickup_window: 'Morning (10:00 AM - 1:00 PM)',
        status: 'offers_received',
        bid_expires_at: new Date(now + 2.5 * 3600 * 1000).toISOString(),
        notes: 'Old newspapers tied in bundles and flattened cardboard boxes. Gate code 4020.',
      },
      {
        id: DEMO_IDS.listing2,
        seller_id: DEMO_IDS.seller,
        address: 'Bungalow 7, Behind Archies Gallery, College Road, Nashik',
        location: 'POINT(73.7880 19.9990)',
        pickup_window: 'Evening (4:00 PM - 7:00 PM)',
        status: 'open',
        bid_expires_at: new Date(now + 4 * 3600 * 1000).toISOString(),
        notes: 'Heavy copper wiring and brass utensils from home renovation.',
      },
    ];

    for (const l of listings) {
      await supabase.from('listings').upsert(l, { onConflict: 'id' });
    }

    // 4. Seed Listing Items
    console.log('4. Seeding Category Weight Breakdowns...');
    const items = [
      { listing_id: DEMO_IDS.listing1, category: 'newspaper', est_weight_kg: 22.0, photo_urls: [] },
      { listing_id: DEMO_IDS.listing1, category: 'cardboard', est_weight_kg: 13.0, photo_urls: [] },
      { listing_id: DEMO_IDS.listing2, category: 'copper', est_weight_kg: 6.0, photo_urls: [] },
      { listing_id: DEMO_IDS.listing2, category: 'brass', est_weight_kg: 12.0, photo_urls: [] },
    ];

    for (const it of items) {
      await supabase.from('listing_items').insert(it);
    }

    // 5. Seed Competing Dealer Offers
    console.log('5. Seeding Competing Dealer Bids...');
    const offers = [
      {
        id: DEMO_IDS.offer1,
        listing_id: DEMO_IDS.listing1,
        dealer_id: DEMO_IDS.dealer1,
        amount: 510.00,
        note: 'Certified ISO digital scale. Instant GooglePay at doorstep.',
        status: 'pending',
      },
      {
        id: DEMO_IDS.offer2,
        listing_id: DEMO_IDS.listing1,
        dealer_id: DEMO_IDS.dealer2,
        amount: 485.00,
        note: 'Can reach within 30 minutes with our clean electric three-wheeler.',
        status: 'pending',
      },
      {
        id: DEMO_IDS.offer3,
        listing_id: DEMO_IDS.listing2,
        dealer_id: DEMO_IDS.dealer3,
        amount: 8150.00,
        note: 'Top mandi benchmark rate for genuine heavy copper & brass utensils.',
        status: 'pending',
      },
    ];

    for (const o of offers) {
      await supabase.from('offers').upsert(o, { onConflict: 'id' });
    }

    console.log('\n✅ Demo Nashik marketplace data successfully seeded!');
    console.log('------------------------------------------------------');
    console.log('Admin Demo Login:    admin@raddibhaav.in / +91 99999 00000');
    console.log('Seller Demo Login:   sanjay@raddibhaav.in / +91 98765 43210');
    console.log('Dealer 1 (Ganesh):   ganesh@raddibhaav.in / +91 98230 11111');
    console.log('Dealer 2 (Godavari): rajesh@raddibhaav.in / +91 98230 22222');
    console.log('Dealer 3 (Nashik):   vijay@raddibhaav.in / +91 98230 33333');
    console.log('------------------------------------------------------\n');
  } catch (err) {
    console.error('❌ Error during demo data seeding:', err);
  }
}

export function generateSqlSeed(): string {
  return `
-- ==============================================================================
-- RaddiBhaav: Deterministic Demo Seed Data for Nashik Marketplace
-- Safe execution behind environment flag
-- ==============================================================================

-- 1. Demo User Profiles (Admin, Seller, Dealers)
INSERT INTO public.profiles (id, role, name, phone, language, city)
VALUES 
    ('${DEMO_IDS.admin}', 'admin', 'Nashik Market Admin Officer', '+919999900000', 'en', 'Nashik'),
    ('${DEMO_IDS.seller}', 'seller', 'Sanjay Patil (Household)', '+919876543210', 'mr', 'Nashik'),
    ('${DEMO_IDS.dealer1}', 'dealer', 'Ganesh Shinde', '+919823011111', 'mr', 'Nashik'),
    ('${DEMO_IDS.dealer2}', 'dealer', 'Rajesh Gupta', '+919823022222', 'hi', 'Nashik'),
    ('${DEMO_IDS.dealer3}', 'dealer', 'Vijay Deshmukh', '+919823033333', 'en', 'Nashik')
ON CONFLICT (id) DO UPDATE
SET role = EXCLUDED.role, name = EXCLUDED.name, phone = EXCLUDED.phone;

-- 2. Verified Scrap Dealers (Nashik Hyperlocal)
INSERT INTO public.dealers (profile_id, shop_name, service_radius_km, location, kyc_status, kyc_docs, rating_avg, total_pickups, is_active)
VALUES 
    ('${DEMO_IDS.dealer1}', 'Shree Ganesh Scrap Traders', 8.0, ST_SetSRID(ST_MakePoint(73.7898, 19.9975), 4326), 'approved', '{"scale_type":"ISO Digital Crane Scale 300kg"}'::jsonb, 4.90, 412, true),
    ('${DEMO_IDS.dealer2}', 'Godavari Eco Recyclers', 6.5, ST_SetSRID(ST_MakePoint(73.7900, 20.0110), 4326), 'approved', '{"scale_type":"Calibrated Platform Scale"}'::jsonb, 4.85, 289, true),
    ('${DEMO_IDS.dealer3}', 'Nashik Metal & Raddi Mart', 10.0, ST_SetSRID(ST_MakePoint(73.7650, 19.9650), 4326), 'approved', '{"scale_type":"Precision Digital Scale"}'::jsonb, 4.75, 175, true)
ON CONFLICT (profile_id) DO UPDATE
SET shop_name = EXCLUDED.shop_name, kyc_status = EXCLUDED.kyc_status, rating_avg = EXCLUDED.rating_avg;

-- 3. Sample Listings in Nashik
INSERT INTO public.listings (id, seller_id, address, location, pickup_window, status, bid_expires_at, notes)
VALUES 
    ('${DEMO_IDS.listing1}', '${DEMO_IDS.seller}', 'Flat 402, Shriram Heights, Gangapur Road, Nashik', ST_SetSRID(ST_MakePoint(73.7750, 20.0050), 4326), 'Morning (10:00 AM - 1:00 PM)', 'offers_received', timezone('utc', now()) + interval '2 hours 30 minutes', 'Old newspapers and flattened cardboard boxes. Gate code 4020.'),
    ('${DEMO_IDS.listing2}', '${DEMO_IDS.seller}', 'Bungalow 7, Behind Archies Gallery, College Road, Nashik', ST_SetSRID(ST_MakePoint(73.7880, 19.9990), 4326), 'Evening (4:00 PM - 7:00 PM)', 'open', timezone('utc', now()) + interval '4 hours', 'Heavy copper wiring and brass utensils from home renovation.')
ON CONFLICT (id) DO UPDATE
SET status = EXCLUDED.status, bid_expires_at = EXCLUDED.bid_expires_at;

-- 4. Sample Listing Items
INSERT INTO public.listing_items (listing_id, category, est_weight_kg)
VALUES 
    ('${DEMO_IDS.listing1}', 'newspaper', 22.0),
    ('${DEMO_IDS.listing1}', 'cardboard', 13.0),
    ('${DEMO_IDS.listing2}', 'copper', 6.0),
    ('${DEMO_IDS.listing2}', 'brass', 12.0);

-- 5. Competing Dealer Bids
INSERT INTO public.offers (id, listing_id, dealer_id, amount, note, status)
VALUES 
    ('${DEMO_IDS.offer1}', '${DEMO_IDS.listing1}', '${DEMO_IDS.dealer1}', 510.00, 'Certified ISO digital scale. Instant GooglePay at doorstep.', 'pending'),
    ('${DEMO_IDS.offer2}', '${DEMO_IDS.listing1}', '${DEMO_IDS.dealer2}', 485.00, 'Can reach within 30 minutes with our clean electric three-wheeler.', 'pending'),
    ('${DEMO_IDS.offer3}', '${DEMO_IDS.listing2}', '${DEMO_IDS.dealer3}', 8150.00, 'Top mandi benchmark rate for genuine heavy copper & brass utensils.', 'pending')
ON CONFLICT (id) DO UPDATE
SET amount = EXCLUDED.amount, status = EXCLUDED.status;
  `.trim();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
