-- Migration: Program Notifications System
-- Description: Implements automatic notifications for new lessons, program starting, and program expiring

-- ============================================================================
-- 1. FUNCTION: Notify enrolled students when a new lesson is created
-- ============================================================================
CREATE OR REPLACE FUNCTION notify_students_new_lesson()
RETURNS TRIGGER AS $$
DECLARE
  v_program_title TEXT;
  v_lesson_title TEXT;
  v_student_record RECORD;
BEGIN
  -- Only notify for lessons with valid youtube_video_id
  IF NEW.youtube_video_id IS NOT NULL AND NEW.youtube_video_id != '' THEN
    
    -- Get program title
    SELECT title_pt INTO v_program_title
    FROM programs
    WHERE id = NEW.program_id;
    
    -- Get lesson title (use title_pt or fallback to title_en)
    v_lesson_title := COALESCE(NEW.title_pt, NEW.title_en, 'Nova Aula');
    
    -- Insert notification for each enrolled student
    FOR v_student_record IN
      SELECT DISTINCT user_id
      FROM program_enrollments
      WHERE program_id = NEW.program_id
        AND status = 'active'
        AND payment_status = 'paid'
    LOOP
      INSERT INTO notifications (user_id, type, title, content, metadata)
      VALUES (
        v_student_record.user_id,
        'new_lesson',
        'Nova Aula Disponível', -- Will be translated in frontend
        'Nova aula "' || v_lesson_title || '" disponível em ' || v_program_title,
        jsonb_build_object(
          'program_id', NEW.program_id,
          'program_title', v_program_title,
          'lesson_id', NEW.id,
          'lesson_title', v_lesson_title
        )
      );
    END LOOP;
    
    RAISE NOTICE 'New lesson notifications sent for lesson_id: %, program_id: %', NEW.id, NEW.program_id;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in notify_students_new_lesson: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_notify_new_lesson ON program_lessons;

-- Create trigger for new lessons
CREATE TRIGGER trigger_notify_new_lesson
  AFTER INSERT ON program_lessons
  FOR EACH ROW
  EXECUTE FUNCTION notify_students_new_lesson();

COMMENT ON TRIGGER trigger_notify_new_lesson ON program_lessons IS 
  'Automatically notifies enrolled students when a new lesson with video is added to their program';

COMMENT ON FUNCTION notify_students_new_lesson() IS 
  'Creates in-app notifications for all active students when a new lesson is published';

-- ============================================================================
-- 2. FUNCTION: Notify students when program is starting soon (7 days before)
-- ============================================================================
CREATE OR REPLACE FUNCTION check_programs_starting_soon()
RETURNS void AS $$
DECLARE
  v_program_record RECORD;
  v_student_record RECORD;
  v_days_until_start INTEGER;
BEGIN
  -- Find programs starting in exactly 7 days
  FOR v_program_record IN
    SELECT id, title_pt, program_start_date
    FROM programs
    WHERE program_start_date IS NOT NULL
      AND program_start_date::date = (CURRENT_DATE + INTERVAL '7 days')::date
      AND status = 'published'
  LOOP
    v_days_until_start := 7;
    
    -- Notify each enrolled student
    FOR v_student_record IN
      SELECT DISTINCT user_id
      FROM program_enrollments
      WHERE program_id = v_program_record.id
        AND status = 'active'
        AND payment_status = 'paid'
    LOOP
      -- Check if notification already sent (avoid duplicates)
      IF NOT EXISTS (
        SELECT 1 FROM notifications
        WHERE user_id = v_student_record.user_id
          AND type = 'program_starting'
          AND metadata->>'program_id' = v_program_record.id::text
          AND created_at > CURRENT_DATE - INTERVAL '8 days'
      ) THEN
        INSERT INTO notifications (user_id, type, title, content, metadata)
        VALUES (
          v_student_record.user_id,
          'program_starting',
          'Programa Iniciando em Breve',
          v_program_record.title_pt || ' começa em ' || v_days_until_start || ' dias. Prepare-se!',
          jsonb_build_object(
            'program_id', v_program_record.id,
            'program_title', v_program_record.title_pt,
            'days', v_days_until_start,
            'start_date', v_program_record.program_start_date
          )
        );
      END IF;
    END LOOP;
    
    RAISE NOTICE 'Program starting notifications sent for program_id: %', v_program_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION check_programs_starting_soon() IS 
  'Checks for programs starting in 7 days and notifies enrolled students. Should be called daily via cron job.';

-- ============================================================================
-- 3. FUNCTION: Notify students when program is expiring soon (7 days before)
-- ============================================================================
CREATE OR REPLACE FUNCTION check_programs_expiring_soon()
RETURNS void AS $$
DECLARE
  v_program_record RECORD;
  v_student_record RECORD;
  v_days_until_expiry INTEGER;
BEGIN
  -- Find programs expiring in exactly 7 days
  FOR v_program_record IN
    SELECT id, title_pt, program_end_date
    FROM programs
    WHERE program_end_date IS NOT NULL
      AND program_end_date::date = (CURRENT_DATE + INTERVAL '7 days')::date
      AND status = 'published'
  LOOP
    v_days_until_expiry := 7;
    
    -- Notify each enrolled student
    FOR v_student_record IN
      SELECT DISTINCT user_id
      FROM program_enrollments
      WHERE program_id = v_program_record.id
        AND status = 'active'
        AND payment_status = 'paid'
    LOOP
      -- Check if notification already sent (avoid duplicates)
      IF NOT EXISTS (
        SELECT 1 FROM notifications
        WHERE user_id = v_student_record.user_id
          AND type = 'program_expiring'
          AND metadata->>'program_id' = v_program_record.id::text
          AND created_at > CURRENT_DATE - INTERVAL '8 days'
      ) THEN
        INSERT INTO notifications (user_id, type, title, content, metadata)
        VALUES (
          v_student_record.user_id,
          'program_expiring',
          'Programa Expirando em Breve',
          'Seu acesso a ' || v_program_record.title_pt || ' expira em ' || v_days_until_expiry || ' dias',
          jsonb_build_object(
            'program_id', v_program_record.id,
            'program_title', v_program_record.title_pt,
            'days', v_days_until_expiry,
            'end_date', v_program_record.program_end_date
          )
        );
      END IF;
    END LOOP;
    
    RAISE NOTICE 'Program expiring notifications sent for program_id: %', v_program_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION check_programs_expiring_soon() IS 
  'Checks for programs expiring in 7 days and notifies enrolled students. Should be called daily via cron job.';

-- ============================================================================
-- 4. SETUP: pg_cron extension for scheduled notifications
-- ============================================================================
-- Note: pg_cron needs to be enabled by Supabase support
-- This is a placeholder for when it's available

-- Enable pg_cron extension (requires superuser - done by Supabase)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily check for programs starting soon (runs at 9 AM UTC)
-- SELECT cron.schedule(
--   'check-programs-starting-soon',
--   '0 9 * * *',
--   $$SELECT check_programs_starting_soon();$$
-- );

-- Schedule daily check for programs expiring soon (runs at 9 AM UTC)
-- SELECT cron.schedule(
--   'check-programs-expiring-soon',
--   '0 9 * * *',
--   $$SELECT check_programs_expiring_soon();$$
-- );

-- ============================================================================
-- ALTERNATIVE: Manual trigger for testing (can be called from Edge Function)
-- ============================================================================
COMMENT ON FUNCTION check_programs_starting_soon() IS 
  'USAGE: Can be called manually via SQL or from an Edge Function scheduled daily:
   SELECT check_programs_starting_soon();
   
   Recommended: Set up a daily cron job or Edge Function to call this at 9 AM UTC.';

COMMENT ON FUNCTION check_programs_expiring_soon() IS 
  'USAGE: Can be called manually via SQL or from an Edge Function scheduled daily:
   SELECT check_programs_expiring_soon();
   
   Recommended: Set up a daily cron job or Edge Function to call this at 9 AM UTC.';
