-- Migration: Extended Program Notifications
-- Description: Adds notifications for enrollment confirmation, completion, milestones and certificates

-- Function to handle program enrollment updates
CREATE OR REPLACE FUNCTION notify_program_enrollment_update()
RETURNS TRIGGER AS $$
DECLARE
  v_program_title TEXT;
BEGIN
  -- Get program title
  SELECT title_pt INTO v_program_title
  FROM programs
  WHERE id = NEW.program_id;

  -- 1. Enrollment Confirmed (Payment status changed to paid)
  IF (OLD.payment_status IS NULL OR OLD.payment_status != 'paid') AND NEW.payment_status = 'paid' THEN
    -- Check if notification already exists to avoid duplicates on multiple updates
    IF NOT EXISTS (
      SELECT 1 FROM notifications 
      WHERE user_id = NEW.user_id 
      AND type = 'enrollment_confirmed' 
      AND metadata->>'program_id' = NEW.program_id::text
    ) THEN
      INSERT INTO notifications (user_id, type, title, content, metadata)
      VALUES (
        NEW.user_id,
        'enrollment_confirmed',
        'Inscrição Confirmada',
        'Sua inscrição em ' || COALESCE(v_program_title, 'Programa') || ' foi confirmada. Bem-vindo!',
        jsonb_build_object(
          'program_id', NEW.program_id,
          'program_title', v_program_title
        )
      );
    END IF;
  END IF;

  -- 2. Progress Milestones (25%, 50%, 75%)
  IF (
       (OLD.progress_percentage < 25 AND NEW.progress_percentage >= 25) OR
       (OLD.progress_percentage < 50 AND NEW.progress_percentage >= 50) OR
       (OLD.progress_percentage < 75 AND NEW.progress_percentage >= 75)
     ) AND NEW.progress_percentage < 100 THEN
    
    INSERT INTO notifications (user_id, type, title, content, metadata)
    VALUES (
      NEW.user_id,
      'progress_milestone',
      'Grande Progresso!',
      'Você já completou ' || NEW.progress_percentage || '% de ' || COALESCE(v_program_title, 'Programa') || '. Continue assim!',
      jsonb_build_object(
        'program_id', NEW.program_id,
        'program_title', v_program_title,
        'percentage', NEW.progress_percentage
      )
    );
  END IF;

  -- 3. Program Completed (100% progress)
  IF (OLD.progress_percentage IS NULL OR OLD.progress_percentage < 100) AND NEW.progress_percentage = 100 THEN
    INSERT INTO notifications (user_id, type, title, content, metadata)
    VALUES (
      NEW.user_id,
      'program_completed',
      'Programa Concluído!',
      'Parabéns! Você concluiu o programa ' || COALESCE(v_program_title, 'Programa') || '.',
      jsonb_build_object(
        'program_id', NEW.program_id,
        'program_title', v_program_title
      )
    );
  END IF;

  -- 4. Certificate Issued
  IF (OLD.certificate_issued IS FALSE OR OLD.certificate_issued IS NULL) AND NEW.certificate_issued IS TRUE THEN
    INSERT INTO notifications (user_id, type, title, content, metadata)
    VALUES (
      NEW.user_id,
      'certificate_issued',
      'Certificado Disponível',
      'Seu certificado para ' || COALESCE(v_program_title, 'Programa') || ' já está disponível para download.',
      jsonb_build_object(
        'program_id', NEW.program_id,
        'program_title', v_program_title,
        'certificate_url', NEW.certificate_url
      )
    );
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in notify_program_enrollment_update: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for enrollment updates
DROP TRIGGER IF EXISTS trigger_notify_enrollment_update ON program_enrollments;
CREATE TRIGGER trigger_notify_enrollment_update
  AFTER UPDATE ON program_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION notify_program_enrollment_update();
