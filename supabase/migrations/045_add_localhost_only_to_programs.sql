-- Migration: Add localhost_only field to programs
-- Description: Adiciona campo para marcar programas como apenas localhost para debug

-- Adicionar coluna localhost_only
ALTER TABLE programs 
ADD COLUMN IF NOT EXISTS localhost_only BOOLEAN DEFAULT FALSE;

-- Comentário explicativo
COMMENT ON COLUMN programs.localhost_only IS 'Quando true, permite acesso local sem pagamento para debug';

-- Criar índice para performance (opcional, mas útil se houver muitos programas)
CREATE INDEX IF NOT EXISTS idx_programs_localhost_only ON programs(localhost_only) WHERE localhost_only = true;
