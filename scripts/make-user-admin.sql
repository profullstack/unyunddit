-- Script to make a user an admin
-- Replace 'YOUR_USERNAME' with your actual username

UPDATE public.users 
SET is_admin = true 
WHERE username = 'YOUR_USERNAME';

-- Verify the change
SELECT username, is_admin, created_at 
FROM public.users 
WHERE username = 'YOUR_USERNAME';