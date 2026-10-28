-- ==============================================================================
-- RaddiBhaav: Supabase Storage Bucket for Listing Scrap Photos
-- Configures public read bucket 'listing-photos' with authenticated insert RLS
-- ==============================================================================

-- 1. Create or update the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'listing-photos',
    'listing-photos',
    true, -- Photos are public to view by browsing dealers & buyers
    5242880, -- 5MB limit per photo (client compresses to <300KB before upload)
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- 2. Storage RLS Policies for listing-photos

-- Policy: Anyone can view listing photos
CREATE POLICY "Public listing photos are viewable by all"
ON storage.objects FOR SELECT
USING (bucket_id = 'listing-photos');

-- Policy: Authenticated users can upload listing photos into their user folder
CREATE POLICY "Authenticated users can upload listing photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'listing-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update or delete their own listing photos
CREATE POLICY "Users can update or delete their own listing photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'listing-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
);
