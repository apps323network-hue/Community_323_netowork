-- Migration to add state column to profiles table

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS estado TEXT;

COMMENT ON COLUMN profiles.estado IS 'User state/province';
