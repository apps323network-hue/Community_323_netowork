-- Migration: Create database triggers for automatic PDF generation
-- Description: Triggers to call generate-legal-pdf Edge Function after terms acceptance and enrollment payment

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Function to handle terms acceptance PDF generation
CREATE OR REPLACE FUNCTION handle_terms_acceptance_pdf()
RETURNS TRIGGER AS $$
DECLARE
  supabase_url TEXT;
  service_key TEXT;
BEGIN
  -- Get Supabase URL from app settings or environment
  supabase_url := current_setting('app.supabase_url', true);
  
  IF supabase_url IS NULL THEN
    -- Fallback to constructing from current database
    supabase_url := 'https://' || split_part(current_setting('listen_addresses'), '.', 1) || '.supabase.co';
  END IF;

  -- Call Edge Function asynchronously using pg_net
  PERFORM net.http_post(
    url := supabase_url || '/functions/v1/generate-legal-pdf',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.supabase_service_key', true)
    ),
    body := jsonb_build_object(
      'type', 'terms_acceptance',
      'acceptance_id', NEW.id,
      'user_id', NEW.user_id,
      'term_id', NEW.term_id
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle enrollment contract PDF generation
CREATE OR REPLACE FUNCTION handle_enrollment_contract_pdf()
RETURNS TRIGGER AS $$
DECLARE
  supabase_url TEXT;
BEGIN
  -- Only trigger when payment status changes to 'paid'
  IF NEW.payment_status = 'paid' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'paid') THEN
    
    -- Get Supabase URL
    supabase_url := current_setting('app.supabase_url', true);
    
    IF supabase_url IS NULL THEN
      supabase_url := 'https://' || split_part(current_setting('listen_addresses'), '.', 1) || '.supabase.co';
    END IF;

    -- Call Edge Function asynchronously
    PERFORM net.http_post(
      url := supabase_url || '/functions/v1/generate-legal-pdf',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.supabase_service_key', true)
      ),
      body := jsonb_build_object(
        'type', 'enrollment_contract',
        'enrollment_id', NEW.id,
        'user_id', NEW.user_id
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_terms_acceptance_pdf ON comprehensive_term_acceptance;
CREATE TRIGGER trigger_terms_acceptance_pdf
  AFTER INSERT ON comprehensive_term_acceptance
  FOR EACH ROW
  EXECUTE FUNCTION handle_terms_acceptance_pdf();

DROP TRIGGER IF EXISTS trigger_enrollment_contract_pdf ON program_enrollments;
CREATE TRIGGER trigger_enrollment_contract_pdf
  AFTER INSERT OR UPDATE ON program_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION handle_enrollment_contract_pdf();

-- Comments
COMMENT ON FUNCTION handle_terms_acceptance_pdf() IS 'Triggers PDF generation when a user accepts terms';
COMMENT ON FUNCTION handle_enrollment_contract_pdf() IS 'Triggers contract PDF generation when enrollment payment is confirmed';
