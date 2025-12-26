-- Migration 013: Update RLS policies for user status system
-- Atualiza as políticas RLS para o sistema de status de usuários
-- Data: 2024

-- ============================================
-- REMOVER POLÍTICAS ANTIGAS DE PROFILES
-- ============================================
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- ============================================
-- NOVAS POLÍTICAS RLS PARA PROFILES
-- ============================================

-- SELECT: 
-- - Usuários com status 'active' podem ver outros usuários 'active'
-- - Usuários com status 'pending' podem ver apenas seu próprio perfil
-- - Admins podem ver todos os perfis
-- - Usuários suspensos/banidos não podem ver perfis (exceto próprio)
CREATE POLICY "Profiles viewable based on status"
  ON public.profiles FOR SELECT
  USING (
    -- Admin pode ver todos
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
    OR
    -- Usuário pode ver seu próprio perfil
    auth.uid() = id
    OR
    (
      -- Usuário ativo pode ver outros usuários ativos
      (SELECT status FROM public.profiles WHERE id = auth.uid()) = 'active'
      AND status = 'active'
    )
  );

-- UPDATE: 
-- - Usuário pode atualizar seu próprio perfil apenas se estiver 'active' ou 'pending'
-- - Admin pode atualizar qualquer perfil
CREATE POLICY "Users can update own profile (active or pending only)"
  ON public.profiles FOR UPDATE
  USING (
    (auth.uid() = id AND status IN ('active', 'pending'))
    OR
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
  )
  WITH CHECK (
    (auth.uid() = id AND status IN ('active', 'pending'))
    OR
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
  );

-- ============================================
-- REMOVER POLÍTICAS ANTIGAS DE POSTS
-- ============================================
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.posts;

-- ============================================
-- NOVAS POLÍTICAS RLS PARA POSTS
-- ============================================

-- SELECT:
-- - Apenas usuários 'active' podem ver posts (exceto próprio se pending)
-- - Criador pode ver seu próprio post mesmo se 'pending'
-- - Admins podem ver todos os posts
CREATE POLICY "Posts viewable by active users only"
  ON public.posts FOR SELECT
  USING (
    -- Admin pode ver todos
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
    OR
    -- Criador pode ver seu próprio post
    auth.uid() = user_id
    OR
    (
      -- Usuário ativo pode ver posts
      (SELECT status FROM public.profiles WHERE id = auth.uid()) = 'active'
    )
  );

-- INSERT:
-- - Apenas usuários 'active' podem criar posts
-- - Admins podem criar posts
CREATE POLICY "Active users can create posts"
  ON public.posts FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
    OR
    (SELECT status FROM public.profiles WHERE id = auth.uid()) = 'active'
  );

-- UPDATE e DELETE mantêm as políticas existentes (apenas autor ou admin)

-- ============================================
-- ATUALIZAR POLÍTICAS DE EVENTS
-- ============================================

-- A política de SELECT já foi atualizada na migration 010
-- Mas vamos garantir que apenas usuários 'active' vejam eventos aprovados
-- (A política atual já permite isso, mas vamos adicionar verificação explícita)

-- A política de INSERT já força status='pending', mas vamos garantir que apenas 'active' criem
DROP POLICY IF EXISTS "Authenticated users can create events" ON public.events;

CREATE POLICY "Active users can create events"
  ON public.events FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
    OR
    (
      (SELECT status FROM public.profiles WHERE id = auth.uid()) = 'active'
      AND status = 'pending'
    )
  );

-- ============================================
-- POLÍTICAS PARA POST_LIKES E POST_COMMENTS
-- ============================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Authenticated users can like posts" ON public.post_likes;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.post_comments;

-- INSERT para post_likes: apenas usuários 'active'
CREATE POLICY "Active users can like posts"
  ON public.post_likes FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
    OR
    (SELECT status FROM public.profiles WHERE id = auth.uid()) = 'active'
  );

-- INSERT para post_comments: apenas usuários 'active'
CREATE POLICY "Active users can create comments"
  ON public.post_comments FOR INSERT
  WITH CHECK (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
    OR
    (SELECT status FROM public.profiles WHERE id = auth.uid()) = 'active'
  );

