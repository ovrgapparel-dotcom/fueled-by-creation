-- Migration: Create missing storage buckets and policies
-- These buckets are referenced in the admin panel and must exist in your Supabase backend.
-- RUN THIS IN YOUR SUPABASE SQL EDITOR

-- 1. Create Missing Buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('artists', 'artists', true),
  ('articles', 'articles', true),
  ('events', 'events', true),
  ('playlists', 'playlists', true),
  ('threads', 'threads', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Add Select Policies (Public Read)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access artists') THEN
      CREATE POLICY "Public Access artists" ON storage.objects FOR SELECT USING (bucket_id = 'artists');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access articles') THEN
      CREATE POLICY "Public Access articles" ON storage.objects FOR SELECT USING (bucket_id = 'articles');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access events') THEN
      CREATE POLICY "Public Access events" ON storage.objects FOR SELECT USING (bucket_id = 'events');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access playlists') THEN
      CREATE POLICY "Public Access playlists" ON storage.objects FOR SELECT USING (bucket_id = 'playlists');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access threads') THEN
      CREATE POLICY "Public Access threads" ON storage.objects FOR SELECT USING (bucket_id = 'threads');
  END IF;
END $$;

-- 3. Add Insert Policies (Public Upload)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Upload artists') THEN
      CREATE POLICY "Public Upload artists" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'artists');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Upload articles') THEN
      CREATE POLICY "Public Upload articles" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'articles');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Upload events') THEN
      CREATE POLICY "Public Upload events" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'events');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Upload playlists') THEN
      CREATE POLICY "Public Upload playlists" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'playlists');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Upload threads') THEN
      CREATE POLICY "Public Upload threads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'threads');
  END IF;
END $$;

-- 4. Add Update/Delete Policies (Public Management)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Update artists') THEN
      CREATE POLICY "Public Update artists" ON storage.objects FOR UPDATE USING (bucket_id = 'artists');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Update articles') THEN
      CREATE POLICY "Public Update articles" ON storage.objects FOR UPDATE USING (bucket_id = 'articles');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Update events') THEN
      CREATE POLICY "Public Update events" ON storage.objects FOR UPDATE USING (bucket_id = 'events');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Update playlists') THEN
      CREATE POLICY "Public Update playlists" ON storage.objects FOR UPDATE USING (bucket_id = 'playlists');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Update threads') THEN
      CREATE POLICY "Public Update threads" ON storage.objects FOR UPDATE USING (bucket_id = 'threads');
  END IF;
END $$;
