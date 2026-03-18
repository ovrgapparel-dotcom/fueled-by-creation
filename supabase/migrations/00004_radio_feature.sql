-- Radio Mix Tape Feature Migration
-- Run this in your Supabase SQL Editor

-- 1. Create Playlists Table
CREATE TABLE IF NOT EXISTS public.playlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    artist_name TEXT,
    description TEXT,
    cover_image_url TEXT,
    status TEXT DEFAULT 'Draft' CHECK (status IN ('Draft', 'Published', 'Hidden')),
    priority_order INTEGER DEFAULT 0
);

-- 2. Create Playlist Tracks Table
CREATE TABLE IF NOT EXISTS public.playlist_tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE,
    track_title TEXT NOT NULL,
    track_url TEXT NOT NULL,
    track_order INTEGER NOT NULL DEFAULT 0
);

-- 3. Create Storage Bucket for Audio
INSERT INTO storage.buckets (id, name, public) 
VALUES ('radio-media', 'radio-media', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Enable RLS
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_tracks ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies (Public Read Access)
CREATE POLICY "Allow public read access to published playlists" ON public.playlists FOR SELECT USING (status = 'Published');
CREATE POLICY "Allow public read access to playlist tracks" ON public.playlist_tracks FOR SELECT USING (true);
