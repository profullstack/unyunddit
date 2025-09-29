-- Setup automatic cleanup of expired posts every hour
-- This uses pg_cron extension to automatically delete posts older than 36 hours

-- Enable pg_cron extension (requires superuser privileges)
-- Note: This may need to be enabled manually in production environments
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule cleanup job to run every hour
-- This will delete all posts (and cascading comments/votes) that have expired
SELECT cron.schedule(
    'cleanup-expired-posts',           -- job name
    '0 * * * *',                      -- cron expression: every hour at minute 0
    'SELECT cleanup_expired_content();' -- SQL command to execute
);

-- Alternative: Create a simpler cleanup job that runs every 15 minutes for more frequent cleanup
-- Uncomment the following if you prefer more frequent cleanup:
-- SELECT cron.schedule(
--     'cleanup-expired-posts-frequent',
--     '*/15 * * * *',                    -- every 15 minutes
--     'SELECT cleanup_expired_content();'
-- );

-- Grant necessary permissions for the cleanup function to be executed by cron
-- The cron job runs as the postgres user, so we need to ensure it has access
GRANT EXECUTE ON FUNCTION cleanup_expired_content() TO postgres;

-- Create a view to monitor cleanup statistics
CREATE OR REPLACE VIEW cleanup_stats AS
SELECT 
    'posts' as table_name,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE expires_at <= timezone('utc'::text, now())) as expired_records,
    COUNT(*) FILTER (WHERE expires_at > timezone('utc'::text, now())) as active_records
FROM public.posts
UNION ALL
SELECT 
    'comments' as table_name,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE expires_at <= timezone('utc'::text, now())) as expired_records,
    COUNT(*) FILTER (WHERE expires_at > timezone('utc'::text, now())) as active_records
FROM public.comments
UNION ALL
SELECT 
    'votes' as table_name,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE expires_at <= timezone('utc'::text, now())) as expired_records,
    COUNT(*) FILTER (WHERE expires_at > timezone('utc'::text, now())) as active_records
FROM public.votes;

-- Grant read access to the cleanup stats view
GRANT SELECT ON cleanup_stats TO anon;
GRANT SELECT ON cleanup_stats TO authenticated;

-- Create a function to manually trigger cleanup (useful for testing)
CREATE OR REPLACE FUNCTION manual_cleanup()
RETURNS TABLE(
    deleted_posts INTEGER,
    cleanup_timestamp TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    SELECT cleanup_expired_content() INTO deleted_count;
    RETURN QUERY SELECT deleted_count, timezone('utc'::text, now());
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission on manual cleanup function
GRANT EXECUTE ON FUNCTION manual_cleanup() TO anon;
GRANT EXECUTE ON FUNCTION manual_cleanup() TO authenticated;