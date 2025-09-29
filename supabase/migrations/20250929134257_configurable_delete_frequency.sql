-- Make post deletion frequency configurable via environment variable
-- This allows changing the deletion time without code changes

-- Create a function to get the delete frequency from environment variable
-- Defaults to 36 hours if not set
CREATE OR REPLACE FUNCTION get_delete_frequency_hours()
RETURNS INTEGER AS $$
BEGIN
    -- Try to get DELETE_FREQUENCY from environment, default to 36
    RETURN COALESCE(
        NULLIF(current_setting('app.delete_frequency', true), '')::INTEGER,
        36
    );
END;
$$ LANGUAGE plpgsql;

-- Update the posts table default expires_at to use configurable frequency
ALTER TABLE public.posts 
ALTER COLUMN expires_at 
SET DEFAULT (timezone('utc'::text, now()) + (get_delete_frequency_hours() || ' hours')::INTERVAL);

-- Update the comments table default expires_at to use configurable frequency
ALTER TABLE public.comments 
ALTER COLUMN expires_at 
SET DEFAULT (timezone('utc'::text, now()) + (get_delete_frequency_hours() || ' hours')::INTERVAL);

-- Update the votes table default expires_at to use configurable frequency
ALTER TABLE public.votes 
ALTER COLUMN expires_at 
SET DEFAULT (timezone('utc'::text, now()) + (get_delete_frequency_hours() || ' hours')::INTERVAL);

-- Create a function to set the delete frequency (for runtime configuration)
CREATE OR REPLACE FUNCTION set_delete_frequency(hours INTEGER)
RETURNS VOID AS $$
BEGIN
    -- Validate input
    IF hours IS NULL OR hours < 1 OR hours > 168 THEN -- Max 1 week
        RAISE EXCEPTION 'Delete frequency must be between 1 and 168 hours';
    END IF;
    
    -- Set the configuration
    PERFORM set_config('app.delete_frequency', hours::TEXT, false);
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_delete_frequency_hours() TO anon;
GRANT EXECUTE ON FUNCTION get_delete_frequency_hours() TO authenticated;
GRANT EXECUTE ON FUNCTION set_delete_frequency(INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION set_delete_frequency(INTEGER) TO authenticated;

-- Set initial value from environment if available
-- This will be called when the app starts up
DO $$
DECLARE
    env_frequency TEXT;
    frequency_hours INTEGER;
BEGIN
    -- Try to read from environment variable
    env_frequency := current_setting('app.delete_frequency', true);
    
    IF env_frequency IS NOT NULL AND env_frequency != '' THEN
        frequency_hours := env_frequency::INTEGER;
        PERFORM set_delete_frequency(frequency_hours);
        RAISE NOTICE 'Set delete frequency to % hours from environment', frequency_hours;
    ELSE
        RAISE NOTICE 'Using default delete frequency of 36 hours';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not set delete frequency from environment, using default 36 hours';
END;
$$;