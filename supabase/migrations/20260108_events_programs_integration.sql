-- Migration: Events-Programs Integration
-- Description: Links events to programs, adds approval workflow, and points tracking
-- Created: 2026-01-08

-- ============================================
-- 1. ADD COLUMNS TO EVENTS TABLE
-- ============================================

-- Add program relationship and approval workflow
ALTER TABLE public.events
  ADD COLUMN program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  ADD COLUMN status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN reviewed_by UUID REFERENCES auth.users(id),
  ADD COLUMN reviewed_at TIMESTAMPTZ,
  ADD COLUMN rejection_reason TEXT;

-- ============================================
-- 2. CREATE EVENT POINTS TRACKING TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.event_points_awarded (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  points_awarded INTEGER NOT NULL,
  awarded_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- ============================================
-- 3. ADD INDEXES
-- ============================================

CREATE INDEX idx_events_program_id ON events(program_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_event_points_user ON event_points_awarded(user_id);
CREATE INDEX idx_event_points_event ON event_points_awarded(event_id);

-- ============================================
-- 4. UPDATE RLS POLICIES FOR EVENTS
-- ============================================

-- Remove old policies
DROP POLICY IF EXISTS "Anyone can view events" ON events;
DROP POLICY IF EXISTS "Authenticated can create events" ON events;

-- Only approved events are public
CREATE POLICY "Public can view approved events"
  ON events FOR SELECT
  TO public
  USING (status = 'approved');

-- Users can create events for programs they're enrolled in
CREATE POLICY "Enrolled users can create events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM program_enrollments
      WHERE program_enrollments.program_id = events.program_id
      AND program_enrollments.user_id = auth.uid()
      AND program_enrollments.status = 'active'
    )
  );

-- Users can view their own pending events
CREATE POLICY "Users can view their own events"
  ON events FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

-- Admins can manage all events
CREATE POLICY "Admins can manage events"
  ON events FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- 5. RLS FOR EVENT POINTS
-- ============================================

ALTER TABLE event_points_awarded ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own points"
  ON event_points_awarded FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can award points"
  ON event_points_awarded FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- 6. VALIDATION TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION validate_event_program_dates()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if program is still active
  IF EXISTS (
    SELECT 1 FROM programs
    WHERE id = NEW.program_id
    AND (
      program_end_date IS NULL OR
      program_end_date >= NOW()
    )
  ) THEN
    RETURN NEW;
  ELSE
    RAISE EXCEPTION 'Cannot create events for expired programs';
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_event_program
  BEFORE INSERT ON events
  FOR EACH ROW
  EXECUTE FUNCTION validate_event_program_dates();

-- ============================================
-- 7. DATA MIGRATION - DELETE EXISTING EVENTS
-- ============================================

-- Backup existing events (optional)
CREATE TABLE IF NOT EXISTS events_backup AS 
SELECT * FROM events;

-- Delete all existing events
DELETE FROM event_confirmations;
DELETE FROM events;

-- ============================================
-- 8. MAKE PROGRAM_ID REQUIRED
-- ============================================

ALTER TABLE events 
  ALTER COLUMN program_id SET NOT NULL;
