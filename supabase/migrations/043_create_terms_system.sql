-- Migration: Create Terms and Privacy Policy Acceptance System
-- Description: Creates tables and functions for managing terms of service and privacy policy acceptance

-- Create application_terms table
CREATE TABLE IF NOT EXISTS application_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  term_type TEXT NOT NULL CHECK (term_type IN ('terms_of_service', 'privacy_policy')),
  version INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_active_term_type UNIQUE (term_type, is_active) DEFERRABLE INITIALLY DEFERRED
);

-- Create comprehensive_term_acceptance table
CREATE TABLE IF NOT EXISTS comprehensive_term_acceptance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  term_id UUID NOT NULL REFERENCES application_terms(id) ON DELETE CASCADE,
  term_type TEXT NOT NULL CHECK (term_type IN ('terms_of_service', 'privacy_policy')),
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  CONSTRAINT unique_user_term_acceptance UNIQUE (user_id, term_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_application_terms_type_active ON application_terms(term_type, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_application_terms_type_version ON application_terms(term_type, version DESC);
CREATE INDEX IF NOT EXISTS idx_term_acceptance_user_id ON comprehensive_term_acceptance(user_id);
CREATE INDEX IF NOT EXISTS idx_term_acceptance_term_id ON comprehensive_term_acceptance(term_id);
CREATE INDEX IF NOT EXISTS idx_term_acceptance_term_type ON comprehensive_term_acceptance(term_type);
CREATE INDEX IF NOT EXISTS idx_term_acceptance_accepted_at ON comprehensive_term_acceptance(accepted_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_application_terms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_update_application_terms_updated_at
  BEFORE UPDATE ON application_terms
  FOR EACH ROW
  EXECUTE FUNCTION update_application_terms_updated_at();

-- Function to check if user has accepted the latest active term
CREATE OR REPLACE FUNCTION check_user_term_acceptance(
  p_user_id UUID,
  p_term_type TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM comprehensive_term_acceptance cta
    JOIN application_terms at ON cta.term_id = at.id
    WHERE cta.user_id = p_user_id
      AND at.term_type = p_term_type
      AND at.is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record term acceptance
CREATE OR REPLACE FUNCTION record_term_acceptance(
  p_user_id UUID,
  p_term_id UUID,
  p_term_type TEXT,
  p_ip_address TEXT,
  p_user_agent TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO comprehensive_term_acceptance (
    user_id, 
    term_id, 
    term_type, 
    ip_address, 
    user_agent, 
    accepted_at
  ) VALUES (
    p_user_id, 
    p_term_id, 
    p_term_type, 
    p_ip_address, 
    p_user_agent, 
    NOW()
  )
  ON CONFLICT (user_id, term_id) DO UPDATE SET
    accepted_at = NOW(),
    ip_address = EXCLUDED.ip_address,
    user_agent = EXCLUDED.user_agent;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get latest active term
CREATE OR REPLACE FUNCTION get_latest_active_term(
  p_term_type TEXT
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  term_type TEXT,
  version INTEGER,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    at.id,
    at.title,
    at.content,
    at.term_type,
    at.version,
    at.is_active,
    at.created_at
  FROM application_terms at
  WHERE at.term_type = p_term_type
    AND at.is_active = true
  ORDER BY at.version DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE application_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE comprehensive_term_acceptance ENABLE ROW LEVEL SECURITY;

-- RLS Policies for application_terms
-- Everyone can read active terms
CREATE POLICY "Anyone can read active terms"
  ON application_terms
  FOR SELECT
  USING (is_active = true);

-- Only admins can manage terms
CREATE POLICY "Admins can manage terms"
  ON application_terms
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- RLS Policies for comprehensive_term_acceptance
-- Users can read their own acceptances
CREATE POLICY "Users can read their own acceptances"
  ON comprehensive_term_acceptance
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own acceptances
CREATE POLICY "Users can insert their own acceptances"
  ON comprehensive_term_acceptance
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Admins can read all acceptances
CREATE POLICY "Admins can read all acceptances"
  ON comprehensive_term_acceptance
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- Grant necessary permissions
GRANT SELECT ON application_terms TO authenticated;
GRANT SELECT, INSERT ON comprehensive_term_acceptance TO authenticated;
GRANT ALL ON application_terms TO authenticated;
GRANT ALL ON comprehensive_term_acceptance TO authenticated;
