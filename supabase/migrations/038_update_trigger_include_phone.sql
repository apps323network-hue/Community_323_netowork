-- Migration 038: Update Profile Trigger to include phone field
-- Atualiza o trigger para incluir o campo phone do user_metadata
-- Data: 2026-01-02

-- ============================================
-- ATUALIZAR FUNÇÃO handle_new_user
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, area_atuacao, status, strikes, plano, badge, phone)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'nome',
      CASE 
        WHEN NEW.raw_user_meta_data->>'firstName' IS NOT NULL 
        THEN NEW.raw_user_meta_data->>'firstName' || ' ' || COALESCE(NEW.raw_user_meta_data->>'lastName', '')
        ELSE split_part(NEW.email, '@', 1)
      END
    ),
    NEW.raw_user_meta_data->>'role',
    'pending',  -- Novo usuário começa como pendente
    0,          -- Sem strikes inicialmente
    'Free',
    'Free',
    NEW.raw_user_meta_data->>'phone'  -- Incluir phone do user_metadata
  )
  ON CONFLICT (id) DO UPDATE SET
    area_atuacao = COALESCE(EXCLUDED.area_atuacao, NEW.raw_user_meta_data->>'role'),
    nome = COALESCE(EXCLUDED.nome, COALESCE(
      NEW.raw_user_meta_data->>'nome',
      CASE 
        WHEN NEW.raw_user_meta_data->>'firstName' IS NOT NULL 
        THEN NEW.raw_user_meta_data->>'firstName' || ' ' || COALESCE(NEW.raw_user_meta_data->>'lastName', '')
        ELSE split_part(NEW.email, '@', 1)
      END
    )),
    phone = COALESCE(EXCLUDED.phone, NEW.raw_user_meta_data->>'phone');
    -- Não atualizar status e strikes no ON CONFLICT para preservar valores existentes
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMENTÁRIOS
-- ============================================
COMMENT ON FUNCTION public.handle_new_user() IS 'Cria ou atualiza profile automaticamente quando novo usuário é criado em auth.users, definindo status=pending, strikes=0 e incluindo phone do user_metadata';

