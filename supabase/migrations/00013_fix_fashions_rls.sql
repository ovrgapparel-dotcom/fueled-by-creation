-- Migration: Fix Fashions RLS and Storage
-- This script ensures the Admin Panel can manage fashions.

-- 1. DATABASE TABLES (RLS SETTINGS)
DROP POLICY IF EXISTS "Allow public read access to published fashions" ON public.fashions;
DROP POLICY IF EXISTS "Allow anon insert fashions" ON public.fashions;
DROP POLICY IF EXISTS "Allow anon update fashions" ON public.fashions;
DROP POLICY IF EXISTS "Allow anon delete fashions" ON public.fashions;

CREATE POLICY "Allow anon all access fashions" ON public.fashions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow auth all access fashions" ON public.fashions FOR ALL USING (true) WITH CHECK (true);

-- 2. STORAGE BUCKETS (RLS SETTINGS)
-- Drop existing policies for 'fashions' bucket to re-apply correctly
DROP POLICY IF EXISTS "Public Access fashions" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload fashions" ON storage.objects;
DROP POLICY IF EXISTS "Public Update fashions" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete fashions" ON storage.objects;

-- Create Storage Policies
CREATE POLICY "Public Access fashions" ON storage.objects FOR SELECT USING (bucket_id = 'fashions');
CREATE POLICY "Public Upload fashions" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'fashions');
CREATE POLICY "Public Update fashions" ON storage.objects FOR UPDATE USING (bucket_id = 'fashions');
CREATE POLICY "Public Delete fashions" ON storage.objects FOR DELETE USING (bucket_id = 'fashions');
