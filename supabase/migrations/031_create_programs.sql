-- Migration: Create Programs Tables
-- Description: Adiciona tabelas para gerenciar programas, matrículas e avaliações da 323 Network

-- Tabela principal de programas
CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_pt TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_pt TEXT NOT NULL,
  description_en TEXT NOT NULL,
  short_description_pt TEXT,
  short_description_en TEXT,
  category TEXT NOT NULL CHECK (category IN ('curso', 'mentoria', 'workshop', 'evento_premium', 'servico_especializado')),
  price_usd DECIMAL(10, 2) NOT NULL,
  price_brl DECIMAL(10, 2),
  
  -- Configurações de matrícula
  max_students INTEGER, -- NULL = ilimitado
  current_students INTEGER DEFAULT 0,
  enrollment_start_date TIMESTAMPTZ,
  enrollment_end_date TIMESTAMPTZ,
  program_start_date TIMESTAMPTZ,
  program_end_date TIMESTAMPTZ,
  
  -- Integração com Google Classroom (se aplicável)
  classroom_enabled BOOLEAN DEFAULT FALSE,
  classroom_course_id TEXT,
  classroom_invite_link TEXT,
  
  -- Mídia
  thumbnail_url TEXT,
  banner_url TEXT,
  
  -- Informações adicionais
  duration_hours INTEGER,
  difficulty_level TEXT CHECK (difficulty_level IN ('iniciante', 'intermediario', 'avancado')),
  instructor_name TEXT,
  instructor_bio TEXT,
  prerequisites_pt TEXT,
  prerequisites_en TEXT,
  
  -- Conteúdo do programa
  curriculum_pt JSONB, -- Array de módulos/aulas
  curriculum_en JSONB,
  
  -- Status e visibilidade
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  featured BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Constraints
  CONSTRAINT valid_enrollment_dates CHECK (
    enrollment_start_date IS NULL OR 
    enrollment_end_date IS NULL OR 
    enrollment_end_date >= enrollment_start_date
  ),
  CONSTRAINT valid_program_dates CHECK (
    program_start_date IS NULL OR 
    program_end_date IS NULL OR 
    program_end_date >= program_start_date
  )
);

-- Tabela de matrículas em programas
CREATE TABLE IF NOT EXISTS program_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Status da matrícula
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  
  -- Informações de pagamento
  payment_id TEXT,
  payment_amount DECIMAL(10, 2),
  payment_currency TEXT,
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method TEXT,
  paid_at TIMESTAMPTZ,
  
  -- Progresso
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  completed_at TIMESTAMPTZ,
  
  -- Classroom
  classroom_added BOOLEAN DEFAULT FALSE,
  classroom_added_at TIMESTAMPTZ,
  
  -- Certificado
  certificate_issued BOOLEAN DEFAULT FALSE,
  certificate_url TEXT,
  certificate_issued_at TIMESTAMPTZ,
  
  -- Metadata
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint: um usuário só pode ter uma matrícula ativa por programa
  UNIQUE(program_id, user_id)
);

-- Tabela de avaliações de programas
CREATE TABLE IF NOT EXISTS program_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  enrollment_id UUID REFERENCES program_enrollments(id) ON DELETE CASCADE,
  
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint: um usuário só pode avaliar uma vez por programa
  UNIQUE(program_id, user_id)
);

-- RLS Policies para programs
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

-- Todos podem ver programas publicados
DROP POLICY IF EXISTS "Public can view published programs" ON programs;
CREATE POLICY "Public can view published programs"
  ON programs FOR SELECT
  TO public
  USING (status = 'published');

-- Apenas admins podem inserir/atualizar/deletar programas
DROP POLICY IF EXISTS "Admins can manage programs" ON programs;
CREATE POLICY "Admins can manage programs"
  ON programs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies para program_enrollments
ALTER TABLE program_enrollments ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver suas próprias matrículas
DROP POLICY IF EXISTS "Users can view their own enrollments" ON program_enrollments;
CREATE POLICY "Users can view their own enrollments"
  ON program_enrollments FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admins podem ver todas as matrículas
DROP POLICY IF EXISTS "Admins can view all enrollments" ON program_enrollments;
CREATE POLICY "Admins can view all enrollments"
  ON program_enrollments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Sistema pode criar matrículas (após pagamento)
DROP POLICY IF EXISTS "Authenticated users can enroll" ON program_enrollments;
CREATE POLICY "Authenticated users can enroll"
  ON program_enrollments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Usuários podem atualizar suas próprias matrículas (progresso)
DROP POLICY IF EXISTS "Users can update their own enrollments" ON program_enrollments;
CREATE POLICY "Users can update their own enrollments"
  ON program_enrollments FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins podem atualizar matrículas
DROP POLICY IF EXISTS "Admins can update enrollments" ON program_enrollments;
CREATE POLICY "Admins can update enrollments"
  ON program_enrollments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies para program_reviews
ALTER TABLE program_reviews ENABLE ROW LEVEL SECURITY;

-- Usuários podem criar avaliações para programas que completaram
DROP POLICY IF EXISTS "Users can create reviews for completed programs" ON program_reviews;
CREATE POLICY "Users can create reviews for completed programs"
  ON program_reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM program_enrollments
      WHERE program_enrollments.id = enrollment_id
      AND program_enrollments.user_id = auth.uid()
      AND program_enrollments.status = 'completed'
    )
  );

-- Todos podem ver avaliações aprovadas
DROP POLICY IF EXISTS "Public can view approved reviews" ON program_reviews;
CREATE POLICY "Public can view approved reviews"
  ON program_reviews FOR SELECT
  TO public
  USING (status = 'approved');

-- Usuários podem ver suas próprias avaliações
DROP POLICY IF EXISTS "Users can view their own reviews" ON program_reviews;
CREATE POLICY "Users can view their own reviews"
  ON program_reviews FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admins podem gerenciar todas as avaliações
DROP POLICY IF EXISTS "Admins can manage all reviews" ON program_reviews;
CREATE POLICY "Admins can manage all reviews"
  ON program_reviews FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_programs_status ON programs(status);
CREATE INDEX IF NOT EXISTS idx_programs_category ON programs(category);
CREATE INDEX IF NOT EXISTS idx_programs_featured ON programs(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_program_enrollments_user ON program_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_program_enrollments_program ON program_enrollments(program_id);
CREATE INDEX IF NOT EXISTS idx_program_enrollments_status ON program_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_program_reviews_program ON program_reviews(program_id);
CREATE INDEX IF NOT EXISTS idx_program_reviews_status ON program_reviews(status);

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_programs_updated_at ON programs;
CREATE TRIGGER update_programs_updated_at
  BEFORE UPDATE ON programs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_program_enrollments_updated_at ON program_enrollments;
CREATE TRIGGER update_program_enrollments_updated_at
  BEFORE UPDATE ON program_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_program_reviews_updated_at ON program_reviews;
CREATE TRIGGER update_program_reviews_updated_at
  BEFORE UPDATE ON program_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
