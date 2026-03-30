-- Migration: Fix schema mismatches between frontend payload and database
-- Run this in your Supabase SQL Editor to resolve SQL errors during saving.

-- 1. Fix Influencers Table
ALTER TABLE public.influencers 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_trending BOOLEAN DEFAULT false;

-- 2. Fix Threads Table
ALTER TABLE public.threads 
ADD COLUMN IF NOT EXISTS promo_video_url TEXT;

-- 3. Fix Events Table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_trending BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS promo_video_url TEXT;

-- 4. Fix Artists Table (Consistency)
ALTER TABLE public.artists 
ADD COLUMN IF NOT EXISTS is_trending BOOLEAN DEFAULT false;
