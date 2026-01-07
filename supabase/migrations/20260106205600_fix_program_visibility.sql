-- Update Program Modules Policy to allow all authenticated users to view structure
DROP POLICY IF EXISTS "modules_select_enrolled_or_professor" ON program_modules;
CREATE POLICY "modules_select_authenticated" 
ON program_modules FOR SELECT 
TO authenticated 
USING (true);

-- Update Program Lessons Policy to allow all authenticated users to view structure
DROP POLICY IF EXISTS "lessons_select_public_or_enrolled" ON program_lessons;
CREATE POLICY "lessons_select_authenticated" 
ON program_lessons FOR SELECT 
TO authenticated 
USING (true);
