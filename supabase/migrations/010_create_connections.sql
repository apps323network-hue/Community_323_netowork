-- Migration 010: Create Connections Table
-- Cria tabela de conexões para networking
-- Data: 2025-12-26

-- Criar enum para status da conexão
DO $$ BEGIN
    CREATE TYPE connection_status AS ENUM ('pending', 'accepted', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Criar tabela connections
CREATE TABLE IF NOT EXISTS public.connections (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    requester_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    responder_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status connection_status DEFAULT 'pending' NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    -- Garantir que não existam conexões duplicadas entre o mesmo par
    -- (A -> B) deve ser único. O sistema deve tratar (B -> A) como a mesma conexão?
    -- Modelo LinkedIn: A pede p/ B. Existe um registro. Se B aceita, vira 'accepted'.
    -- Para evitar duplicação (A pede B, e B pede A simultaneamente), idealmente checamos ambos.
    -- Vamos usar uma constraint simples de request único por direção por enquanto.
    UNIQUE(requester_id, responder_id),
    -- Requerente não pode ser o respondente
    CHECK (requester_id <> responder_id)
);

-- Habilitar RLS
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- Policies

-- 1. Leitura: Usuários podem ver suas próprias conexões (enviadas ou recebidas)
CREATE POLICY "Usuários podem ver suas próprias conexões"
ON public.connections
FOR SELECT
TO authenticated
USING (
    auth.uid() = requester_id OR 
    auth.uid() = responder_id
);

-- 2. Inserção: Usuários autenticados podem enviar solicitações (criar)
-- O requester_id deve ser o próprio usuário
CREATE POLICY "Usuários podem criar solicitações de conexão"
ON public.connections
FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = requester_id
);

-- 3. Atualização: Usuários podem responder (atualizar status) a solicitações recebidas
-- OU o próprio requester pode cancelar (talvez via delete, mas update também ok)
CREATE POLICY "Usuários podem responder a solicitações"
ON public.connections
FOR UPDATE
TO authenticated
USING (
    auth.uid() = responder_id OR -- Quem recebe aceita/rejeita
    auth.uid() = requester_id    -- Quem enviou pode alterar algo? Geralmente delete.
);

-- 4. Deleção: Usuários podem remover conexões ou cancelar solicitações
CREATE POLICY "Usuários podem deletar conexões"
ON public.connections
FOR DELETE
TO authenticated
USING (
    auth.uid() = requester_id OR 
    auth.uid() = responder_id
);

-- Trigger para updated_at
CREATE TRIGGER update_connections_updated_at
    BEFORE UPDATE ON public.connections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
