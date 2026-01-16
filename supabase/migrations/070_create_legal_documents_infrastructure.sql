-- Migration: Create legal documents storage bucket and tracking table
-- Description: Sets up infrastructure for storing PDFs of terms acceptance and enrollment contracts

-- Create storage bucket for legal documents (PDFs)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'legal-documents',
  'legal-documents',
  false, -- Private bucket
  10485760, -- 10MB limit
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policy: Service role can read/write (for Edge Functions)
CREATE POLICY "Service role can manage legal documents"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'legal-documents');

-- RLS Policy: Users can read their own legal documents
CREATE POLICY "Users can read own legal documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'legal-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create table to track legal document generation
CREATE TABLE IF NOT EXISTS legal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type TEXT NOT NULL CHECK (document_type IN ('terms_acceptance', 'enrollment_contract')),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  related_id UUID, -- term_acceptance_id or enrollment_id
  storage_path TEXT NOT NULL,
  filename TEXT NOT NULL,
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMPTZ,
  email_error TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_legal_documents_user_id ON legal_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_legal_documents_type ON legal_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_legal_documents_related_id ON legal_documents(related_id);
CREATE INDEX IF NOT EXISTS idx_legal_documents_email_sent ON legal_documents(email_sent) WHERE email_sent = false;

-- RLS Policies for legal_documents table
ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "Service role can manage legal documents table"
ON legal_documents FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Users can view their own legal documents
CREATE POLICY "Users can view own legal documents"
ON legal_documents FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admins can view all legal documents
CREATE POLICY "Admins can view all legal documents"
ON legal_documents FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_legal_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_legal_documents_updated_at
  BEFORE UPDATE ON legal_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_legal_documents_updated_at();

-- Comments
COMMENT ON TABLE legal_documents IS 'Tracks generated legal PDFs (terms acceptance, contracts) and email delivery status';
COMMENT ON COLUMN legal_documents.document_type IS 'Type of legal document: terms_acceptance or enrollment_contract';
COMMENT ON COLUMN legal_documents.related_id IS 'References comprehensive_term_acceptance.id or program_enrollments.id';
COMMENT ON COLUMN legal_documents.storage_path IS 'Full path in storage bucket';
COMMENT ON COLUMN legal_documents.email_sent IS 'Whether the PDF was successfully emailed';
COMMENT ON COLUMN legal_documents.email_error IS 'Error message if email failed';
