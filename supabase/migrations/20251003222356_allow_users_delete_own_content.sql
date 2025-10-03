-- Allow users to delete their own content, and admins to delete anything
-- This replaces the admin-only delete policies with more flexible ones

-- Drop the admin-only DELETE policies
DROP POLICY IF EXISTS "Only admins can delete posts" ON public.posts;
DROP POLICY IF EXISTS "Only admins can delete comments" ON public.comments;

-- Create new DELETE policy for posts: users can delete their own posts OR admins can delete any post
CREATE POLICY "Users can delete own posts or admins can delete any" ON public.posts
    FOR DELETE USING (
        user_id = auth.uid() 
        OR EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.is_admin = true
        )
    );

-- Create new DELETE policy for comments: users can delete their own comments OR admins can delete any comment
CREATE POLICY "Users can delete own comments or admins can delete any" ON public.comments
    FOR DELETE USING (
        user_id = auth.uid() 
        OR EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.is_admin = true
        )
    );