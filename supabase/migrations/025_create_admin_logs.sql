-- Migration 025: Create Admin Logs Table for Audit System
-- Sistema de Auditoria e Logs (Fase 2)
-- Data: 2024

-- ============================================
-- 1. TABELA ADMIN_LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,           -- 'ban_user', 'approve_post', 'create_event', etc.
  target_id UUID,                 -- ID do recurso alvo (user, post, event, etc.)
  target_type TEXT,               -- 'user', 'post', 'event', 'service', 'report', 'challenge', 'banned_word'
  details JSONB DEFAULT '{}',     -- Dados extras: motivo, status anterior, dados do recurso, etc.
  ip_address TEXT,                -- IP do admin que realizou a ação
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. ÍNDICES PARA PERFORMANCE
-- ============================================
-- Índice para buscar logs por admin (quem executou a ação)
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON public.admin_logs(admin_id);

-- Índice para buscar logs por target (ações sofridas por um recurso específico)
CREATE INDEX IF NOT EXISTS idx_admin_logs_target_id ON public.admin_logs(target_id);

-- Índice para filtrar por tipo de recurso
CREATE INDEX IF NOT EXISTS idx_admin_logs_target_type ON public.admin_logs(target_type);

-- Índice para ordenação por data
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON public.admin_logs(created_at DESC);

-- Índice composto para buscar histórico de um usuário específico
CREATE INDEX IF NOT EXISTS idx_admin_logs_target_user ON public.admin_logs(target_id, target_type) 
  WHERE target_type = 'user';

-- ============================================
-- 3. RLS POLICIES
-- ============================================
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem inserir logs
CREATE POLICY "Admins can insert logs"
  ON public.admin_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Apenas admins podem visualizar logs
CREATE POLICY "Admins can view logs"
  ON public.admin_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Logs não podem ser atualizados ou deletados (imutabilidade para auditoria)
-- Não criamos políticas de UPDATE ou DELETE propositalmente
