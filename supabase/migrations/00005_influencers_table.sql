-- Influencers Table Migration
-- Run this in your Supabase SQL Editor

-- 1. Create Influencers Table
CREATE TABLE IF NOT EXISTS public.influencers (
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
    status TEXT DEFAULT 'Published' CHECK (status IN ('Draft', 'Published', 'Hidden'))
);

-- 2. Enable RLS
ALTER TABLE public.influencers ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies (Public Read Access)
CREATE POLICY "Allow public read access to published influencers" ON public.influencers FOR SELECT USING (status = 'Published');

-- 4. Admin Access (Service Role manages all, so no specific write policy needed if using Service Key)
-- But we can add a broad policy for testing if needed
-- CREATE POLICY "Allow admin all access" ON public.influencers FOR ALL USING (true);
