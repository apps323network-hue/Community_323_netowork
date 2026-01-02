-- Migration 018: Fix RLS policy for admin updates on profiles
-- Corrige a política RLS para permitir que admins atualizem perfis mesmo com status pending
-- Data: 2024

-- Remover política antiga de UPDATE
DROP POLICY IF EXISTS "Users can update own profile (active or pending only)" ON public.profiles;

-- Criar nova política de UPDATE mais robusta
-- UPDATE: 
-- - Usuário pode atualizar seu próprio perfil apenas se estiver 'active' ou 'pending'
-- - Admin pode atualizar qualquer perfil (mesmo que o admin tenha status='pending')
CREATE POLICY "Users can update own profile or admin can update any"
  ON public.profiles FOR UPDATE
  USING (
    -- Usuário pode atualizar seu próprio perfil se estiver active ou pending
    (auth.uid() = id AND status IN ('active', 'pending'))
    OR
    -- Admin pode atualizar qualquer perfil
    -- Usar EXISTS para evitar problemas com subquery e políticas de SELECT
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  )
  WITH CHECK (
    -- Usuário pode atualizar seu próprio perfil se estiver active ou pending
    (auth.uid() = id AND status IN ('active', 'pending'))
    OR
    -- Admin pode atualizar qualquer perfil
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );



