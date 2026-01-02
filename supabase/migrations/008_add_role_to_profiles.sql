-- Migration 008: Add role to profiles
-- Adiciona o campo role na tabela profiles para sistema de permissões
-- Data: 2024

-- Adicionar coluna role
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' 
  CHECK (role IN ('user', 'partner', 'admin'));

-- Criar índice para performance em queries de role
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Comentário na coluna
COMMENT ON COLUMN public.profiles.role IS 'Role do usuário: user (padrão), partner (empresa parceira), admin (administrador)';

-- Atualizar role padrão para usuários existentes (se necessário)
-- Por padrão, todos os usuários existentes terão role='user' devido ao DEFAULT






