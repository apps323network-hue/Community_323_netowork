-- Migration 027: Post Bookmarks
-- Cria tabela para armazenar bookmarks de posts (posts salvos)
-- Data: 2025

-- ============================================
-- POST BOOKMARKS
-- ============================================
CREATE TABLE IF NOT EXISTS public.post_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_post_bookmarks_user_id ON public.post_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_post_bookmarks_post_id ON public.post_bookmarks(post_id);

-- Habilitar RLS
ALTER TABLE public.post_bookmarks ENABLE ROW LEVEL SECURITY;

-- SELECT: Usuário pode ver seus próprios bookmarks
CREATE POLICY "Users can view own post bookmarks"
  ON public.post_bookmarks FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Usuários autenticados podem criar bookmarks
CREATE POLICY "Authenticated users can create post bookmarks"
  ON public.post_bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Usuário pode remover seus próprios bookmarks
CREATE POLICY "Users can delete own post bookmarks"
  ON public.post_bookmarks FOR DELETE
  USING (auth.uid() = user_id);

