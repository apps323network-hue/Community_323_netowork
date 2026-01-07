-- Migration 021: Fix RLS policy for admin post creation
-- Corrige a política RLS para permitir que admins criem posts com qualquer status
-- Data: 2025-01-29

-- Remover a política antiga de INSERT
DROP POLICY IF EXISTS "Active users can create posts (pending by default)" ON public.posts;

-- Recriar a política de INSERT permitindo que admins criem posts com qualquer status
CREATE POLICY "Active users can create posts (pending by default)"
  ON public.posts FOR INSERT
  WITH CHECK (
    -- Admin pode criar posts com qualquer status
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR
    (
      -- Usuários ativos criam posts com status='pending' automaticamente
      (SELECT status FROM public.profiles WHERE id = auth.uid()) = 'active'
      AND (status = 'pending' OR status IS NULL)  -- Forçar pending se não especificado
    )
  );

COMMENT ON POLICY "Active users can create posts (pending by default)" ON public.posts IS 
'Permite que admins criem posts com qualquer status, e usuários ativos criem posts com status pending';



