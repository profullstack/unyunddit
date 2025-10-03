-- Restrict DELETE operations to admin users only
-- This migration adds an is_admin column and updates policies to only allow admins to delete posts and comments

-- Add is_admin column to users table (defaults to false)
ALTER TABLE public.users 
ADD COLUMN is_admin BOOLEAN DEFAULT false NOT NULL;

-- Create index for efficient admin lookups
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON public.users(is_admin) WHERE is_admin = true;

-- Drop existing permissive DELETE policies
DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;

-- Create new admin-only DELETE policies for posts
CREATE POLICY "Only admins can delete posts" ON public.posts
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.is_admin = true
        )
    );

-- Create new admin-only DELETE policies for comments
CREATE POLICY "Only admins can delete comments" ON public.comments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.is_admin = true
        )
    );

-- Add comment explaining the admin system
COMMENT ON COLUMN users.is_admin IS 'Admin flag - only admin users can delete posts and comments';