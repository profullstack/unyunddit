-- Fix cleanup function to properly handle user_id column
-- We need to drop and recreate the function since we can't change return type

-- Drop the existing function first
DROP FUNCTION IF EXISTS cleanup_expired_content();

-- Recreate the function with the updated logic to preserve authenticated user posts
CREATE OR REPLACE FUNCTION cleanup_expired_content()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
BEGIN
    -- Delete expired posts ONLY if they are anonymous (user_id IS NULL)
    -- Authenticated user posts are preserved indefinitely
    DELETE FROM public.posts 
    WHERE expires_at <= timezone('utc'::text, now()) 
    AND user_id IS NULL;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Delete expired comments ONLY if they are anonymous (user_id IS NULL)
    -- Authenticated user comments are preserved indefinitely
    DELETE FROM public.comments 
    WHERE expires_at <= timezone('utc'::text, now()) 
    AND user_id IS NULL;
    
    -- Delete any orphaned votes (shouldn't happen due to cascade, but safety)
    DELETE FROM public.votes WHERE expires_at <= timezone('utc'::text, now());
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions on the recreated function
GRANT EXECUTE ON FUNCTION cleanup_expired_content() TO postgres;
GRANT EXECUTE ON FUNCTION cleanup_expired_content() TO anon;
GRANT EXECUTE ON FUNCTION cleanup_expired_content() TO authenticated;