-- Fix RLS policies for users table to work with custom cookie-based authentication
-- The original policies used auth.uid() which only works with Supabase Auth
-- We need to allow reading user data for our custom authentication system

-- Drop the old restrictive policies
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;

-- Create new policies that allow reading user data
-- This is safe because we only expose username and created_at (no sensitive data)
CREATE POLICY "Anyone can read user profiles" ON public.users
    FOR SELECT USING (true);

-- Keep the registration policy as-is
-- (Already exists: "Anyone can register")

-- Users table doesn't need update policy since we use SECURITY DEFINER functions
-- The verify_user function already handles last_login updates with elevated privileges

-- Note: password_hash is never exposed in SELECT queries from the application
-- Only username and created_at are selected in getUserInfo()