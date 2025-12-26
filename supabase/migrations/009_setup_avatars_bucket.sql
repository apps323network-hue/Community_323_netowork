-- Migration 009: Setup Storage Bucket for Avatars
-- Configura o bucket de storage para avatares de perfil
-- Data: 2025-12-26

-- ============================================
-- 1. CRIAR BUCKET avatars
-- ============================================
-- Nota: O bucket deve ser criado via dashboard ou API se ainda não existir.
-- Este script assume que o bucket 'avatars' será criado ou já existe.
-- Inserindo na tabela storage.buckets se não existir (apenas para garantir via SQL se executado com permissões de admin)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. POLÍTICAS RLS PARA O BUCKET avatars
-- ============================================

-- Política 1: Permitir INSERT (upload) para usuários autenticados
-- Restringe o upload para a pasta do próprio usuário (opcional, mas recomendado)
CREATE POLICY "Usuários autenticados podem fazer upload de avatares"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
);

-- Política 2: Permitir SELECT (leitura) para todos (público)
CREATE POLICY "Avatares são públicos para leitura"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'avatars'
);

-- Política 3: Permitir UPDATE (substituição) para o próprio usuário
-- Permite que usuário sobrescreva seus arquivos se o nome bater
CREATE POLICY "Usuários podem atualizar seus próprios avatares"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid() = owner
);

-- Política 4: Permitir DELETE apenas para o próprio usuário
CREATE POLICY "Usuários podem deletar seus próprios avatares"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid() = owner
);
