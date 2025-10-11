ALTER TABLE public.posts
ADD COLUMN image_url text NULL CHECK (char_length(image_url) <= 2048);