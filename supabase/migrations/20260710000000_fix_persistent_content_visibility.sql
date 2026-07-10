-- Fix persistent authenticated content visibility for custom cookie auth.
-- The app does not use Supabase Auth, so auth.uid() is always null for the
-- anon-key server client. Authenticated posts/comments already store user_id
-- and cleanup preserves them; these policies make that preserved content
-- readable after expires_at passes.

DROP POLICY IF EXISTS "Anyone can read non-expired posts or own posts" ON public.posts;
DROP POLICY IF EXISTS "Anyone can read non-expired comments or own comments" ON public.comments;

CREATE POLICY "Anyone can read active anonymous or persistent user posts" ON public.posts
    FOR SELECT USING (
        expires_at > timezone('utc'::text, now())
        OR user_id IS NOT NULL
    );

CREATE POLICY "Anyone can read active anonymous or persistent user comments" ON public.comments
    FOR SELECT USING (
        expires_at > timezone('utc'::text, now())
        OR user_id IS NOT NULL
    );
