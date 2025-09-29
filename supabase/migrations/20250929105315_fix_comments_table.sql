-- Fix comments table by adding missing columns and updating policies

-- Add missing is_deleted column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'comments' AND column_name = 'is_deleted') THEN
        ALTER TABLE comments ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Add missing updated_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'comments' AND column_name = 'updated_at') THEN
        ALTER TABLE comments ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read comments" ON comments;
DROP POLICY IF EXISTS "Anyone can insert comments" ON comments;
DROP POLICY IF EXISTS "No updates or deletes allowed" ON comments;
DROP POLICY IF EXISTS "No deletes allowed" ON comments;

-- Create new RLS policies
-- Allow anyone to read non-deleted comments
CREATE POLICY "Anyone can read comments" ON comments
    FOR SELECT USING (is_deleted = FALSE);

-- Allow anyone to insert comments (anonymous posting)
CREATE POLICY "Anyone can insert comments" ON comments
    FOR INSERT WITH CHECK (
        length(trim(content)) > 0 AND 
        length(content) <= 10000 AND
        is_deleted = FALSE
    );

-- Only allow soft deletion (setting is_deleted = true)
-- No one can actually delete or update comments to maintain integrity
CREATE POLICY "No updates or deletes allowed" ON comments
    FOR UPDATE USING (FALSE);

CREATE POLICY "No deletes allowed" ON comments
    FOR DELETE USING (FALSE);

-- Drop existing triggers first (they depend on functions)
DROP TRIGGER IF EXISTS update_comment_count_trigger ON comments;
DROP TRIGGER IF EXISTS trigger_update_comment_count ON comments;

-- Now drop functions safely
DROP FUNCTION IF EXISTS get_comment_depth(BIGINT);
DROP FUNCTION IF EXISTS get_post_comments(BIGINT);
DROP FUNCTION IF EXISTS update_post_comment_count() CASCADE;

-- Function to get comment thread depth (for display purposes)
CREATE OR REPLACE FUNCTION get_comment_depth(comment_id BIGINT)
RETURNS INTEGER AS $$
DECLARE
    depth INTEGER := 0;
    current_parent_id BIGINT;
BEGIN
    SELECT parent_id INTO current_parent_id 
    FROM comments 
    WHERE id = comment_id;
    
    WHILE current_parent_id IS NOT NULL LOOP
        depth := depth + 1;
        SELECT parent_id INTO current_parent_id 
        FROM comments 
        WHERE id = current_parent_id;
        
        -- Prevent infinite loops (safety check)
        IF depth > 10 THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN depth;
END;
$$ LANGUAGE plpgsql;

-- Function to get all comments for a post in threaded order
CREATE OR REPLACE FUNCTION get_post_comments(post_id_param BIGINT)
RETURNS TABLE (
    id BIGINT,
    post_id BIGINT,
    parent_id BIGINT,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    depth INTEGER,
    path TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE comment_tree AS (
        -- Base case: top-level comments (no parent)
        SELECT 
            c.id,
            c.post_id,
            c.parent_id,
            c.content,
            c.created_at,
            0 as depth,
            c.id::TEXT as path
        FROM comments c
        WHERE c.post_id = post_id_param 
        AND c.parent_id IS NULL 
        AND c.is_deleted = FALSE
        
        UNION ALL
        
        -- Recursive case: child comments
        SELECT 
            c.id,
            c.post_id,
            c.parent_id,
            c.content,
            c.created_at,
            ct.depth + 1,
            ct.path || '.' || c.id::TEXT
        FROM comments c
        INNER JOIN comment_tree ct ON c.parent_id = ct.id
        WHERE c.is_deleted = FALSE
        AND ct.depth < 10  -- Limit depth to prevent infinite recursion
    )
    SELECT 
        ct.id,
        ct.post_id,
        ct.parent_id,
        ct.content,
        ct.created_at,
        ct.depth,
        ct.path
    FROM comment_tree ct
    ORDER BY ct.path;
END;
$$ LANGUAGE plpgsql;

-- Add comment count column to posts if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'posts' AND column_name = 'comment_count') THEN
        ALTER TABLE posts ADD COLUMN comment_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Function to update comment count
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts 
        SET comment_count = comment_count + 1 
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts 
        SET comment_count = comment_count - 1 
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_comment_count_trigger ON comments;

-- Create trigger to automatically update comment count
CREATE TRIGGER update_comment_count_trigger
    AFTER INSERT OR DELETE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_post_comment_count();

-- Initialize comment counts for existing posts
UPDATE posts SET comment_count = (
    SELECT COUNT(*) 
    FROM comments 
    WHERE comments.post_id = posts.id 
    AND comments.is_deleted = FALSE
) WHERE comment_count IS NULL OR comment_count = 0;