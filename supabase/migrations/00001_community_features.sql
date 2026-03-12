-- Community Features: Topics, Likes, and Comments
-- Run this in your Supabase SQL Editor to fix security/missing table errors

-- 1. Topics Table (replacing/fixing community content)
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'thread', -- thread, article, event
    media_url TEXT,
    media_type TEXT DEFAULT 'image', -- image, video
    external_link TEXT,
    event_date TIMESTAMP WITH TIME ZONE,
    location TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    is_hot BOOLEAN DEFAULT false
);

-- 2. Likes Table
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    UNIQUE(topic_id, user_id)
);

-- 3. Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL
);

-- ==========================================
-- 4. ROW LEVEL SECURITY (RLS) FIXES
-- ==========================================

ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Topics: Public Read, Authenticated/Anon Insert
CREATE POLICY "Allow public read topics" ON public.topics FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert topics" ON public.topics FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own topics" ON public.topics FOR UPDATE USING (auth.uid() = user_id);

-- Likes: Public Read, Authenticated/Anon Toggle
CREATE POLICY "Allow public read likes" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert likes" ON public.likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous delete likes" ON public.likes FOR DELETE USING (true);

-- Comments: Public Read, Authenticated/Anon Insert
CREATE POLICY "Allow public read comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert comments" ON public.comments FOR INSERT WITH CHECK (true);

-- ==========================================
-- 5. AUTO-INCREMENT COUNTERS (Triggers)
-- ==========================================

-- Function to update topic likes count
CREATE OR REPLACE FUNCTION public.handle_topic_like()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.topics SET likes_count = likes_count + 1 WHERE id = NEW.topic_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.topics SET likes_count = likes_count - 1 WHERE id = OLD.topic_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_topic_like
AFTER INSERT OR DELETE ON public.likes
FOR EACH ROW EXECUTE FUNCTION public.handle_topic_like();

-- Function to update topic comments count
CREATE OR REPLACE FUNCTION public.handle_topic_comment()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.topics SET comments_count = comments_count + 1 WHERE id = NEW.topic_id;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_topic_comment
AFTER INSERT ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.handle_topic_comment();

-- ==========================================
-- 6. STORAGE BUCKET CONFIG
-- ==========================================
-- Ensure media_bucket exists and is public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media_bucket', 'media_bucket', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'media_bucket');
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media_bucket');
