-- Migration 016: Update RLS policies for post status system
-- Atualiza as políticas RLS para o sistema de status de posts
-- Data: 2024

-- ============================================
-- REMOVER POLÍTICAS ANTIGAS DE POSTS
-- ============================================
DROP POLICY IF EXISTS "Posts viewable by active users only" ON public.posts;
DROP POLICY IF EXISTS "Active users can create posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;

-- ============================================
-- NOVAS POLÍTICAS RLS PARA POSTS
-- ============================================

-- SELECT:
-- - Apenas posts com status='approved' são visíveis para usuários
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
      -- Usuário ativo pode ver apenas posts aprovados
      (SELECT status FROM public.profiles WHERE id = auth.uid()) = 'active'
      AND status = 'approved'
    )
  );

-- INSERT:
-- - Usuários ativos criam posts com status='pending' automaticamente
-- - Admins podem criar posts com qualquer status
CREATE POLICY "Active users can create posts (pending by default)"
  ON public.posts FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
    OR
    (
      (SELECT status FROM public.profiles WHERE id = auth.uid()) = 'active'
      AND (status = 'pending' OR status IS NULL)  -- Forçar pending se não especificado
    )
  );

-- UPDATE:
-- - Criador pode editar apenas se status='pending'
-- - Admin pode atualizar qualquer post
CREATE POLICY "Users can update own pending posts or admin can update any"
  ON public.posts FOR UPDATE
  USING (
    (auth.uid() = user_id AND status = 'pending')
    OR
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
  )
  WITH CHECK (
    (auth.uid() = user_id AND status = 'pending')
    OR
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
  );

-- DELETE:
-- - Criador pode deletar apenas se status='pending'
-- - Admin pode deletar qualquer post
CREATE POLICY "Users can delete own pending posts or admin can delete any"
  ON public.posts FOR DELETE
  USING (
    (auth.uid() = user_id AND status = 'pending')
    OR
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
  );

