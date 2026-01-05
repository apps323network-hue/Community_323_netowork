-- Migration 007: Add image_url to events table
-- Adiciona campo image_url na tabela events para suportar banners/imagens de eventos

-- ============================================
-- ADICIONAR CAMPO image_url NA TABELA events
-- ============================================
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Comentário para documentação
COMMENT ON COLUMN public.events.image_url IS 'URL da imagem/banner do evento (armazenada no Supabase Storage)';







