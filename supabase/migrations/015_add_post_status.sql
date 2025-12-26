-- Migration 015: Add post status fields to posts
-- Adiciona campos de status e moderação na tabela posts
-- Data: 2024

-- Adicionar coluna status
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' 
  CHECK (status IN ('pending', 'approved', 'hidden', 'removed', 'spam'));

-- Adicionar colunas de aprovação
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Adicionar colunas de moderação
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS strikes_added BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ;

-- Criar índices para performance em queries de status
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_approved_by ON public.posts(approved_by);
CREATE INDEX IF NOT EXISTS idx_posts_moderated_by ON public.posts(moderated_by);

-- Comentários nas colunas
COMMENT ON COLUMN public.posts.status IS 'Status do post: pending (aguardando aprovação), approved (aprovado), hidden (oculto), removed (removido), spam';
COMMENT ON COLUMN public.posts.approved_by IS 'ID do usuário admin que aprovou o post';
COMMENT ON COLUMN public.posts.approved_at IS 'Data/hora da aprovação do post';
COMMENT ON COLUMN public.posts.rejection_reason IS 'Motivo da remoção/ocultação do post (se aplicável)';
COMMENT ON COLUMN public.posts.strikes_added IS 'Indica se foi adicionado strike ao autor do post';
COMMENT ON COLUMN public.posts.moderated_by IS 'ID do usuário admin que moderou o post (ocultar/remover/spam)';
COMMENT ON COLUMN public.posts.moderated_at IS 'Data/hora da moderação do post';

-- Atualizar status padrão para posts existentes (apenas se status for NULL)
-- Posts criados antes do sistema de aprovação serão marcados como 'approved'
UPDATE public.posts 
SET status = 'approved',
    strikes_added = FALSE
WHERE status IS NULL;

