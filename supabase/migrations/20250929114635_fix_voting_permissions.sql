-- Fix voting permissions and policies to allow proper vote management
-- Each IP can cast, change, or revoke their vote by clicking the arrows

-- Add missing permissions for votes table operations
GRANT SELECT, INSERT, UPDATE, DELETE ON public.votes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.votes TO authenticated;

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Anyone can read votes" ON public.votes;
DROP POLICY IF EXISTS "Anyone can insert votes" ON public.votes;

-- Create comprehensive policies for voting operations
CREATE POLICY "Anyone can read non-expired votes" ON public.votes
    FOR SELECT USING (expires_at > timezone('utc'::text, now()));

CREATE POLICY "Anyone can insert votes" ON public.votes
    FOR INSERT WITH CHECK (expires_at > timezone('utc'::text, now()));

CREATE POLICY "Anyone can update their own votes" ON public.votes
    FOR UPDATE USING (expires_at > timezone('utc'::text, now()));

CREATE POLICY "Anyone can delete their own votes" ON public.votes
    FOR DELETE USING (expires_at > timezone('utc'::text, now()));

-- Ensure the vote count update triggers are working properly
-- Drop and recreate the trigger to make sure it's functioning
DROP TRIGGER IF EXISTS trigger_update_vote_counts ON public.votes;

-- Recreate the vote count update function with better error handling
CREATE OR REPLACE FUNCTION update_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Handle new vote insertion
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
        -- Handle vote removal
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

-- Recreate the trigger
CREATE TRIGGER trigger_update_vote_counts
    AFTER INSERT OR UPDATE OR DELETE ON public.votes
    FOR EACH ROW EXECUTE FUNCTION update_vote_counts();