-- Improve cleanup function to ensure thorough deletion of comments and votes
-- This replaces the existing cleanup function with better tracking and logging

-- Drop the existing cleanup function to replace it
DROP FUNCTION IF EXISTS cleanup_expired_content();

-- Create improved cleanup function with detailed tracking
CREATE OR REPLACE FUNCTION cleanup_expired_content()
RETURNS TABLE(
    deleted_posts INTEGER,
    deleted_comments INTEGER,
    deleted_votes INTEGER,
    cleanup_timestamp TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    posts_deleted INTEGER := 0;
    comments_deleted INTEGER := 0;
    votes_deleted INTEGER := 0;
    current_time TIMESTAMP WITH TIME ZONE := timezone('utc'::text, now());
BEGIN
    -- Delete expired votes first (they reference posts and comments)
    DELETE FROM public.votes WHERE expires_at <= current_time;
    GET DIAGNOSTICS votes_deleted = ROW_COUNT;
    
    -- Delete expired comments (they reference posts)
    DELETE FROM public.comments WHERE expires_at <= current_time;
    GET DIAGNOSTICS comments_deleted = ROW_COUNT;
    
    -- Delete expired posts (this will cascade to any remaining comments/votes)
    DELETE FROM public.posts WHERE expires_at <= current_time;
    GET DIAGNOSTICS posts_deleted = ROW_COUNT;
    
    -- Return detailed cleanup statistics
    RETURN QUERY SELECT 
        posts_deleted,
        comments_deleted,
        votes_deleted,
        current_time;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission on the improved cleanup function
GRANT EXECUTE ON FUNCTION cleanup_expired_content() TO postgres;
GRANT EXECUTE ON FUNCTION cleanup_expired_content() TO anon;
GRANT EXECUTE ON FUNCTION cleanup_expired_content() TO authenticated;

-- Update the manual cleanup function to use the improved version
DROP FUNCTION IF EXISTS manual_cleanup();

CREATE OR REPLACE FUNCTION manual_cleanup()
RETURNS TABLE(
    deleted_posts INTEGER,
    deleted_comments INTEGER,
    deleted_votes INTEGER,
    cleanup_timestamp TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY SELECT * FROM cleanup_expired_content();
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission on manual cleanup function
GRANT EXECUTE ON FUNCTION manual_cleanup() TO anon;
GRANT EXECUTE ON FUNCTION manual_cleanup() TO authenticated;

-- Create a function to check what would be deleted (dry run)
CREATE OR REPLACE FUNCTION preview_cleanup()
RETURNS TABLE(
    posts_to_delete INTEGER,
    comments_to_delete INTEGER,
    votes_to_delete INTEGER,
    cleanup_time TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    current_time_val TIMESTAMP WITH TIME ZONE := timezone('utc'::text, now());
BEGIN
    RETURN QUERY SELECT
        (SELECT COUNT(*)::INTEGER FROM public.posts WHERE expires_at <= current_time_val),
        (SELECT COUNT(*)::INTEGER FROM public.comments WHERE expires_at <= current_time_val),
        (SELECT COUNT(*)::INTEGER FROM public.votes WHERE expires_at <= current_time_val),
        current_time_val;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission on preview function
GRANT EXECUTE ON FUNCTION preview_cleanup() TO anon;
GRANT EXECUTE ON FUNCTION preview_cleanup() TO authenticated;

-- Update the cleanup stats view to be more comprehensive
DROP VIEW IF EXISTS cleanup_stats;

CREATE OR REPLACE VIEW cleanup_stats AS
SELECT 
    'posts' as table_name,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE expires_at <= timezone('utc'::text, now())) as expired_records,
    COUNT(*) FILTER (WHERE expires_at > timezone('utc'::text, now())) as active_records,
    MIN(expires_at) as oldest_expiry,
    MAX(expires_at) as newest_expiry
FROM public.posts
UNION ALL
SELECT 
    'comments' as table_name,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE expires_at <= timezone('utc'::text, now())) as expired_records,
    COUNT(*) FILTER (WHERE expires_at > timezone('utc'::text, now())) as active_records,
    MIN(expires_at) as oldest_expiry,
    MAX(expires_at) as newest_expiry
FROM public.comments
UNION ALL
SELECT 
    'votes' as table_name,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE expires_at <= timezone('utc'::text, now())) as expired_records,
    COUNT(*) FILTER (WHERE expires_at > timezone('utc'::text, now())) as active_records,
    MIN(expires_at) as oldest_expiry,
    MAX(expires_at) as newest_expiry
FROM public.votes;

-- Grant read access to the updated cleanup stats view
GRANT SELECT ON cleanup_stats TO anon;
GRANT SELECT ON cleanup_stats TO authenticated;