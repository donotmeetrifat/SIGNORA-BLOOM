-- ====================================================================
-- SIGNORA BLOOM - Supabase Database Schema & Realtime Setup
-- ====================================================================
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard)
-- Project -> SQL Editor -> New Query -> Run
-- ====================================================================

-- 1. Create the site_content table for storing global website settings
CREATE TABLE IF NOT EXISTS public.site_content (
    id TEXT PRIMARY KEY DEFAULT 'settings',
    content JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now(),
    updated_by TEXT
);

-- 2. Enable Supabase Realtime for instant live updates across all clients worldwide
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_content;

-- 3. Configure Row Level Security (RLS) policies
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Allow anyone (public/anonymous visitors) to read the site content
DROP POLICY IF EXISTS "Allow public read access" ON public.site_content;
CREATE POLICY "Allow public read access" 
ON public.site_content 
FOR SELECT 
USING (true);

-- Allow inserting or updating site content
DROP POLICY IF EXISTS "Allow public insert and update access" ON public.site_content;
CREATE POLICY "Allow public insert and update access" 
ON public.site_content 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Optional: Insert initial empty placeholder if table is fresh
-- (The web application will automatically populate and merge defaults upon admin update)
INSERT INTO public.site_content (id, content, updated_at, updated_by)
VALUES ('settings', '{}'::jsonb, now(), 'system')
ON CONFLICT (id) DO NOTHING;
