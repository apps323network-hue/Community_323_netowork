-- Migration 012: Add user status fields to profiles
-- Adiciona campos de status e aprovação na tabela profiles
-- Data: 2024

-- Adicionar coluna status
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' 
  CHECK (status IN ('pending', 'active', 'suspended', 'banned'));

-- Adicionar colunas de aprovação
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Adicionar coluna strikes (contador de strikes)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS strikes INTEGER DEFAULT 0;

-- Adicionar coluna suspended_until (data de expiração da suspensão)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS suspended_until TIMESTAMPTZ;

-- Criar índices para performance em queries de status
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_approved_by ON public.profiles(approved_by);
CREATE INDEX IF NOT EXISTS idx_profiles_strikes ON public.profiles(strikes);

-- Comentários nas colunas
COMMENT ON COLUMN public.profiles.status IS 'Status do usuário: pending (aguardando aprovação), active (ativo), suspended (suspenso), banned (banido)';
COMMENT ON COLUMN public.profiles.approved_by IS 'ID do usuário admin que aprovou o membro';
COMMENT ON COLUMN public.profiles.approved_at IS 'Data/hora da aprovação do membro';
COMMENT ON COLUMN public.profiles.rejection_reason IS 'Motivo da rejeição do membro (se aplicável)';
COMMENT ON COLUMN public.profiles.strikes IS 'Contador de strikes do usuário (3 strikes = ban automático)';
COMMENT ON COLUMN public.profiles.suspended_until IS 'Data de expiração da suspensão (NULL se não suspenso ou banido permanentemente)';

-- Atualizar status padrão para usuários existentes (apenas se status for NULL)
-- Usuários criados antes do sistema de aprovação serão marcados como 'active'
UPDATE public.profiles 
SET status = 'active',
    strikes = 0
WHERE status IS NULL;

