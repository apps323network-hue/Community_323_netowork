-- Migration 010: Update RLS policies for events approval system
-- Atualiza as políticas RLS para o sistema de aprovação de eventos
-- Data: 2024

-- Remover políticas antigas de events
DROP POLICY IF EXISTS "Events are viewable by everyone" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can create events" ON public.events;
DROP POLICY IF EXISTS "Users can update own events" ON public.events;
DROP POLICY IF EXISTS "Users can delete own events" ON public.events;

-- ============================================
-- NOVAS POLÍTICAS RLS PARA EVENTS
-- ============================================

-- SELECT: Todos podem ver apenas eventos aprovados
-- Admin pode ver todos os eventos (aprovados e pendentes)
CREATE POLICY "Events are viewable by everyone (approved only)"
  ON public.events FOR SELECT
  USING (
    status = 'approved' 
    OR 
    (auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    ))
  );

-- INSERT: Usuários autenticados podem criar eventos
-- Sempre com status='pending'
CREATE POLICY "Authenticated users can create events"
  ON public.events FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND status = 'pending'  -- Garantir que sempre cria como pending
  );

-- UPDATE: 
-- - Criador pode editar apenas se status='pending'
-- - Admin pode aprovar/rejeitar qualquer evento
CREATE POLICY "Users can update own pending events"
  ON public.events FOR UPDATE
  USING (
    auth.uid() = created_by 
    AND status = 'pending'
  )
  WITH CHECK (
    auth.uid() = created_by 
    AND status = 'pending'  -- Criador não pode mudar status
  );

-- Política separada para admin aprovar/rejeitar
CREATE POLICY "Admins can approve or reject events"
  ON public.events FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    )
  );

-- DELETE: Apenas admin ou criador (se pendente)
CREATE POLICY "Users can delete own pending events or admin can delete any"
  ON public.events FOR DELETE
  USING (
    (auth.uid() = created_by AND status = 'pending')
    OR
    (auth.uid() IN (
      SELECT id FROM public.profiles WHERE role = 'admin'
    ))
  );










