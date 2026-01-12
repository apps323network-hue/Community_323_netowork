-- Migration 056: Service Approval Flow for Premium Users
-- Adds status tracking and owner fields to services.
-- Data: 2026-01-12

-- ============================================
-- 1. ADICIONAR COLUNAS PARA FLUXO DE APROVAÇÃO
-- ============================================

-- Primeiro, garantir que as colunas existam
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_user_service BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Marcar serviços existentes como aprovados (o padrão já é approved para evitar esconder serviços do sistema)
UPDATE public.services SET status = 'approved' WHERE status IS NULL;

-- ============================================
-- 2. ATUALIZAR POLÍTICAS DE RLS
-- ============================================

-- Remover política de SELECT existente
DROP POLICY IF EXISTS "Services are viewable by everyone" ON public.services;

-- Nova política de SELECT: 
-- 1. Qualquer um vê serviços aprovados.
-- 2. O criador vê seus próprios serviços (mesmo pendentes).
-- 3. Admins veem tudo.
CREATE POLICY "Services visibility policy"
  ON public.services FOR SELECT
  USING (
    status = 'approved' 
    OR auth.uid() = created_by 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Política para INSERT:
-- Usuários autenticados podem inserir se for um serviço de usuário e começar como pendente
CREATE POLICY "Users can submit services for approval"
  ON public.services FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND status = 'pending'
    AND is_user_service = true
    AND (auth.uid() = created_by OR created_by IS NULL)
  );

-- Política para UPDATE:
-- Apenas o criador (se ainda pendente) ou Admins
CREATE POLICY "Admins or owners can update services"
  ON public.services FOR UPDATE
  USING (
    auth.uid() = created_by 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() = created_by 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Política para DELETE:
-- Apenas Admins ou Donos (se pendente)
CREATE POLICY "Admins or owners can delete services"
  ON public.services FOR DELETE
  USING (
    auth.uid() = created_by 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- 3. COMENTÁRIOS
-- ============================================
COMMENT ON COLUMN public.services.status IS 'Status do serviço: pending (em análise), approved (visível), rejected (reprovado)';
COMMENT ON COLUMN public.services.is_user_service IS 'Identifica se o serviço foi criado por um usuário premium em vez da plataforma/parceiro direto';
COMMENT ON COLUMN public.services.created_by IS 'Referência ao usuário que criou o serviço';
