
-- Add username column to profiles
ALTER TABLE public.profiles ADD COLUMN username text UNIQUE;

-- Create index for fast username lookups
CREATE INDEX idx_profiles_username ON public.profiles (username);

-- Create a trigger to validate username format
CREATE OR REPLACE FUNCTION public.validate_username()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.username IS NOT NULL THEN
    -- Must be 3-30 chars, lowercase letters, numbers, underscores only
    IF NEW.username !~ '^[a-z0-9_]{3,30}$' THEN
      RAISE EXCEPTION 'Username must be 3-30 characters, lowercase letters, numbers, and underscores only';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_username_trigger
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.validate_username();
