-- Migration 019: Add RLS policies for services management (admin only)
-- Adiciona políticas RLS para permitir que admins gerenciem serviços
-- Data: 2024

-- ============================================
-- POLÍTICAS RLS PARA SERVICES
-- ============================================

-- INSERT: Apenas admins podem criar serviços
CREATE POLICY "Admins can create services"
  ON public.services FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- UPDATE: Apenas admins podem atualizar serviços
CREATE POLICY "Admins can update services"
  ON public.services FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- DELETE: Apenas admins podem deletar serviços
CREATE POLICY "Admins can delete services"
  ON public.services FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );


