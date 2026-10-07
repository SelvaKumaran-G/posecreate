-- PoseAI Storage Buckets Setup
-- Run this in Supabase SQL Editor or via Supabase CLI

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('location-images', 'location-images', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('person-images', 'person-images', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('vehicle-images', 'vehicle-images', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('analysis-results', 'analysis-results', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/json'])
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies

-- Location Images
CREATE POLICY "Users can upload location images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'location-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view own location images"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'location-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own location images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'location-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Person Images
CREATE POLICY "Users can upload person images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'person-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view own person images"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'person-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own person images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'person-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Vehicle Images
CREATE POLICY "Users can upload vehicle images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'vehicle-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view own vehicle images"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'vehicle-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own vehicle images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'vehicle-images' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Analysis Results
CREATE POLICY "Users can view own analysis results"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'analysis-results' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );
