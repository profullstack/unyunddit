-- Completely remove IP tracking and make browser fingerprinting the primary method
-- This ensures Tor users and clearnet users are treated equally

-- Make ip_hash nullable (remove NOT NULL constraint if it exists)
ALTER TABLE votes ALTER COLUMN ip_hash DROP NOT NULL;

-- Make author_ip nullable (remove NOT NULL constraint if it exists)
ALTER TABLE comments ALTER COLUMN author_ip DROP NOT NULL;

-- Make browser_fingerprint NOT NULL (this is now the primary tracking method)
ALTER TABLE votes ALTER COLUMN browser_fingerprint SET NOT NULL;
ALTER TABLE comments ALTER COLUMN browser_fingerprint SET NOT NULL;

-- Update any existing votes that don't have browser_fingerprint
UPDATE votes 
SET browser_fingerprint = 'migrated_' || COALESCE(ip_hash, 'unknown_' || id::text)
WHERE browser_fingerprint IS NULL;

-- Update any existing comments that don't have browser_fingerprint  
UPDATE comments 
SET browser_fingerprint = 'migrated_' || COALESCE(encode(sha256(COALESCE(author_ip, '127.0.0.1')::bytea), 'hex'), 'unknown_' || id::text)
WHERE browser_fingerprint IS NULL;

-- Drop the old indexes on ip_hash since we're not using it anymore
DROP INDEX IF EXISTS idx_votes_ip_hash;

-- Create new indexes optimized for browser fingerprinting
CREATE INDEX IF NOT EXISTS idx_votes_browser_fingerprint_post ON votes(browser_fingerprint, post_id);
CREATE INDEX IF NOT EXISTS idx_comments_browser_fingerprint_post ON comments(browser_fingerprint, post_id);

-- Add comments explaining the new system
COMMENT ON COLUMN votes.browser_fingerprint IS 'Browser fingerprint hash for anonymous voting - works for both clearnet and Tor users';
COMMENT ON COLUMN comments.browser_fingerprint IS 'Browser fingerprint hash for anonymous commenting - works for both clearnet and Tor users';
COMMENT ON COLUMN votes.ip_hash IS 'DEPRECATED: Legacy IP hash, kept for historical data only';
COMMENT ON COLUMN comments.author_ip IS 'DEPRECATED: Legacy IP address, kept for historical data only';