-- Migration: Add YouTube-based Learning Platform Structure
-- Creates tables for program modules, lessons, materials, and professor assignments
-- Supports 3-level structure: Program → Module → Lesson

-- ============================================
-- 1. Add professor role to profiles
-- ============================================
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' 
CHECK (role IN ('user', 'professor', 'admin'));

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- ============================================
-- 2. Program Modules Table
-- ============================================
CREATE TABLE IF NOT EXISTS program_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE NOT NULL,
  title_pt TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_pt TEXT,
  description_en TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_program_modules_program_id ON program_modules(program_id);
CREATE INDEX IF NOT EXISTS idx_program_modules_order ON program_modules(program_id, order_index);

-- ============================================
-- 3. Program Lessons Table (YouTube Videos)
-- ============================================
CREATE TABLE IF NOT EXISTS program_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES program_modules(id) ON DELETE CASCADE NOT NULL,
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE NOT NULL,
  title_pt TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_pt TEXT,
  description_en TEXT,
  youtube_video_id TEXT NOT NULL, -- YouTube video ID (e.g., "dQw4w9WgXcQ")
  youtube_thumbnail_url TEXT, -- Cached from YouTube Data API
  duration_seconds INTEGER, -- Cached from YouTube Data API
  order_index INTEGER NOT NULL,
  is_preview BOOLEAN DEFAULT false, -- Allow non-enrolled users to preview
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_program_lessons_module_id ON program_lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_program_lessons_program_id ON program_lessons(program_id);
CREATE INDEX IF NOT EXISTS idx_program_lessons_order ON program_lessons(module_id, order_index);

-- ============================================
-- 4. Program Materials Table (PDFs)
-- ============================================
CREATE TABLE IF NOT EXISTS program_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES program_lessons(id) ON DELETE CASCADE,
  module_id UUID REFERENCES program_modules(id) ON DELETE CASCADE,
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE NOT NULL,
  title_pt TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_pt TEXT,
  description_en TEXT,
  file_path TEXT NOT NULL, -- Path in Supabase Storage
  file_size_bytes INTEGER,
  file_type TEXT DEFAULT 'pdf',
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_program_materials_lesson_id ON program_materials(lesson_id);
CREATE INDEX IF NOT EXISTS idx_program_materials_module_id ON program_materials(module_id);
CREATE INDEX IF NOT EXISTS idx_program_materials_program_id ON program_materials(program_id);

-- ============================================
-- 5. Program Professors Table
-- ============================================
CREATE TABLE IF NOT EXISTS program_professors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE NOT NULL,
  professor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(program_id) -- Only one professor per program for now
);

CREATE INDEX IF NOT EXISTS idx_program_professors_program_id ON program_professors(program_id);
CREATE INDEX IF NOT EXISTS idx_program_professors_professor_id ON program_professors(professor_id);

-- ============================================
-- 6. Row Level Security Policies
-- ============================================

-- Enable RLS on all new tables
ALTER TABLE program_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_professors ENABLE ROW LEVEL SECURITY;

-- --- MODULES POLICIES ---

-- View: Enrolled students OR assigned professor OR admin
CREATE POLICY "modules_select_enrolled_or_professor"
ON program_modules FOR SELECT
TO authenticated
USING (
  -- Enrolled students
  EXISTS (
    SELECT 1 FROM program_enrollments 
    WHERE program_enrollments.program_id = program_modules.program_id 
    AND program_enrollments.user_id = auth.uid()
  )
  OR
  -- Assigned professor
  EXISTS (
    SELECT 1 FROM program_professors
    WHERE program_professors.program_id = program_modules.program_id
    AND program_professors.professor_id = auth.uid()
  )
  OR
  -- Admin
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Insert/Update/Delete: Only assigned professor or admin
CREATE POLICY "modules_modify_professor_or_admin"
ON program_modules FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM program_professors
    WHERE program_professors.program_id = program_modules.program_id
    AND program_professors.professor_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM program_professors
    WHERE program_professors.program_id = program_modules.program_id
    AND program_professors.professor_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- --- LESSONS POLICIES ---

-- View: Preview lessons (anyone) OR enrolled students OR professor OR admin
CREATE POLICY "lessons_select_public_or_enrolled"
ON program_lessons FOR SELECT
TO authenticated
USING (
  -- Preview lessons
  is_preview = true
  OR
  -- Enrolled students
  EXISTS (
    SELECT 1 FROM program_enrollments 
    WHERE program_enrollments.program_id = program_lessons.program_id 
    AND program_enrollments.user_id = auth.uid()
  )
  OR
  -- Assigned professor
  EXISTS (
    SELECT 1 FROM program_professors
    WHERE program_professors.program_id = program_lessons.program_id
    AND program_professors.professor_id = auth.uid()
  )
  OR
  -- Admin
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Insert/Update/Delete: Only assigned professor or admin
CREATE POLICY "lessons_modify_professor_or_admin"
ON program_lessons FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM program_professors
    WHERE program_professors.program_id = program_lessons.program_id
    AND program_professors.professor_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM program_professors
    WHERE program_professors.program_id = program_lessons.program_id
    AND program_professors.professor_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- --- MATERIALS POLICIES ---

-- View: Enrolled students OR professor OR admin
CREATE POLICY "materials_select_enrolled_or_professor"
ON program_materials FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM program_enrollments 
    WHERE program_enrollments.program_id = program_materials.program_id 
    AND program_enrollments.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM program_professors
    WHERE program_professors.program_id = program_materials.program_id
    AND program_professors.professor_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Insert/Update/Delete: Only professor or admin
CREATE POLICY "materials_modify_professor_or_admin"
ON program_materials FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM program_professors
    WHERE program_professors.program_id = program_materials.program_id
    AND program_professors.professor_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM program_professors
    WHERE program_professors.program_id = program_materials.program_id
    AND program_professors.professor_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- --- PROFESSORS POLICIES ---

-- View: Anyone can see who is the professor
CREATE POLICY "professors_select_public"
ON program_professors FOR SELECT
TO authenticated
USING (true);

-- Insert/Update/Delete: Only admin
CREATE POLICY "professors_modify_admin_only"
ON program_professors FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- ============================================
-- 7. Functions and Triggers
-- ============================================

-- UpdatedAt Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to modules
DROP TRIGGER IF EXISTS update_program_modules_updated_at ON program_modules;
CREATE TRIGGER update_program_modules_updated_at
  BEFORE UPDATE ON program_modules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply to lessons
DROP TRIGGER IF EXISTS update_program_lessons_updated_at ON program_lessons;
CREATE TRIGGER update_program_lessons_updated_at
  BEFORE UPDATE ON program_lessons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
