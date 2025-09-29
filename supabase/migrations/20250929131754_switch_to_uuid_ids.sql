-- Switch from BIGSERIAL to UUID for all ID columns
-- This provides better security and prevents ID enumeration attacks

-- Enable uuid-ossp extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing constraints that might conflict
ALTER TABLE IF EXISTS public.votes DROP CONSTRAINT IF EXISTS unique_post_vote;
ALTER TABLE IF EXISTS public.votes DROP CONSTRAINT IF EXISTS unique_comment_vote;
ALTER TABLE IF EXISTS public.votes DROP CONSTRAINT IF EXISTS vote_target_check;

-- Create new tables with UUID IDs (we'll migrate data after)
-- Posts table with UUID
CREATE TABLE IF NOT EXISTS public.posts_new (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL CHECK (char_length(title) >= 1 AND char_length(title) <= 300),
    content TEXT CHECK (char_length(content) <= 10000),
    url TEXT CHECK (url IS NULL OR char_length(url) <= 2000),
    upvotes INTEGER DEFAULT 0 NOT NULL CHECK (upvotes >= 0),
    downvotes INTEGER DEFAULT 0 NOT NULL CHECK (downvotes >= 0),
    comment_count INTEGER DEFAULT 0 NOT NULL CHECK (comment_count >= 0),
    category_id BIGINT REFERENCES public.categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (timezone('utc'::text, now()) + INTERVAL '36 hours') NOT NULL
);

-- Comments table with UUID
CREATE TABLE IF NOT EXISTS public.comments_new (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.posts_new(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.comments_new(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 5000),
    upvotes INTEGER DEFAULT 0 NOT NULL CHECK (upvotes >= 0),
    downvotes INTEGER DEFAULT 0 NOT NULL CHECK (downvotes >= 0),
    depth INTEGER DEFAULT 0 NOT NULL CHECK (depth >= 0 AND depth <= 10),
    author_ip TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (timezone('utc'::text, now()) + INTERVAL '36 hours') NOT NULL
);

-- Votes table with UUID
CREATE TABLE IF NOT EXISTS public.votes_new (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ip_hash TEXT NOT NULL,
    post_id UUID REFERENCES public.posts_new(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES public.comments_new(id) ON DELETE CASCADE,
    vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (timezone('utc'::text, now()) + INTERVAL '36 hours') NOT NULL,
    CONSTRAINT vote_target_check_new CHECK (
        (post_id IS NOT NULL AND comment_id IS NULL) OR
        (post_id IS NULL AND comment_id IS NOT NULL)
    ),
    CONSTRAINT unique_post_vote_new UNIQUE (ip_hash, post_id),
    CONSTRAINT unique_comment_vote_new UNIQUE (ip_hash, comment_id)
);

-- Migrate existing data (if any exists)
-- Note: This will generate new UUIDs for existing posts
INSERT INTO public.posts_new (title, content, url, upvotes, downvotes, comment_count, category_id, created_at, expires_at)
SELECT title, content, url, upvotes, downvotes, comment_count, category_id, created_at, expires_at
FROM public.posts;

-- Drop old tables and rename new ones
DROP TABLE IF EXISTS public.votes CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;

ALTER TABLE public.posts_new RENAME TO posts;
ALTER TABLE public.comments_new RENAME TO comments;
ALTER TABLE public.votes_new RENAME TO votes;

-- Recreate indexes for UUID tables
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_expires_at ON public.posts(expires_at);
CREATE INDEX IF NOT EXISTS idx_posts_score ON public.posts((upvotes - downvotes) DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category_id ON public.posts(category_id);

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_expires_at ON public.comments(expires_at);

CREATE INDEX IF NOT EXISTS idx_votes_ip_hash ON public.votes(ip_hash);
CREATE INDEX IF NOT EXISTS idx_votes_post_id ON public.votes(post_id);
CREATE INDEX IF NOT EXISTS idx_votes_comment_id ON public.votes(comment_id);
CREATE INDEX IF NOT EXISTS idx_votes_expires_at ON public.votes(expires_at);

-- Enable Row Level Security
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Recreate policies
CREATE POLICY "Anyone can read non-expired posts" ON public.posts
    FOR SELECT USING (expires_at > timezone('utc'::text, now()));

CREATE POLICY "Anyone can insert posts" ON public.posts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read non-expired comments" ON public.comments
    FOR SELECT USING (expires_at > timezone('utc'::text, now()));

CREATE POLICY "Anyone can insert comments" ON public.comments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read non-expired votes" ON public.votes
    FOR SELECT USING (expires_at > timezone('utc'::text, now()));

CREATE POLICY "Anyone can insert votes" ON public.votes
    FOR INSERT WITH CHECK (expires_at > timezone('utc'::text, now()));

CREATE POLICY "Anyone can update their own votes" ON public.votes
    FOR UPDATE USING (expires_at > timezone('utc'::text, now()));

CREATE POLICY "Anyone can delete their own votes" ON public.votes
    FOR DELETE USING (expires_at > timezone('utc'::text, now()));

-- Grant permissions
GRANT SELECT, INSERT ON public.posts TO anon;
GRANT SELECT, INSERT ON public.posts TO authenticated;

GRANT SELECT, INSERT ON public.comments TO anon;
GRANT SELECT, INSERT ON public.comments TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.votes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.votes TO authenticated;

-- Recreate triggers for UUID tables
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.posts 
        SET comment_count = comment_count + 1 
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.posts 
        SET comment_count = GREATEST(0, comment_count - 1) 
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_comment_count
    AFTER INSERT OR DELETE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION update_post_comment_count();

CREATE OR REPLACE FUNCTION update_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.post_id IS NOT NULL THEN
            IF NEW.vote_type = 'up' THEN
                UPDATE public.posts SET upvotes = upvotes + 1 WHERE id = NEW.post_id;
            ELSE
                UPDATE public.posts SET downvotes = downvotes + 1 WHERE id = NEW.post_id;
            END IF;
        ELSIF NEW.comment_id IS NOT NULL THEN
            IF NEW.vote_type = 'up' THEN
                UPDATE public.comments SET upvotes = upvotes + 1 WHERE id = NEW.comment_id;
            ELSE
                UPDATE public.comments SET downvotes = downvotes + 1 WHERE id = NEW.comment_id;
            END IF;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle vote type change (up to down or down to up)
        IF OLD.post_id IS NOT NULL THEN
            -- Remove old vote count
            IF OLD.vote_type = 'up' THEN
                UPDATE public.posts SET upvotes = GREATEST(0, upvotes - 1) WHERE id = OLD.post_id;
            ELSE
                UPDATE public.posts SET downvotes = GREATEST(0, downvotes - 1) WHERE id = OLD.post_id;
            END IF;
            -- Add new vote count
            IF NEW.vote_type = 'up' THEN
                UPDATE public.posts SET upvotes = upvotes + 1 WHERE id = NEW.post_id;
            ELSE
                UPDATE public.posts SET downvotes = downvotes + 1 WHERE id = NEW.post_id;
            END IF;
        ELSIF OLD.comment_id IS NOT NULL THEN
            -- Remove old vote count
            IF OLD.vote_type = 'up' THEN
                UPDATE public.comments SET upvotes = GREATEST(0, upvotes - 1) WHERE id = OLD.comment_id;
            ELSE
                UPDATE public.comments SET downvotes = GREATEST(0, downvotes - 1) WHERE id = OLD.comment_id;
            END IF;
            -- Add new vote count
            IF NEW.vote_type = 'up' THEN
                UPDATE public.comments SET upvotes = upvotes + 1 WHERE id = NEW.comment_id;
            ELSE
                UPDATE public.comments SET downvotes = downvotes + 1 WHERE id = NEW.comment_id;
            END IF;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.post_id IS NOT NULL THEN
            IF OLD.vote_type = 'up' THEN
                UPDATE public.posts SET upvotes = GREATEST(0, upvotes - 1) WHERE id = OLD.post_id;
            ELSE
                UPDATE public.posts SET downvotes = GREATEST(0, downvotes - 1) WHERE id = OLD.post_id;
            END IF;
        ELSIF OLD.comment_id IS NOT NULL THEN
            IF OLD.vote_type = 'up' THEN
                UPDATE public.comments SET upvotes = GREATEST(0, upvotes - 1) WHERE id = OLD.comment_id;
            ELSE
                UPDATE public.comments SET downvotes = GREATEST(0, downvotes - 1) WHERE id = OLD.comment_id;
            END IF;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_vote_counts
    AFTER INSERT OR UPDATE OR DELETE ON public.votes
    FOR EACH ROW EXECUTE FUNCTION update_vote_counts();

-- Update the get_post_comments function to work with UUIDs
DROP FUNCTION IF EXISTS get_post_comments(BIGINT);

CREATE OR REPLACE FUNCTION get_post_comments(post_id_param UUID)
RETURNS TABLE (
    id UUID,
    post_id UUID,
    parent_id UUID,
    content TEXT,
    upvotes INTEGER,
    downvotes INTEGER,
    depth INTEGER,
    author_ip TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE
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
            c.upvotes,
            c.downvotes,
            c.depth,
            c.author_ip,
            c.created_at,
            c.expires_at
        FROM public.comments c
        WHERE c.post_id = post_id_param
        AND c.parent_id IS NULL
        AND c.expires_at > timezone('utc'::text, now())
        
        UNION ALL
        
        -- Recursive case: child comments
        SELECT
            c.id,
            c.post_id,
            c.parent_id,
            c.content,
            c.upvotes,
            c.downvotes,
            c.depth,
            c.author_ip,
            c.created_at,
            c.expires_at
        FROM public.comments c
        INNER JOIN comment_tree ct ON c.parent_id = ct.id
        WHERE c.expires_at > timezone('utc'::text, now())
    )
    SELECT * FROM comment_tree
    ORDER BY created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission on the updated function
GRANT EXECUTE ON FUNCTION get_post_comments(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_post_comments(UUID) TO authenticated;