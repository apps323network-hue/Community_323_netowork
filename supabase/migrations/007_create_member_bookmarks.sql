-- Migration 007: Member Bookmarks
-- Cria tabela para armazenar bookmarks de membros (membros em destaque)
-- Data: 2024

-- ============================================
-- MEMBER BOOKMARKS
-- ============================================
CREATE TABLE IF NOT EXISTS public.member_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  member_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, member_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_member_bookmarks_user_id ON public.member_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_member_bookmarks_member_id ON public.member_bookmarks(member_id);

-- Habilitar RLS
ALTER TABLE public.member_bookmarks ENABLE ROW LEVEL SECURITY;

-- SELECT: Usuário pode ver seus próprios bookmarks
CREATE POLICY "Users can view own bookmarks"
  ON public.member_bookmarks FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Usuários autenticados podem criar bookmarks
CREATE POLICY "Authenticated users can create bookmarks"
  ON public.member_bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Usuário pode remover seus próprios bookmarks
CREATE POLICY "Users can delete own bookmarks"
  ON public.member_bookmarks FOR DELETE
  USING (auth.uid() = user_id);



