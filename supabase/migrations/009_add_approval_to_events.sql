-- Migration 009: Add approval fields to events
-- Adiciona campos de aprovação na tabela events
-- Data: 2024

-- Adicionar coluna status
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' 
  CHECK (status IN ('pending', 'approved', 'rejected'));

-- Adicionar coluna partner_id (opcional, para vincular a empresa parceira)
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES public.partners(id) ON DELETE SET NULL;

-- Adicionar colunas de aprovação
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Criar índices para performance em queries de aprovação
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_partner_id ON public.events(partner_id);
CREATE INDEX IF NOT EXISTS idx_events_approved_by ON public.events(approved_by);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);

-- Comentários nas colunas
COMMENT ON COLUMN public.events.status IS 'Status do evento: pending (aguardando aprovação), approved (aprovado), rejected (rejeitado)';
COMMENT ON COLUMN public.events.partner_id IS 'ID da empresa parceira que criou o evento (opcional)';
COMMENT ON COLUMN public.events.approved_by IS 'ID do usuário admin que aprovou o evento';
COMMENT ON COLUMN public.events.approved_at IS 'Data/hora da aprovação do evento';
COMMENT ON COLUMN public.events.rejection_reason IS 'Motivo da rejeição do evento (se aplicável)';

-- Atualizar status padrão para eventos existentes (apenas se status for NULL)
-- Eventos criados antes do sistema de aprovação serão marcados como 'approved'
UPDATE public.events 
SET status = 'approved' 
WHERE status IS NULL;

