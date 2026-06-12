-- Remove default value for cookie_preferences
-- Users must explicitly accept cookies
ALTER TABLE profiles
ALTER COLUMN cookie_preferences DROP DEFAULT;

-- Set existing values to NULL so users are prompted to accept
UPDATE profiles
SET cookie_preferences = NULL
WHERE cookie_preferences = '{"essential": true, "functional": false, "analytics": false}'::jsonb;
