-- Migration 041: Corrigir nome do serviço de "Matrícula US" para "MatrículaUSA"
-- Data: 2026-01-02

UPDATE public.services
SET nome = 'MatrículaUSA',
    updated_at = NOW()
WHERE nome = 'Matrícula US' AND is_external = true;

-- Verificar se a atualização foi bem-sucedida
SELECT id, nome, is_external, external_url, sso_enabled
FROM public.services
WHERE nome = 'MatrículaUSA' AND is_external = true;




