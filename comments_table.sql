-- SQL snippet to create the thread_comments table in Supabase

CREATE TABLE public.thread_comments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    thread_id uuid REFERENCES public.threads(id) ON DELETE CASCADE,
    author_name text NOT NULL DEFAULT 'Guest',
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.thread_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since the app allows guest comments)
CREATE POLICY "Enable read access for all users" ON public.thread_comments
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON public.thread_comments
    FOR INSERT WITH CHECK (true);
