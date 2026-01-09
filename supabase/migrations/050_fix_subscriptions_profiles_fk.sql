-- Add foreign key relationship between subscriptions and profiles to enable PostgREST embedding
-- This allows queries like select('*, profile:profiles(nome)') to work

DO $$ 
BEGIN
  -- Check if constraint exists, if not, add it
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'subscriptions_user_id_fkey_profiles' 
    AND table_name = 'subscriptions'
  ) THEN
    ALTER TABLE public.subscriptions
    ADD CONSTRAINT subscriptions_user_id_fkey_profiles
    FOREIGN KEY (user_id)
    REFERENCES public.profiles(id)
    ON DELETE CASCADE;
  END IF;
END $$;
