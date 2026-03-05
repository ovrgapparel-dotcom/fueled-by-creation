-- Fueled By Creation: Initial Schema
-- Run this in your Supabase SQL Editor

-- 1. Enable pgcrypto for UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 2. TABLES
-- ==========================================

-- Artists Table
CREATE TABLE public.artists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    bio TEXT,
    profile_image_url TEXT,
    banner_image_url TEXT,
    promo_video_url TEXT,
    latest_release_title TEXT,
    latest_release_cover_url TEXT,
    latest_release_listen_url TEXT,
    latest_release_date DATE,
    merch_product_id TEXT, -- Connects to your store products
    instagram_url TEXT,
    youtube_url TEXT,
    tiktok_spotify_url TEXT,
    status TEXT DEFAULT 'Draft' CHECK (status IN ('Draft', 'Published', 'Hidden')),
    is_featured BOOLEAN DEFAULT false
);

-- Articles Table
CREATE TABLE public.articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    cover_image_url TEXT,
    excerpt TEXT,
    body_content TEXT, -- Rich Text HTML/Markdown
    author TEXT,
    publish_date TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'Draft' CHECK (status IN ('Draft', 'Published', 'Hidden')),
    is_featured BOOLEAN DEFAULT false,
    is_trending BOOLEAN DEFAULT false
);

-- Threads Table
CREATE TABLE public.threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    tag TEXT CHECK (tag IN ('Hot', 'Trend', 'News')),
    hook_text TEXT,
    cover_image_url TEXT,
    external_link TEXT,
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Hidden')),
    priority_order INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT false
);

-- Events Table
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location_name TEXT NOT NULL,
    location_address TEXT,
    cover_image_url TEXT,
    ticketing_url TEXT,
    featured_artist_id UUID REFERENCES public.artists(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'Published' CHECK (status IN ('Draft', 'Published', 'Hidden'))
);

-- User Devices (For Push Notifications)
CREATE TABLE public.user_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Nullable for anon guests
    fcm_token TEXT NOT NULL UNIQUE,
    platform TEXT DEFAULT 'android',
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Notifications (Broadcast History)
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT,
    image_url TEXT,
    deep_link TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent')),
    total_sent INTEGER DEFAULT 0,
    total_opened INTEGER DEFAULT 0,
    open_rate FLOAT DEFAULT 0.0
);

-- Notification Events (Tracking opens/clicks)
CREATE TABLE public.notification_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    notification_id UUID REFERENCES public.notifications(id) ON DELETE CASCADE,
    device_token TEXT NOT NULL,
    event_type TEXT CHECK (event_type IN ('sent', 'opened')),
    platform TEXT DEFAULT 'android'
);

-- ==========================================
-- 3. STORAGE BUCKETS
-- ==========================================
-- (Note: Standard Supabase Storage requires INSERT to storage.buckets. Run through dashboard primarily)
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('artists-media', 'artists-media', true),
  ('articles-media', 'articles-media', true),
  ('threads-media', 'threads-media', true),
  ('events-media', 'events-media', true),
  ('private-uploads', 'private-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ==========================================
-- Enable RLS for all tables
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_events ENABLE ROW LEVEL SECURITY;

-- Anonymous (Public) Read Access to active content
CREATE POLICY "Allow public read access to active artists" ON public.artists FOR SELECT USING (status = 'Published');
CREATE POLICY "Allow public read access to active articles" ON public.articles FOR SELECT USING (status = 'Published');
CREATE POLICY "Allow public read access to active threads" ON public.threads FOR SELECT USING (status = 'Active');
CREATE POLICY "Allow public read access to active events" ON public.events FOR SELECT USING (status = 'Published');

-- Allow devices to self-register their FCM tokens
CREATE POLICY "Allow anon insert devices" ON public.user_devices FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update own devices" ON public.user_devices FOR UPDATE USING (true);

-- Allow devices to log open events
CREATE POLICY "Allow anon insert notification events" ON public.notification_events FOR INSERT WITH CHECK (true);

-- Provide ALL ACCESS to the Service Role (Admin Panel via Vercel)
-- (The Service Role Key bypasses RLS by default, but we can explicitly state it for good measure, or assume anon gets no write access by default.)
