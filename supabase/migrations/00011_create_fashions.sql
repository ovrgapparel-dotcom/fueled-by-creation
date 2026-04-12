-- Fashions Table Migration
-- Run this in your Supabase SQL Editor

-- 1. Create Fashions Table
CREATE TABLE IF NOT EXISTS public.fashions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    category TEXT,
    bio TEXT,
    profile_image_url TEXT,
    banner_image_url TEXT,
    ig_url TEXT,
    yt_url TEXT,
    tiktok_spotify_url TEXT,
    merch_product_id TEXT, -- Added for shop integration
    is_featured BOOLEAN DEFAULT false,
    is_trending BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'Published' CHECK (status IN ('Draft', 'Published', 'Hidden'))
);

-- 2. Enable RLS
ALTER TABLE public.fashions ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
CREATE POLICY "Allow public read access to published fashions" ON public.fashions FOR SELECT USING (status = 'Published');

DROP POLICY IF EXISTS "Allow anon insert fashions" ON public.fashions;
CREATE POLICY "Allow anon insert fashions" ON public.fashions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update fashions" ON public.fashions;
CREATE POLICY "Allow anon update fashions" ON public.fashions FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow anon delete fashions" ON public.fashions;
CREATE POLICY "Allow anon delete fashions" ON public.fashions FOR DELETE USING (true);

-- 4. Storage bucket for Fashions
INSERT INTO storage.buckets (id, name, public) 
VALUES ('fashions', 'fashions', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access fashions" ON storage.objects FOR SELECT USING (bucket_id = 'fashions');
CREATE POLICY "Public Upload fashions" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'fashions');
CREATE POLICY "Public Update fashions" ON storage.objects FOR UPDATE USING (bucket_id = 'fashions');
CREATE POLICY "Public Delete fashions" ON storage.objects FOR DELETE USING (bucket_id = 'fashions');
