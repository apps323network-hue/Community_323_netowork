-- Migration to add nationality and privacy fields to profiles table

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS nacionalidade TEXT,
ADD COLUMN IF NOT EXISTS show_whatsapp BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS show_email BOOLEAN DEFAULT FALSE;

-- Update RLS policies might be needed if strictly defined, but usually 'update own profile' covers all columns.
-- Checking RLS is good practice but for now we assume standard RLS "update own" applies.

COMMENT ON COLUMN profiles.nacionalidade IS 'User nationality';
COMMENT ON COLUMN profiles.show_whatsapp IS 'Flag to control visibility of WhatsApp number to other members';
COMMENT ON COLUMN profiles.show_email IS 'Flag to control visibility of Email to other members';
