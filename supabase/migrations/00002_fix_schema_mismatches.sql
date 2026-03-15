-- Fueled By Creation: Schema Reconciliation (v1.0.3)
-- Run this in your Supabase SQL Editor to fix "column not found" errors

-- 1. Fix Articles Table
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS promo_video_url TEXT;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS external_link TEXT;

-- 2. Fix Events Table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS promo_video_url TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS external_link TEXT;

-- 3. Fix Threads Table
ALTER TABLE public.threads ADD COLUMN IF NOT EXISTS promo_video_url TEXT;

-- 4. Refresh Schema Cache
-- (This happens automatically in Supabase when DDL is executed)

-- Verification:
-- After running this, try saving content in the FBC Admin Panel again.
