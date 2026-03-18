-- Storage Buckets and Policies Migration
-- Run this in your Supabase SQL Editor

-- 1. Create Buckets if they don't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('product-images', 'product-images', true),
  ('radio-media', 'radio-media', true),
  ('assets', 'assets', true),
  ('influencers', 'influencers', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable Public Access (SELECT)
CREATE POLICY "Public Access product-images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Public Access radio-media" ON storage.objects FOR SELECT USING (bucket_id = 'radio-media');
CREATE POLICY "Public Access assets" ON storage.objects FOR SELECT USING (bucket_id = 'assets');
CREATE POLICY "Public Access influencers" ON storage.objects FOR SELECT USING (bucket_id = 'influencers');

-- 3. Enable Public Upload (INSERT) - IMPORTANT for testing without auth
-- Note: In production, you should restrict this to authenticated users.
CREATE POLICY "Public Upload product-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "Public Upload radio-media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'radio-media');
CREATE POLICY "Public Upload assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'assets');
CREATE POLICY "Public Upload influencers" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'influencers');

-- 4. Enable Public Update/Delete (Optional, for easy management)
CREATE POLICY "Public Update product-images" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images');
CREATE POLICY "Public Update radio-media" ON storage.objects FOR UPDATE USING (bucket_id = 'radio-media');
CREATE POLICY "Public Update assets" ON storage.objects FOR UPDATE USING (bucket_id = 'assets');
CREATE POLICY "Public Update influencers" ON storage.objects FOR UPDATE USING (bucket_id = 'influencers');
