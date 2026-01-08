-- Migration 039: Add external service fields for SSO integration
-- Adiciona campos para identificar e configurar serviços externos com SSO
-- Data: 2026-01-02

-- ============================================
-- ADICIONAR CAMPOS PARA SERVIÇOS EXTERNOS
-- ============================================
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS is_external BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS external_url TEXT,
ADD COLUMN IF NOT EXISTS sso_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sso_callback_path TEXT DEFAULT '/auth/callback';

-- ============================================
-- COMENTÁRIOS
-- ============================================
COMMENT ON COLUMN public.services.is_external IS 'Identifica se o serviço é externo (não gerenciado pelo 323 Network)';
COMMENT ON COLUMN public.services.external_url IS 'URL base do serviço externo (ex: https://matriculausa.com)';
COMMENT ON COLUMN public.services.sso_enabled IS 'Se SSO está habilitado para este serviço externo';
COMMENT ON COLUMN public.services.sso_callback_path IS 'Caminho de callback no serviço externo para receber token SSO (ex: /auth/callback)';

-- ============================================
-- ÍNDICES (opcional, para performance)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_services_is_external ON public.services(is_external) WHERE is_external = TRUE;
CREATE INDEX IF NOT EXISTS idx_services_sso_enabled ON public.services(sso_enabled) WHERE sso_enabled = TRUE;




