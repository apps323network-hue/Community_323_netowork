-- Migration 008: Extend Profiles
-- Adiciona campos necessários para o novo design de perfil
-- Data: 2024-12-26

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS instagram TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS goals TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS job_notifications BOOLEAN DEFAULT FALSE;

-- Comentários para documentação
COMMENT ON COLUMN public.profiles.bio IS 'Resumo profissional do usuário';
COMMENT ON COLUMN public.profiles.instagram IS 'Link ou handle do Instagram';
COMMENT ON COLUMN public.profiles.tags IS 'Interesses e especialidades (array de tags)';
COMMENT ON COLUMN public.profiles.goals IS 'Objetivos profissionais na comunidade';
COMMENT ON COLUMN public.profiles.is_public IS 'Define se o perfil é visível para não-membros';
COMMENT ON COLUMN public.profiles.job_notifications IS 'Preferência de recebimento de notificações de vagas';
