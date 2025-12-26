-- Migration 014: Update Profile Trigger to set status and strikes
-- Atualiza o trigger para definir status='pending' e strikes=0 por padrão
-- Data: 2024

-- ============================================
-- ATUALIZAR FUNÇÃO handle_new_user
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, area_atuacao, status, strikes, plano, badge)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'role',
    'pending',  -- Novo usuário começa como pendente
    0,          -- Sem strikes inicialmente
    'Free',
    'Free'
  )
  ON CONFLICT (id) DO UPDATE SET
    area_atuacao = COALESCE(EXCLUDED.area_atuacao, NEW.raw_user_meta_data->>'role'),
    nome = COALESCE(EXCLUDED.nome, COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)));
    -- Não atualizar status e strikes no ON CONFLICT para preservar valores existentes
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMENTÁRIOS
-- ============================================
COMMENT ON FUNCTION public.handle_new_user() IS 'Cria ou atualiza profile automaticamente quando novo usuário é criado em auth.users, definindo status=pending e strikes=0 por padrão';

