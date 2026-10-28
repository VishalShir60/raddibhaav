-- ==============================================================================
-- RaddiBhaav: Hyperlocal Scrap Marketplace Database Schema
-- Production-Ready Supabase SQL Migration with PostGIS, Strict RLS, and Triggers
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Clean Idempotency (Safe for fresh production and existing databases)
-- Schema initialization without destructive statements

-- ==============================================================================
-- 3. Core Tables
-- ==============================================================================

-- Table: profiles
-- Extends Supabase auth.users with user role, language, and city
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('seller', 'dealer', 'admin')) DEFAULT 'seller',
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    language TEXT NOT NULL CHECK (language IN ('en', 'hi', 'mr')) DEFAULT 'en',
    city TEXT NOT NULL DEFAULT 'Nashik',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Table: dealers
-- Verified scrap dealers (kabadiwalas) with service radius and location
CREATE TABLE public.dealers (
    profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    shop_name TEXT NOT NULL,
    service_radius_km NUMERIC(4, 1) NOT NULL DEFAULT 5.0 CHECK (service_radius_km > 0),
    location GEOGRAPHY(Point, 4326) NOT NULL,
    kyc_status TEXT NOT NULL CHECK (kyc_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    kyc_docs JSONB NOT NULL DEFAULT '{}'::jsonb,
    rating_avg NUMERIC(3, 2) NOT NULL DEFAULT 0.00 CHECK (rating_avg >= 0.00 AND rating_avg <= 5.00),
    total_pickups INTEGER NOT NULL DEFAULT 0 CHECK (total_pickups >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Table: listings
-- Scrap pickup requests created by household sellers
CREATE TABLE public.listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    address TEXT NOT NULL,
    location GEOGRAPHY(Point, 4326) NOT NULL,
    pickup_window TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('open', 'offers_received', 'accepted', 'completed', 'cancelled', 'expired')) DEFAULT 'open',
    bid_expires_at TIMESTAMPTZ NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Table: listing_items
-- Category breakdown and estimated weights per listing
CREATE TABLE public.listing_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    est_weight_kg NUMERIC(8, 2) NOT NULL CHECK (est_weight_kg > 0),
    photo_urls TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Table: offers
-- Sealed, competing offers submitted by verified nearby dealers
CREATE TABLE public.offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    dealer_id UUID NOT NULL REFERENCES public.dealers(profile_id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    note TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')) DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT unique_dealer_offer_per_listing UNIQUE (listing_id, dealer_id)
);

-- Table: pickups
-- Doorstep execution, digital scale weighing, and direct Cash/UPI settlement
CREATE TABLE public.pickups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    offer_id UUID NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
    final_weight_kg NUMERIC(8, 2) CHECK (final_weight_kg IS NULL OR final_weight_kg > 0),
    final_amount NUMERIC(10, 2) CHECK (final_amount IS NULL OR final_amount >= 0),
    payment_method TEXT CHECK (payment_method IN ('cash', 'upi', 'other')),
    status TEXT NOT NULL CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')) DEFAULT 'scheduled',
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Table: rate_cards
-- City-level benchmark scrap price ranges (Mandi Rates)
CREATE TABLE public.rate_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    min_rate NUMERIC(8, 2) NOT NULL CHECK (min_rate >= 0),
    max_rate NUMERIC(8, 2) NOT NULL CHECK (max_rate >= min_rate),
    city TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT unique_category_city UNIQUE (city, category)
);

-- Table: ratings
-- Mutual feedback and star ratings following doorstep pickups
CREATE TABLE public.ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pickup_id UUID NOT NULL REFERENCES public.pickups(id) ON DELETE CASCADE,
    from_user UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    to_user UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    stars INTEGER NOT NULL CHECK (stars >= 1 AND stars <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT unique_rating_per_pickup_user UNIQUE (pickup_id, from_user)
);

-- Table: disputes
-- Order discrepancies (weight disputes, price disputes, no-shows)
CREATE TABLE public.disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pickup_id UUID NOT NULL REFERENCES public.pickups(id) ON DELETE CASCADE,
    raised_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('open', 'investigating', 'resolved', 'dismissed')) DEFAULT 'open',
    resolution TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Table: commission_ledger
-- Transparent platform fee tracking (recorded, waived in MVP, or paid)
CREATE TABLE public.commission_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dealer_id UUID NOT NULL REFERENCES public.dealers(profile_id) ON DELETE CASCADE,
    pickup_id UUID NOT NULL REFERENCES public.pickups(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    status TEXT NOT NULL CHECK (status IN ('recorded', 'waived', 'paid')) DEFAULT 'waived',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Table: notifications
-- In-app and push notifications for status updates and incoming bids
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT false,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ==============================================================================
-- 4. Indexes (Location, Status & Foreign Keys)
-- ==============================================================================

-- Spatial PostGIS GIST Indexes for rapid proximity calculations
CREATE INDEX idx_dealers_location ON public.dealers USING GIST (location);
CREATE INDEX idx_listings_location ON public.listings USING GIST (location);

-- Status & Lifecycle Indexes
CREATE INDEX idx_dealers_kyc_active ON public.dealers (kyc_status, is_active);
CREATE INDEX idx_listings_status_expires ON public.listings (status, bid_expires_at);
CREATE INDEX idx_listings_seller_id ON public.listings (seller_id);
CREATE INDEX idx_listing_items_listing_id ON public.listing_items (listing_id);
CREATE INDEX idx_offers_listing_status ON public.offers (listing_id, status);
CREATE INDEX idx_offers_dealer_id ON public.offers (dealer_id);
CREATE INDEX idx_pickups_listing_id ON public.pickups (listing_id);
CREATE INDEX idx_pickups_offer_id ON public.pickups (offer_id);
CREATE INDEX idx_pickups_status ON public.pickups (status);
CREATE INDEX idx_rate_cards_city_category ON public.rate_cards (city, category);
CREATE INDEX idx_ratings_to_user ON public.ratings (to_user);
CREATE INDEX idx_disputes_pickup_id ON public.disputes (pickup_id);
CREATE INDEX idx_commission_ledger_dealer_status ON public.commission_ledger (dealer_id, status);
CREATE INDEX idx_notifications_user_read ON public.notifications (user_id, read);

-- ==============================================================================
-- 5. Helper Functions & Proximity Calculations
-- ==============================================================================

-- Function: is_admin
-- Checks whether the current authenticated user has an 'admin' role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
$$;

-- Function: has_accepted_deal
-- Checks whether two users are part of an accepted offer (used for contact visibility)
CREATE OR REPLACE FUNCTION public.has_accepted_deal(user_a UUID, user_b UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.offers o
        JOIN public.listings l ON l.id = o.listing_id
        WHERE o.status = 'accepted'
          AND (
            (l.seller_id = user_a AND o.dealer_id = user_b)
            OR
            (l.seller_id = user_b AND o.dealer_id = user_a)
          )
    );
$$;

-- Function: auto-expire listings that have passed their bid_expires_at timestamp
CREATE OR REPLACE FUNCTION public.check_and_expire_listings()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    UPDATE public.listings
    SET status = 'expired',
        updated_at = timezone('utc', now())
    WHERE status IN ('open', 'offers_received')
      AND bid_expires_at <= timezone('utc', now());
      
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    RETURN expired_count;
END;
$$;

-- Function: find_nearby_dealers
-- Finds active, KYC-approved dealers whose service radius covers the target listing
CREATE OR REPLACE FUNCTION public.find_nearby_dealers(target_listing_id UUID)
RETURNS TABLE (
    dealer_id UUID,
    shop_name TEXT,
    phone TEXT,
    rating_avg NUMERIC(3, 2),
    total_pickups INTEGER,
    service_radius_km NUMERIC(4, 1),
    distance_km NUMERIC(6, 2),
    location GEOGRAPHY
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    listing_loc GEOGRAPHY;
BEGIN
    -- Lazily mark expired listings
    PERFORM public.check_and_expire_listings();

    -- Retrieve listing coordinates
    SELECT l.location INTO listing_loc
    FROM public.listings l
    WHERE l.id = target_listing_id;

    IF listing_loc IS NULL THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT 
        d.profile_id AS dealer_id,
        d.shop_name,
        CASE 
            WHEN public.is_admin() OR public.has_accepted_deal(auth.uid(), d.profile_id) THEN p.phone
            ELSE 'Contact available after bid acceptance'
        END AS phone,
        d.rating_avg,
        d.total_pickups,
        d.service_radius_km,
        ROUND((ST_Distance(d.location, listing_loc) / 1000.0)::numeric, 2) AS distance_km,
        d.location
    FROM public.dealers d
    JOIN public.profiles p ON p.id = d.profile_id
    WHERE d.is_active = true
      AND d.kyc_status = 'approved'
      -- Distance must be within the dealer's designated service radius
      AND ST_DWithin(d.location, listing_loc, d.service_radius_km * 1000)
    ORDER BY distance_km ASC;
END;
$$;

-- View: listings_feed
-- Hides precise street addresses from dealers until their offer is accepted
CREATE OR REPLACE VIEW public.listings_feed AS
SELECT 
    l.id,
    l.seller_id,
    CASE 
        WHEN l.seller_id = auth.uid() OR public.is_admin() THEN l.address
        WHEN EXISTS (
            SELECT 1 FROM public.offers o 
            WHERE o.listing_id = l.id 
              AND o.dealer_id = auth.uid() 
              AND o.status = 'accepted'
        ) THEN l.address
        ELSE 'Address visible after bid acceptance'
    END AS address,
    l.location,
    l.pickup_window,
    l.status,
    l.bid_expires_at,
    l.notes,
    l.created_at,
    l.updated_at
FROM public.listings l;

-- ==============================================================================
-- 6. Triggers
-- ==============================================================================

-- Trigger A: Auto-expire listing on DML if bid_expires_at is in the past
CREATE OR REPLACE FUNCTION public.trg_auto_expire_listing()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.status IN ('open', 'offers_received') AND NEW.bid_expires_at <= timezone('utc', now()) THEN
        NEW.status := 'expired';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_listings_expiry_check
BEFORE INSERT OR UPDATE ON public.listings
FOR EACH ROW
EXECUTE FUNCTION public.trg_auto_expire_listing();

-- Trigger B: Update dealer rating_avg on rating creation or change
CREATE OR REPLACE FUNCTION public.trg_update_dealer_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    target_dealer_id UUID;
    new_avg NUMERIC(3, 2);
BEGIN
    IF TG_OP = 'DELETE' THEN
        target_dealer_id := OLD.to_user;
    ELSE
        target_dealer_id := NEW.to_user;
    END IF;

    -- Verify target user is a registered dealer
    IF EXISTS (SELECT 1 FROM public.dealers WHERE profile_id = target_dealer_id) THEN
        SELECT COALESCE(ROUND(AVG(stars)::numeric, 2), 0.00)
        INTO new_avg
        FROM public.ratings
        WHERE to_user = target_dealer_id;

        UPDATE public.dealers
        SET rating_avg = new_avg,
            updated_at = timezone('utc', now())
        WHERE profile_id = target_dealer_id;
    END IF;

    RETURN NULL;
END;
$$;

CREATE TRIGGER trg_ratings_dealer_avg
AFTER INSERT OR UPDATE OR DELETE ON public.ratings
FOR EACH ROW
EXECUTE FUNCTION public.trg_update_dealer_rating();

-- Trigger C: Create commission ledger entry (default 5%) on pickup completion
CREATE OR REPLACE FUNCTION public.trg_create_commission_on_pickup_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    commission_rate_pct NUMERIC(5, 2) := 5.00; -- Default 5% platform fee (configurable)
    calculated_commission NUMERIC(10, 2);
    dealer_user_id UUID;
BEGIN
    -- Run only when status transitions to 'completed'
    IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
        -- Find accepted dealer from the offer
        SELECT o.dealer_id INTO dealer_user_id
        FROM public.offers o
        WHERE o.id = NEW.offer_id;

        IF dealer_user_id IS NOT NULL AND NEW.final_amount IS NOT NULL THEN
            calculated_commission := ROUND((NEW.final_amount * (commission_rate_pct / 100.0)), 2);

            -- Record commission ledger entry (marked as waived in promotional MVP)
            INSERT INTO public.commission_ledger (
                dealer_id,
                pickup_id,
                amount,
                status
            ) VALUES (
                dealer_user_id,
                NEW.id,
                calculated_commission,
                'waived'
            );

            -- Increment dealer pickup count
            UPDATE public.dealers
            SET total_pickups = total_pickups + 1,
                updated_at = timezone('utc', now())
            WHERE profile_id = dealer_user_id;

            -- Update parent listing status to completed
            UPDATE public.listings
            SET status = 'completed',
                updated_at = timezone('utc', now())
            WHERE id = NEW.listing_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_pickups_commission_ledger
AFTER UPDATE OF status ON public.pickups
FOR EACH ROW
EXECUTE FUNCTION public.trg_create_commission_on_pickup_completion();

-- Trigger D: Update listing status to 'offers_received' when a dealer places a bid
CREATE OR REPLACE FUNCTION public.trg_offer_received_on_listing()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.listings
    SET status = 'offers_received',
        updated_at = timezone('utc', now())
    WHERE id = NEW.listing_id
      AND status = 'open';
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_offers_update_listing_status
AFTER INSERT ON public.offers
FOR EACH ROW
EXECUTE FUNCTION public.trg_offer_received_on_listing();

-- ==============================================================================
-- 7. Strict Row Level Security (RLS)
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- RLS: profiles
-- Users see their own profile or users with an accepted deal; admins see all
-- ------------------------------------------------------------------------------
CREATE POLICY "Profiles are viewable by owner, accepted counterparty, or admin"
ON public.profiles FOR SELECT
USING (
    auth.uid() = id 
    OR public.is_admin() 
    OR public.has_accepted_deal(auth.uid(), id)
);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile; admins can update all"
ON public.profiles FOR UPDATE
USING (auth.uid() = id OR public.is_admin())
WITH CHECK (auth.uid() = id OR public.is_admin());

-- ------------------------------------------------------------------------------
-- RLS: dealers
-- Approved dealer shop profiles are discoverable; private docs restricted to owner & admin
-- ------------------------------------------------------------------------------
CREATE POLICY "Active approved dealers are viewable by authenticated users"
ON public.dealers FOR SELECT
USING (
    (kyc_status = 'approved' AND is_active = true)
    OR auth.uid() = profile_id
    OR public.is_admin()
);

CREATE POLICY "Dealers can insert their own profile"
ON public.dealers FOR INSERT
WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Dealers can update their own profile; admins can update all"
ON public.dealers FOR UPDATE
USING (auth.uid() = profile_id OR public.is_admin())
WITH CHECK (auth.uid() = profile_id OR public.is_admin());

-- ------------------------------------------------------------------------------
-- RLS: listings
-- Sellers see only their listings; dealers see only listings within their radius; admin sees all
-- ------------------------------------------------------------------------------
CREATE POLICY "Listings visibility by role and radius"
ON public.listings FOR SELECT
USING (
    -- Admin sees all
    public.is_admin()
    -- Seller sees their own
    OR auth.uid() = seller_id
    -- Dealers see active listings within their service radius
    OR (
        status IN ('open', 'offers_received')
        AND bid_expires_at > timezone('utc', now())
        AND EXISTS (
            SELECT 1 FROM public.dealers d
            WHERE d.profile_id = auth.uid()
              AND d.kyc_status = 'approved'
              AND d.is_active = true
              AND ST_DWithin(d.location, listings.location, d.service_radius_km * 1000)
        )
    )
    -- Dealer sees listing if their offer was accepted
    OR EXISTS (
        SELECT 1 FROM public.offers o
        WHERE o.listing_id = listings.id
          AND o.dealer_id = auth.uid()
          AND o.status = 'accepted'
    )
);

CREATE POLICY "Sellers can create listings"
ON public.listings FOR INSERT
WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own listings; admin can update all"
ON public.listings FOR UPDATE
USING (auth.uid() = seller_id OR public.is_admin())
WITH CHECK (auth.uid() = seller_id OR public.is_admin());

-- ------------------------------------------------------------------------------
-- RLS: listing_items
-- Viewable if parent listing is visible to user
-- ------------------------------------------------------------------------------
CREATE POLICY "Listing items visible if listing is visible"
ON public.listing_items FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.listings l
        WHERE l.id = listing_items.listing_id
    )
);

CREATE POLICY "Sellers can insert listing items"
ON public.listing_items FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.listings l
        WHERE l.id = listing_items.listing_id
          AND l.seller_id = auth.uid()
    )
);

-- ------------------------------------------------------------------------------
-- RLS: offers
-- Sellers see only offers on their listings; dealers see only their own offers; admin sees all
-- ------------------------------------------------------------------------------
CREATE POLICY "Offers visibility: Sellers see offers on their listing, dealers see own"
ON public.offers FOR SELECT
USING (
    public.is_admin()
    OR auth.uid() = dealer_id
    OR EXISTS (
        SELECT 1 FROM public.listings l
        WHERE l.id = offers.listing_id
          AND l.seller_id = auth.uid()
    )
);

CREATE POLICY "Dealers can insert offers on open listings within their radius"
ON public.offers FOR INSERT
WITH CHECK (
    auth.uid() = dealer_id
    AND EXISTS (
        SELECT 1 FROM public.dealers d
        JOIN public.listings l ON l.id = offers.listing_id
        WHERE d.profile_id = auth.uid()
          AND d.kyc_status = 'approved'
          AND d.is_active = true
          AND l.status IN ('open', 'offers_received')
          AND l.bid_expires_at > timezone('utc', now())
          AND ST_DWithin(d.location, l.location, d.service_radius_km * 1000)
    )
);

CREATE POLICY "Sellers can accept/reject offers; dealers can withdraw their own"
ON public.offers FOR UPDATE
USING (
    public.is_admin()
    OR auth.uid() = dealer_id
    OR EXISTS (
        SELECT 1 FROM public.listings l
        WHERE l.id = offers.listing_id
          AND l.seller_id = auth.uid()
    )
);

-- ------------------------------------------------------------------------------
-- RLS: pickups
-- Visible to seller, accepted dealer, or admin
-- ------------------------------------------------------------------------------
CREATE POLICY "Pickups visible to involved seller, dealer, or admin"
ON public.pickups FOR SELECT
USING (
    public.is_admin()
    OR EXISTS (
        SELECT 1 FROM public.listings l
        WHERE l.id = pickups.listing_id
          AND l.seller_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM public.offers o
        WHERE o.id = pickups.offer_id
          AND o.dealer_id = auth.uid()
    )
);

CREATE POLICY "Sellers or system can create pickup"
ON public.pickups FOR INSERT
WITH CHECK (
    public.is_admin()
    OR EXISTS (
        SELECT 1 FROM public.listings l
        WHERE l.id = pickups.listing_id
          AND l.seller_id = auth.uid()
    )
);

CREATE POLICY "Parties involved can update pickup details"
ON public.pickups FOR UPDATE
USING (
    public.is_admin()
    OR EXISTS (
        SELECT 1 FROM public.listings l
        WHERE l.id = pickups.listing_id
          AND l.seller_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM public.offers o
        WHERE o.id = pickups.offer_id
          AND o.dealer_id = auth.uid()
    )
);

-- ------------------------------------------------------------------------------
-- RLS: rate_cards
-- Public read-only; admin write
-- ------------------------------------------------------------------------------
CREATE POLICY "Rate cards are readable by everyone"
ON public.rate_cards FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Only admins can modify rate cards"
ON public.rate_cards FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- RLS: ratings
-- Viewable by everyone; insertable only by pickup participants
-- ------------------------------------------------------------------------------
CREATE POLICY "Ratings are viewable by all authenticated users"
ON public.ratings FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Pickup participants can insert ratings"
ON public.ratings FOR INSERT
WITH CHECK (auth.uid() = from_user);

-- ------------------------------------------------------------------------------
-- RLS: disputes
-- Visible to disputant, counterparty, or admin
-- ------------------------------------------------------------------------------
CREATE POLICY "Disputes visible to involved parties or admin"
ON public.disputes FOR SELECT
USING (
    public.is_admin()
    OR auth.uid() = raised_by
    OR EXISTS (
        SELECT 1 FROM public.pickups p
        JOIN public.listings l ON l.id = p.listing_id
        JOIN public.offers o ON o.id = p.offer_id
        WHERE p.id = disputes.pickup_id
          AND (l.seller_id = auth.uid() OR o.dealer_id = auth.uid())
    )
);

CREATE POLICY "Pickup participants can create disputes"
ON public.disputes FOR INSERT
WITH CHECK (auth.uid() = raised_by);

CREATE POLICY "Admins can update dispute status and resolutions"
ON public.disputes FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- RLS: commission_ledger
-- Dealers see only their own ledger entries; admins see all
-- ------------------------------------------------------------------------------
CREATE POLICY "Dealers view own ledger; admin views all"
ON public.commission_ledger FOR SELECT
USING (auth.uid() = dealer_id OR public.is_admin());

-- ------------------------------------------------------------------------------
-- RLS: notifications
-- Users view and update their own notifications
-- ------------------------------------------------------------------------------
CREATE POLICY "Users view own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- 8. Seed Data: Nashik Scrap Mandi Indicative Benchmark Rates
-- NOTE: The rates below are INDICATIVE PLACEHOLDERS for Nashik Mandi (Maharashtra).
-- Real local scrap prices fluctuate daily based on wholesale recycling indices and
-- must be verified/updated by admins in production.
-- ==============================================================================

INSERT INTO public.rate_cards (category, min_rate, max_rate, city, updated_at)
VALUES 
    -- 1. Newspaper (Raddi / Current papers)
    ('newspaper', 14.00, 16.50, 'Nashik', timezone('utc', now())),
    -- 2. Cardboard (Gatta / Packing boxes)
    ('cardboard', 9.50, 12.00, 'Nashik', timezone('utc', now())),
    -- 3. Iron & Steel (Loha / Mild steel scrap)
    ('iron', 28.00, 32.00, 'Nashik', timezone('utc', now())),
    -- 4. Plastic (PET bottles, oil cans, mixed plastic)
    ('plastic', 12.00, 17.00, 'Nashik', timezone('utc', now())),
    -- 5. Brass (Peetal / Kitchen utensils / Pooja items)
    ('brass', 315.00, 350.00, 'Nashik', timezone('utc', now())),
    -- 6. Copper (Taamba / Electrical wires / Heavy copper)
    ('copper', 650.00, 720.00, 'Nashik', timezone('utc', now())),
    -- 7. Electronic Waste (PCBs / Mixed circuitry)
    ('ewaste', 35.00, 120.00, 'Nashik', timezone('utc', now())),
    -- 8. Household Appliances (AC / Refrigerator / Washing Machines)
    ('appliances', 800.00, 4500.00, 'Nashik', timezone('utc', now())),
    -- 9. Aluminium (Cans, frames, utensils)
    ('aluminium', 105.00, 130.00, 'Nashik', timezone('utc', now())),
    -- 10. Stainless Steel (Bartan / SS 304 scrap)
    ('steel', 38.00, 46.00, 'Nashik', timezone('utc', now()))
ON CONFLICT (city, category) DO UPDATE
SET min_rate = EXCLUDED.min_rate,
    max_rate = EXCLUDED.max_rate,
    updated_at = EXCLUDED.updated_at;
