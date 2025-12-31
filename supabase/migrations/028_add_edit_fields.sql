-- Migration 028: Add edit fields to posts and comments
-- Adiciona campo edited_at para rastrear quando posts/comentários foram editados
-- Data: 2025

-- Adicionar edited_at na tabela posts
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;

-- Adicionar edited_at na tabela post_comments
ALTER TABLE public.post_comments 
ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;

-- Criar índices para performance (opcional, mas recomendado)
CREATE INDEX IF NOT EXISTS idx_posts_edited_at ON public.posts(edited_at) WHERE edited_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_post_comments_edited_at ON public.post_comments(edited_at) WHERE edited_at IS NOT NULL;

