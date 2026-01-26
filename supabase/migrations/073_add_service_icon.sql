-- Migration 073: Add icon column to services
-- Adiciona coluna para ícone do serviço (Material Symbols)
-- Data: 2026-01-26

ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS icon TEXT;

COMMENT ON COLUMN public.services.icon IS 'Nome do ícone (Material Symbols) para o serviço';
