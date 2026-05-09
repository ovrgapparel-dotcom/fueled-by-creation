-- SQL snippet to create the vlogs and vlog_comments tables in Supabase

-- Create the vlogs table
CREATE TABLE IF NOT EXISTS public.vlogs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text,
    video_url text NOT NULL,
    cover_image_url text,
    author text DEFAULT 'FBC',
    publish_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    status text DEFAULT 'Published',
    is_featured boolean DEFAULT false,
    likes integer DEFAULT 0,
    views integer DEFAULT 0,
    comments_count integer DEFAULT 0,
    social_links jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create the vlog_comments table
CREATE TABLE IF NOT EXISTS public.vlog_comments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    vlog_id uuid REFERENCES public.vlogs(id) ON DELETE CASCADE,
    author_name text NOT NULL DEFAULT 'Guest',
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.vlogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vlog_comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to avoid errors on rerun
DROP POLICY IF EXISTS "Public read vlogs" ON public.vlogs;
DROP POLICY IF EXISTS "Public read vlog_comments" ON public.vlog_comments;
DROP POLICY IF EXISTS "Public insert vlog_comments" ON public.vlog_comments;
DROP POLICY IF EXISTS "Public update vlog interactions" ON public.vlogs;

-- Create policies for public access
CREATE POLICY "Public read vlogs" ON public.vlogs FOR SELECT USING (true);
CREATE POLICY "Public read vlog_comments" ON public.vlog_comments FOR SELECT USING (true);
CREATE POLICY "Public insert vlog_comments" ON public.vlog_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update vlog interactions" ON public.vlogs FOR UPDATE USING (true);
