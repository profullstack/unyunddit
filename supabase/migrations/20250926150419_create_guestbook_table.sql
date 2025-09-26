-- Create guestbook table for anonymous messages
-- This demonstrates a simple form-based interaction for .onion sites

CREATE TABLE IF NOT EXISTS public.guestbook (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
    message TEXT NOT NULL CHECK (char_length(message) >= 1 AND char_length(message) <= 1000),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for efficient querying by creation time
CREATE INDEX IF NOT EXISTS idx_guestbook_created_at ON public.guestbook(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.guestbook ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read guestbook entries
CREATE POLICY "Anyone can read guestbook entries" ON public.guestbook
    FOR SELECT USING (true);

-- Create policy to allow anyone to insert guestbook entries
CREATE POLICY "Anyone can insert guestbook entries" ON public.guestbook
    FOR INSERT WITH CHECK (true);

-- Grant necessary permissions
GRANT SELECT, INSERT ON public.guestbook TO anon;
GRANT SELECT, INSERT ON public.guestbook TO authenticated;

-- Grant usage on the sequence for auto-incrementing IDs
GRANT USAGE ON SEQUENCE public.guestbook_id_seq TO anon;
GRANT USAGE ON SEQUENCE public.guestbook_id_seq TO authenticated;