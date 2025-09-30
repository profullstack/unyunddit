-- Link posts to users and modify cleanup logic to preserve authenticated user posts
-- Anonymous posts still auto-delete after 72 hours, but authenticated user posts persist indefinitely

-- Add user_id column to posts table (nullable for anonymous posts)
ALTER TABLE public.posts 
ADD COLUMN user_id UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- Add user_id column to comments table (nullable for anonymous comments)
ALTER TABLE public.comments 
ADD COLUMN user_id UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);

-- Update cleanup function to preserve posts from authenticated users
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

-- Update policies to allow users to see their own posts even if expired
DROP POLICY IF EXISTS "Anyone can read non-expired posts" ON public.posts;
CREATE POLICY "Anyone can read non-expired posts or own posts" ON public.posts
    FOR SELECT USING (
        expires_at > timezone('utc'::text, now()) 
        OR user_id = auth.uid()
    );

-- Update policies to allow users to see their own comments even if expired
DROP POLICY IF EXISTS "Anyone can read non-expired comments" ON public.comments;
CREATE POLICY "Anyone can read non-expired comments or own comments" ON public.comments
    FOR SELECT USING (
        expires_at > timezone('utc'::text, now()) 
        OR user_id = auth.uid()
    );

-- Add policy to allow users to update their own posts
CREATE POLICY "Users can update own posts" ON public.posts
    FOR UPDATE USING (user_id = auth.uid());

-- Add policy to allow users to update their own comments
CREATE POLICY "Users can update own comments" ON public.comments
    FOR UPDATE USING (user_id = auth.uid());

-- Add policy to allow users to delete their own posts
CREATE POLICY "Users can delete own posts" ON public.posts
    FOR DELETE USING (user_id = auth.uid());

-- Add policy to allow users to delete their own comments
CREATE POLICY "Users can delete own comments" ON public.comments
    FOR DELETE USING (user_id = auth.uid());

-- Grant UPDATE and DELETE permissions
GRANT UPDATE, DELETE ON public.posts TO authenticated;
GRANT UPDATE, DELETE ON public.comments TO authenticated;

-- Create view to show post statistics including user posts
CREATE OR REPLACE VIEW post_stats AS
SELECT 
    'posts' as table_name,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE user_id IS NULL AND expires_at <= timezone('utc'::text, now())) as expired_anonymous,
    COUNT(*) FILTER (WHERE user_id IS NULL AND expires_at > timezone('utc'::text, now())) as active_anonymous,
    COUNT(*) FILTER (WHERE user_id IS NOT NULL) as authenticated_user_posts
FROM public.posts
UNION ALL
SELECT 
    'comments' as table_name,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE user_id IS NULL AND expires_at <= timezone('utc'::text, now())) as expired_anonymous,
    COUNT(*) FILTER (WHERE user_id IS NULL AND expires_at > timezone('utc'::text, now())) as active_anonymous,
    COUNT(*) FILTER (WHERE user_id IS NOT NULL) as authenticated_user_comments
FROM public.comments;

-- Grant read access to the post stats view
GRANT SELECT ON post_stats TO anon;
GRANT SELECT ON post_stats TO authenticated;

-- Add comments explaining the new system
COMMENT ON COLUMN posts.user_id IS 'Optional user ID - if NULL, post is anonymous and will auto-delete after 72 hours';
COMMENT ON COLUMN comments.user_id IS 'Optional user ID - if NULL, comment is anonymous and will auto-delete after 72 hours';