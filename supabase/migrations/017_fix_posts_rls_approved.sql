-- Migration 017: Fix RLS policy to allow all authenticated users to see approved posts
-- Corrige a política RLS para permitir que todos os usuários autenticados vejam posts aprovados
-- Data: 2024

-- Remover política antiga
DROP POLICY IF EXISTS "Posts viewable based on status" ON public.posts;

-- Criar nova política mais permissiva
-- SELECT:
-- - Apenas posts com status='approved' são visíveis para usuários autenticados
-- - Criador pode ver seu próprio post mesmo se 'pending' ou 'hidden'
-- - Admins podem ver todos os posts
-- - Posts 'removed' não são visíveis para ninguém (exceto admin)
CREATE POLICY "Posts viewable based on status"
  ON public.posts FOR SELECT
  USING (
    -- Admin pode ver todos
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
    OR
    (
      -- Criador pode ver seu próprio post mesmo se pending/hidden
      auth.uid() = user_id
      AND status IN ('pending', 'hidden', 'approved')
    )
    OR
    (
      -- Qualquer usuário autenticado pode ver posts aprovados
      -- Não requer status='active' no perfil, apenas estar autenticado
      auth.uid() IS NOT NULL
      AND status = 'approved'
    )
  );


