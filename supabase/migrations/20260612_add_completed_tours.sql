-- Add completed_tours column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS completed_tours TEXT[] DEFAULT '{}';

-- Add comment
COMMENT ON COLUMN profiles.completed_tours IS 'Array of tour IDs that the user has completed';
