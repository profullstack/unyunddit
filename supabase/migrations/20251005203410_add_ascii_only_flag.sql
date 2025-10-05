-- Add ascii_only flag to posts table
ALTER TABLE posts
ADD COLUMN ascii_only BOOLEAN DEFAULT false NOT NULL;

-- Add ascii_only flag to comments table
ALTER TABLE comments
ADD COLUMN ascii_only BOOLEAN DEFAULT false NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN posts.ascii_only IS 'When true, content should be displayed as ASCII-only (non-ASCII characters stripped)';
COMMENT ON COLUMN comments.ascii_only IS 'When true, content should be displayed as ASCII-only (non-ASCII characters stripped)';