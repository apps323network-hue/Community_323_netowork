-- Storage bucket setup for program materials (PDFs)
-- Run this via Supabase Dashboard or supabase CLI

-- Create storage bucket for program materials
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'program-materials',
  'program-materials',
  false, -- Private bucket, requires authentication
  10485760, -- 10MB limit per file
  ARRAY['application/pdf']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Storage Policies for program-materials bucket
-- ============================================

-- Policy 1: Professors can upload materials to their assigned programs
CREATE POLICY "professors_upload_materials"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'program-materials'
  AND
  -- Extract program_id from path structure: program-materials/{program_id}/{file}
  (string_to_array(name, '/'))[1]::UUID IN (
    SELECT program_id FROM program_professors
    WHERE professor_id = auth.uid()
  )
);

-- Policy 2: Professors can update/delete materials from their programs
CREATE POLICY "professors_manage_materials"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'program-materials'
  AND
  (string_to_array(name, '/'))[1]::UUID IN (
    SELECT program_id FROM program_professors
    WHERE professor_id = auth.uid()
  )
);

CREATE POLICY "professors_delete_materials"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'program-materials'
  AND
  (string_to_array(name, '/'))[1]::UUID IN (
    SELECT program_id FROM program_professors
    WHERE professor_id = auth.uid()
  )
);

-- Policy 3: Enrolled students can download materials
CREATE POLICY "students_download_materials"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'program-materials'
  AND
  (string_to_array(name, '/'))[1]::UUID IN (
    SELECT program_id FROM program_enrollments
    WHERE user_id = auth.uid()
  )
);

-- Policy 4: Admins have full access
CREATE POLICY "admins_full_access_materials"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'program-materials'
  AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  bucket_id = 'program-materials'
  AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
