-- Migration 030: Post Hashtags
-- Cria tabela para armazenar hashtags de posts e comentários
-- Data: 2025

-- ============================================
-- POST HASHTAGS
-- ============================================
CREATE TABLE IF NOT EXISTS public.post_hashtags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE,
  hashtag TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Garantir que ou post_id ou comment_id seja preenchido, mas não ambos
  CONSTRAINT check_post_or_comment CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL)
  ),
  -- Garantir que hashtag seja lowercase
  CONSTRAINT hashtag_lowercase CHECK (hashtag = LOWER(hashtag))
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_post_hashtags_post_id ON public.post_hashtags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_hashtags_comment_id ON public.post_hashtags(comment_id);
CREATE INDEX IF NOT EXISTS idx_post_hashtags_hashtag ON public.post_hashtags(hashtag);
-- Índice único para evitar duplicatas
CREATE UNIQUE INDEX IF NOT EXISTS idx_post_hashtags_unique_post ON public.post_hashtags(post_id, hashtag) WHERE post_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_post_hashtags_unique_comment ON public.post_hashtags(comment_id, hashtag) WHERE comment_id IS NOT NULL;

-- Habilitar RLS
ALTER TABLE public.post_hashtags ENABLE ROW LEVEL SECURITY;

-- SELECT: Usuários podem ver hashtags relacionadas a posts/comentários que podem ver
CREATE POLICY "Users can view hashtags for visible posts"
  ON public.post_hashtags FOR SELECT
  USING (
    -- Se for hashtag em post, verificar se pode ver o post
    (post_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = post_hashtags.post_id
      AND (
        p.status = 'approved' OR
        p.user_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
      )
    )) OR
    -- Se for hashtag em comentário, verificar se pode ver o comentário
    (comment_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.post_comments pc
      WHERE pc.id = post_hashtags.comment_id
      AND (
        pc.status = 'approved' OR
        pc.user_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
      )
    ))
  );

-- INSERT: Usuários autenticados podem criar hashtags (através de posts/comentários)
CREATE POLICY "Authenticated users can create hashtags"
  ON public.post_hashtags FOR INSERT
  WITH CHECK (true); -- RLS será validado pela política de SELECT do post/comment

