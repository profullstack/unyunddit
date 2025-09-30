-- Add users table for authentication
-- Simple username/password authentication without email validation

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE CHECK (char_length(username) >= 3 AND char_length(username) <= 50),
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Create index for efficient username lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
-- Users can only read their own data
CREATE POLICY "Users can read own data" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Anyone can insert (register) new users
CREATE POLICY "Anyone can register" ON public.users
    FOR INSERT WITH CHECK (true);

-- Users can update their own data (for last_login updates)
CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.users TO anon;
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;

-- Function to hash passwords using pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to create a new user with hashed password
CREATE OR REPLACE FUNCTION create_user(
    p_username TEXT,
    p_password TEXT
) RETURNS UUID AS $$
DECLARE
    user_id UUID;
BEGIN
    -- Validate input
    IF char_length(p_username) < 3 OR char_length(p_username) > 50 THEN
        RAISE EXCEPTION 'Username must be between 3 and 50 characters';
    END IF;
    
    IF char_length(p_password) < 6 THEN
        RAISE EXCEPTION 'Password must be at least 6 characters';
    END IF;
    
    -- Insert new user with hashed password
    INSERT INTO public.users (username, password_hash)
    VALUES (p_username, crypt(p_password, gen_salt('bf')))
    RETURNING id INTO user_id;
    
    RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify user credentials
CREATE OR REPLACE FUNCTION verify_user(
    p_username TEXT,
    p_password TEXT
) RETURNS UUID AS $$
DECLARE
    user_id UUID;
BEGIN
    -- Check credentials
    SELECT id INTO user_id
    FROM public.users
    WHERE username = p_username
    AND password_hash = crypt(p_password, password_hash);
    
    -- Update last_login if user found
    IF user_id IS NOT NULL THEN
        UPDATE public.users
        SET last_login = timezone('utc'::text, now())
        WHERE id = user_id;
    END IF;
    
    RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION create_user(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION create_user(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION verify_user(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION verify_user(TEXT, TEXT) TO authenticated;