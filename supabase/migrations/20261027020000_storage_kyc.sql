-- ==============================================================================
-- RaddiBhaav: Supabase Storage Bucket for Dealer KYC Documents
-- Configures private bucket 'kyc-documents' and strict Row Level Security (RLS)
-- ==============================================================================

-- 1. Create the private Storage bucket if it does not already exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'kyc-documents',
    'kyc-documents',
    false, -- Private bucket: documents require authenticated signed URLs
    10485760, -- 10MB per file maximum limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE
SET public = false,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

-- 2. Enable Storage RLS Policies for 'kyc-documents'
-- Dealers upload their documents into a folder named after their profile_id (auth.uid())

-- Policy: Dealers can upload their own KYC documents
CREATE POLICY "Dealers can upload their own KYC documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'kyc-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Dealers can view only their own KYC documents; Admins can view all
CREATE POLICY "Dealers view own KYC documents; Admins view all"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'kyc-documents'
    AND (
        (storage.foldername(name))[1] = auth.uid()::text
        OR public.is_admin()
    )
);

-- Policy: Dealers can update or delete their pending KYC documents
CREATE POLICY "Dealers can update or delete their own KYC documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'kyc-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'kyc-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Dealers can delete their own KYC documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'kyc-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
);
