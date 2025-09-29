-- Create anonymous Reddit clone schema
-- Posts auto-delete after 36 hours, completely anonymous, no client-side JS

-- Create posts table
CREATE TABLE IF NOT EXISTS public.posts (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL CHECK (char_length(title) >= 1 AND char_length(title) <= 300),
    content TEXT CHECK (char_length(content) <= 10000),
    url TEXT CHECK (url IS NULL OR char_length(url) <= 2000),
    upvotes INTEGER DEFAULT 0 NOT NULL CHECK (upvotes >= 0),
    downvotes INTEGER DEFAULT 0 NOT NULL CHECK (downvotes >= 0),
    comment_count INTEGER DEFAULT 0 NOT NULL CHECK (comment_count >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (timezone('utc'::text, now()) + INTERVAL '36 hours') NOT NULL
);

-- Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    parent_id BIGINT REFERENCES public.comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 5000),
    upvotes INTEGER DEFAULT 0 NOT NULL CHECK (upvotes >= 0),
    downvotes INTEGER DEFAULT 0 NOT NULL CHECK (downvotes >= 0),
    depth INTEGER DEFAULT 0 NOT NULL CHECK (depth >= 0 AND depth <= 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (timezone('utc'::text, now()) + INTERVAL '36 hours') NOT NULL
);

-- Create votes table to prevent double voting (using IP hash for anonymity)
CREATE TABLE IF NOT EXISTS public.votes (
    id BIGSERIAL PRIMARY KEY,
    ip_hash TEXT NOT NULL, -- SHA256 hash of IP address for anonymity
    post_id BIGINT REFERENCES public.posts(id) ON DELETE CASCADE,
    comment_id BIGINT REFERENCES public.comments(id) ON DELETE CASCADE,
    vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (timezone('utc'::text, now()) + INTERVAL '36 hours') NOT NULL,
    CONSTRAINT vote_target_check CHECK (
        (post_id IS NOT NULL AND comment_id IS NULL) OR 
        (post_id IS NULL AND comment_id IS NOT NULL)
    ),
    CONSTRAINT unique_post_vote UNIQUE (ip_hash, post_id),
    CONSTRAINT unique_comment_vote UNIQUE (ip_hash, comment_id)
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_expires_at ON public.posts(expires_at);
CREATE INDEX IF NOT EXISTS idx_posts_score ON public.posts((upvotes - downvotes) DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_expires_at ON public.comments(expires_at);

CREATE INDEX IF NOT EXISTS idx_votes_ip_hash ON public.votes(ip_hash);
CREATE INDEX IF NOT EXISTS idx_votes_post_id ON public.votes(post_id);
CREATE INDEX IF NOT EXISTS idx_votes_comment_id ON public.votes(comment_id);
CREATE INDEX IF NOT EXISTS idx_votes_expires_at ON public.votes(expires_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Create policies for posts
CREATE POLICY "Anyone can read non-expired posts" ON public.posts
    FOR SELECT USING (expires_at > timezone('utc'::text, now()));

CREATE POLICY "Anyone can insert posts" ON public.posts
    FOR INSERT WITH CHECK (true);

-- Create policies for comments
CREATE POLICY "Anyone can read non-expired comments" ON public.comments
    FOR SELECT USING (expires_at > timezone('utc'::text, now()));

CREATE POLICY "Anyone can insert comments" ON public.comments
    FOR INSERT WITH CHECK (true);

-- Create policies for votes
CREATE POLICY "Anyone can read votes" ON public.votes
    FOR SELECT USING (expires_at > timezone('utc'::text, now()));

CREATE POLICY "Anyone can insert votes" ON public.votes
    FOR INSERT WITH CHECK (true);

-- Grant necessary permissions
GRANT SELECT, INSERT ON public.posts TO anon;
GRANT SELECT, INSERT ON public.posts TO authenticated;

GRANT SELECT, INSERT ON public.comments TO anon;
GRANT SELECT, INSERT ON public.comments TO authenticated;

GRANT SELECT, INSERT ON public.votes TO anon;
GRANT SELECT, INSERT ON public.votes TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON SEQUENCE public.posts_id_seq TO anon;
GRANT USAGE ON SEQUENCE public.posts_id_seq TO authenticated;

GRANT USAGE ON SEQUENCE public.comments_id_seq TO anon;
GRANT USAGE ON SEQUENCE public.comments_id_seq TO authenticated;

GRANT USAGE ON SEQUENCE public.votes_id_seq TO anon;
GRANT USAGE ON SEQUENCE public.votes_id_seq TO authenticated;

-- Function to update comment count when comments are added/removed
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

-- Create trigger to automatically update comment count
CREATE TRIGGER trigger_update_comment_count
    AFTER INSERT OR DELETE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION update_post_comment_count();

-- Function to update vote counts when votes are added/changed
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

-- Create trigger to automatically update vote counts
CREATE TRIGGER trigger_update_vote_counts
    AFTER INSERT OR DELETE ON public.votes
    FOR EACH ROW EXECUTE FUNCTION update_vote_counts();

-- Function to clean up expired content (to be called by cron job)
CREATE OR REPLACE FUNCTION cleanup_expired_content()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
BEGIN
    -- Delete expired posts (cascades to comments and votes)
    DELETE FROM public.posts WHERE expires_at <= timezone('utc'::text, now());
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Delete any orphaned comments (shouldn't happen due to cascade, but safety)
    DELETE FROM public.comments WHERE expires_at <= timezone('utc'::text, now());
    
    -- Delete any orphaned votes (shouldn't happen due to cascade, but safety)
    DELETE FROM public.votes WHERE expires_at <= timezone('utc'::text, now());
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;