-- Create basic comments table structure (will be enhanced by fix migration)
CREATE TABLE IF NOT EXISTS comments (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    parent_id BIGINT REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (length(content) > 0 AND length(content) <= 10000),
    author_ip INET NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Basic constraint
    CONSTRAINT comments_content_not_empty CHECK (length(trim(content)) > 0)
);

-- Create basic indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_parent ON comments(post_id, parent_id);

-- Enable RLS (Row Level Security)
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Basic RLS policy for reading comments (will be replaced by fix migration)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'Anyone can read comments basic') THEN
        EXECUTE 'CREATE POLICY "Anyone can read comments basic" ON comments FOR SELECT USING (true)';
    END IF;
END $$;

-- Basic RLS policy for inserting comments (will be replaced by fix migration)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'Anyone can insert comments basic') THEN
        EXECUTE 'CREATE POLICY "Anyone can insert comments basic" ON comments FOR INSERT WITH CHECK (length(trim(content)) > 0 AND length(content) <= 10000)';
    END IF;
END $$;

-- Add comment count to posts (denormalized for performance)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;