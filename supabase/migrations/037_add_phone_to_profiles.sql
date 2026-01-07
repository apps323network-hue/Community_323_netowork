-- Migration 037: Add phone field to profiles
-- Adiciona coluna phone na tabela profiles para suporte a SSO com American Dream
-- Data: 2026-01-02

-- ============================================
-- ADICIONAR COLUNA PHONE
-- ============================================
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone TEXT;

-- ============================================
-- COMENTÁRIOS
-- ============================================
COMMENT ON COLUMN public.profiles.phone IS 'Número de telefone do usuário (opcional, usado para sincronização com American Dream)';

