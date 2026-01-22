-- ============================================
-- Add Parcelow fields to service_payments
-- ============================================

-- Adicionar campos Parcelow à tabela service_payments
ALTER TABLE public.service_payments
ADD COLUMN IF NOT EXISTS parcelow_order_id TEXT,
ADD COLUMN IF NOT EXISTS parcelow_checkout_url TEXT,
ADD COLUMN IF NOT EXISTS parcelow_status TEXT,
ADD COLUMN IF NOT EXISTS parcelow_status_code INTEGER;

-- Índice para busca por parcelow_order_id
CREATE INDEX IF NOT EXISTS idx_service_payments_parcelow_order_id 
ON public.service_payments(parcelow_order_id);

-- Adicionar CPF/documento aos perfis
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS document_number VARCHAR(20);

-- Comentários
COMMENT ON COLUMN public.profiles.document_number IS 'CPF/Documento (obrigatório para Parcelow)';
COMMENT ON COLUMN public.service_payments.parcelow_order_id IS 'ID da order na Parcelow API';
COMMENT ON COLUMN public.service_payments.parcelow_checkout_url IS 'URL do checkout Parcelow';
COMMENT ON COLUMN public.service_payments.parcelow_status IS 'Status textual (Open, Paid, Declined)';
COMMENT ON COLUMN public.service_payments.parcelow_status_code IS 'Código numérico (0=Open, 1=Paid)';
