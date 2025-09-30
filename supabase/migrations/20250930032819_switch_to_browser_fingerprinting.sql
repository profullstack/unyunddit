-- Switch from IP-based tracking to browser fingerprinting
-- This allows both clearnet and Tor users to vote uniquely

-- Add browser_fingerprint column to votes table
ALTER TABLE votes ADD COLUMN browser_fingerprint TEXT;

-- Add browser_fingerprint column to comments table  
ALTER TABLE comments ADD COLUMN browser_fingerprint TEXT;

-- Create index on browser_fingerprint for performance
CREATE INDEX idx_votes_browser_fingerprint ON votes(browser_fingerprint);
CREATE INDEX idx_comments_browser_fingerprint ON comments(browser_fingerprint);

-- Create index on votes for post_id + browser_fingerprint (for duplicate vote checking)
CREATE INDEX idx_votes_post_fingerprint ON votes(post_id, browser_fingerprint);

-- Update existing votes to use a fingerprint based on ip_hash (for migration)
-- This preserves existing vote data while transitioning to the new system
UPDATE votes SET browser_fingerprint = 'legacy_' || ip_hash WHERE browser_fingerprint IS NULL;

-- Update existing comments to use a fingerprint based on author_ip (for migration)
-- This preserves existing comment data while transitioning to the new system
UPDATE comments SET browser_fingerprint = 'legacy_' || encode(sha256(author_ip::bytea), 'hex') WHERE browser_fingerprint IS NULL;

-- Make browser_fingerprint NOT NULL after migration
ALTER TABLE votes ALTER COLUMN browser_fingerprint SET NOT NULL;
ALTER TABLE comments ALTER COLUMN browser_fingerprint SET NOT NULL;

-- Add comment explaining the change
COMMENT ON COLUMN votes.browser_fingerprint IS 'Browser fingerprint hash for anonymous voting (works for both clearnet and Tor users)';
COMMENT ON COLUMN comments.browser_fingerprint IS 'Browser fingerprint hash for anonymous commenting (works for both clearnet and Tor users)';

-- Note: We keep ip_hash and author_ip columns for now for backward compatibility
-- They can be removed in a future migration once the fingerprinting system is stable