-- Create function to manually refresh vote counts for a post
-- This is needed because the triggers might not be working properly with UUIDs

CREATE OR REPLACE FUNCTION refresh_post_vote_counts(post_id_param UUID)
RETURNS VOID AS $$
DECLARE
    upvote_count INTEGER;
    downvote_count INTEGER;
BEGIN
    -- Count upvotes for this post
    SELECT COUNT(*) INTO upvote_count
    FROM public.votes
    WHERE post_id = post_id_param AND vote_type = 'up';
    
    -- Count downvotes for this post
    SELECT COUNT(*) INTO downvote_count
    FROM public.votes
    WHERE post_id = post_id_param AND vote_type = 'down';
    
    -- Update the post with actual counts
    UPDATE public.posts
    SET upvotes = upvote_count, downvotes = downvote_count
    WHERE id = post_id_param;
    
    -- Log the update for debugging
    RAISE NOTICE 'Updated post % vote counts: % upvotes, % downvotes', post_id_param, upvote_count, downvote_count;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission on the refresh function
GRANT EXECUTE ON FUNCTION refresh_post_vote_counts(UUID) TO anon;
GRANT EXECUTE ON FUNCTION refresh_post_vote_counts(UUID) TO authenticated;

-- Create a function to refresh all post vote counts (for maintenance)
CREATE OR REPLACE FUNCTION refresh_all_post_vote_counts()
RETURNS INTEGER AS $$
DECLARE
    post_record RECORD;
    updated_count INTEGER := 0;
BEGIN
    FOR post_record IN SELECT id FROM public.posts LOOP
        PERFORM refresh_post_vote_counts(post_record.id);
        updated_count := updated_count + 1;
    END LOOP;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission on the refresh all function
GRANT EXECUTE ON FUNCTION refresh_all_post_vote_counts() TO anon;
GRANT EXECUTE ON FUNCTION refresh_all_post_vote_counts() TO authenticated;