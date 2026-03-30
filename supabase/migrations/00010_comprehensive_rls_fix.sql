-- Migration: Comprehensive RLS Fix for Admin Panel
-- This script ensures the Admin Panel has full access to all tables and storage buckets.
-- RUN THIS IN YOUR SUPABASE SQL EDITOR

-- ==========================================
-- 1. DATABASE TABLES (RLS SETTINGS)
-- ==========================================
DO $$ 
DECLARE
  base_tables TEXT[] := ARRAY['artists', 'articles', 'events', 'influencers', 'threads', 'playlists', 'playlist_tracks', 'notifications', 'app_config'];
  t TEXT;
BEGIN
  FOREACH t IN ARRAY base_tables LOOP
    -- Drop existing overlapping policies to prevent conflicts
    EXECUTE format('DROP POLICY IF EXISTS "Allow anon all access %s" ON public.%I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "Allow auth all access %s" ON public.%I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "Allow anon insert %s" ON public.%I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "Allow anon update %s" ON public.%I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "Allow anon delete %s" ON public.%I', t, t);
    
    -- Create Unified Public/Auth All Access Policies
    -- This allows any user (or the anon key in your browser) to manage content.
    EXECUTE format('CREATE POLICY "Allow anon all access %s" ON public.%I FOR ALL USING (true) WITH CHECK (true)', t, t);
    EXECUTE format('CREATE POLICY "Allow auth all access %s" ON public.%I FOR ALL USING (true) WITH CHECK (true)', t, t);
  END LOOP;
END $$;

-- ==========================================
-- 2. STORAGE BUCKETS (RLS SETTINGS)
-- ==========================================
DO $$ 
DECLARE
  bucket_list TEXT[] := ARRAY['artists', 'articles', 'events', 'playlists', 'threads', 'influencers', 'assets', 'product-images', 'radio-media'];
  b TEXT;
BEGIN
  FOREACH b IN ARRAY bucket_list LOOP
    -- Drop existing storage policies for these buckets
    EXECUTE format('DROP POLICY IF EXISTS "Public Access %s" ON storage.objects', b);
    EXECUTE format('DROP POLICY IF EXISTS "Public Upload %s" ON storage.objects', b);
    EXECUTE format('DROP POLICY IF EXISTS "Public Update %s" ON storage.objects', b);
    
    -- Create Storage Policies (Agnostic of Role)
    EXECUTE format('CREATE POLICY "Public Access %s" ON storage.objects FOR SELECT USING (bucket_id = %L)', b, b);
    EXECUTE format('CREATE POLICY "Public Upload %s" ON storage.objects FOR INSERT WITH CHECK (bucket_id = %L)', b, b);
    EXECUTE format('CREATE POLICY "Public Update %s" ON storage.objects FOR UPDATE USING (bucket_id = %L)', b, b);
    EXECUTE format('CREATE POLICY "Public Delete %s" ON storage.objects FOR DELETE USING (bucket_id = %L)', b, b);
  END LOOP;
END $$;
