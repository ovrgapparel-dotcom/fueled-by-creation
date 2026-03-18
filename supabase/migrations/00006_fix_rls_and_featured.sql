-- Fix RLS and Add Featured/Trending Columns
-- Run this in your Supabase SQL Editor

-- 1. Add columns to influencers and playlists
ALTER TABLE public.influencers ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE public.influencers ADD COLUMN IF NOT EXISTS is_trending BOOLEAN DEFAULT false;
ALTER TABLE public.playlists ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE public.playlists ADD COLUMN IF NOT EXISTS is_trending BOOLEAN DEFAULT false;

-- 2. Comprehensive RLS Fix (Enable broad access for Admin Panel tasks)
-- We add INSERT/UPDATE/DELETE policies for the anon role so the Admin Panel can save data.
-- IMPORTANT: In a production app, you should restrict this to 'authenticated' users or specific roles.

-- Artists
DROP POLICY IF EXISTS "Allow anon insert artists" ON public.artists;
CREATE POLICY "Allow anon insert artists" ON public.artists FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon update artists" ON public.artists;
CREATE POLICY "Allow anon update artists" ON public.artists FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow anon delete artists" ON public.artists;
CREATE POLICY "Allow anon delete artists" ON public.artists FOR DELETE USING (true);

-- Articles
DROP POLICY IF EXISTS "Allow anon insert articles" ON public.articles;
CREATE POLICY "Allow anon insert articles" ON public.articles FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon update articles" ON public.articles;
CREATE POLICY "Allow anon update articles" ON public.articles FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow anon delete articles" ON public.articles;
CREATE POLICY "Allow anon delete articles" ON public.articles FOR DELETE USING (true);

-- Events
DROP POLICY IF EXISTS "Allow anon insert events" ON public.events;
CREATE POLICY "Allow anon insert events" ON public.events FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon update events" ON public.events;
CREATE POLICY "Allow anon update events" ON public.events FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow anon delete events" ON public.events;
CREATE POLICY "Allow anon delete events" ON public.events FOR DELETE USING (true);

-- Influencers
DROP POLICY IF EXISTS "Allow anon insert influencers" ON public.influencers;
CREATE POLICY "Allow anon insert influencers" ON public.influencers FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon update influencers" ON public.influencers;
CREATE POLICY "Allow anon update influencers" ON public.influencers FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow anon delete influencers" ON public.influencers;
CREATE POLICY "Allow anon delete influencers" ON public.influencers FOR DELETE USING (true);

-- Playlists
DROP POLICY IF EXISTS "Allow anon insert playlists" ON public.playlists;
CREATE POLICY "Allow anon insert playlists" ON public.playlists FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon update playlists" ON public.playlists;
CREATE POLICY "Allow anon update playlists" ON public.playlists FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow anon delete playlists" ON public.playlists;
CREATE POLICY "Allow anon delete playlists" ON public.playlists FOR DELETE USING (true);

-- Playlist Tracks
DROP POLICY IF EXISTS "Allow anon insert playlist_tracks" ON public.playlist_tracks;
CREATE POLICY "Allow anon insert playlist_tracks" ON public.playlist_tracks FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon update playlist_tracks" ON public.playlist_tracks;
CREATE POLICY "Allow anon update playlist_tracks" ON public.playlist_tracks FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow anon delete playlist_tracks" ON public.playlist_tracks;
CREATE POLICY "Allow anon delete playlist_tracks" ON public.playlist_tracks FOR DELETE USING (true);

-- Threads
DROP POLICY IF EXISTS "Allow anon insert threads" ON public.threads;
CREATE POLICY "Allow anon insert threads" ON public.threads FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon update threads" ON public.threads;
CREATE POLICY "Allow anon update threads" ON public.threads FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow anon delete threads" ON public.threads;
CREATE POLICY "Allow anon delete threads" ON public.threads FOR DELETE USING (true);
