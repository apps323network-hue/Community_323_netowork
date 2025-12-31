-- Migration 029: Post Mentions
-- Cria tabela para armazenar menções de usuários em posts e comentários
-- Data: 2025

-- ============================================
-- POST MENTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS public.post_mentions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE,
  mentioned_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mentioned_by_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Garantir que ou post_id ou comment_id seja preenchido, mas não ambos
  CONSTRAINT check_post_or_comment CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL)
  )
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_post_mentions_post_id ON public.post_mentions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_mentions_comment_id ON public.post_mentions(comment_id);
CREATE INDEX IF NOT EXISTS idx_post_mentions_mentioned_user_id ON public.post_mentions(mentioned_user_id);
CREATE INDEX IF NOT EXISTS idx_post_mentions_mentioned_by_user_id ON public.post_mentions(mentioned_by_user_id);

-- Habilitar RLS
ALTER TABLE public.post_mentions ENABLE ROW LEVEL SECURITY;

-- SELECT: Usuários podem ver menções relacionadas a posts/comentários que podem ver
CREATE POLICY "Users can view mentions for visible posts"
  ON public.post_mentions FOR SELECT
  USING (
    -- Se for menção em post, verificar se pode ver o post
    (post_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = post_mentions.post_id
      AND (
        p.status = 'approved' OR
        p.user_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
      )
    )) OR
    -- Se for menção em comentário, verificar se pode ver o comentário
    (comment_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.post_comments pc
      WHERE pc.id = post_mentions.comment_id
      AND (
        pc.status = 'approved' OR
        pc.user_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
      )
    ))
  );

-- INSERT: Usuários autenticados podem criar menções
CREATE POLICY "Authenticated users can create mentions"
  ON public.post_mentions FOR INSERT
  WITH CHECK (auth.uid() = mentioned_by_user_id);

-- DELETE: Usuário pode remover suas próprias menções (ou admin)
CREATE POLICY "Users can delete own mentions"
  ON public.post_mentions FOR DELETE
  USING (
    auth.uid() = mentioned_by_user_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

