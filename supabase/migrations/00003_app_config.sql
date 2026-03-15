-- Create app_config table for dynamic application settings
CREATE TABLE IF NOT EXISTS public.app_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read app_config" ON public.app_config FOR SELECT USING (true);

-- Allow service-role/authenticated insert/update (Admin Panel)
CREATE POLICY "Allow admin all access to app_config" ON public.app_config FOR ALL USING (auth.role() = 'authenticated');

-- Initial data
INSERT INTO public.app_config (key, value)
VALUES ('hero_video_url', 'https://vz-746a5c10-8cd.b-cdn.net/513e9a7e-1a5c-4d3e-9e33-7a918e9a/play_480p.mp4')
ON CONFLICT (key) DO NOTHING;
