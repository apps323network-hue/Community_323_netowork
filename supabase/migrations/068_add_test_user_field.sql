-- Migration 068: Add test user field and mark @uorak users
-- Adiciona campo is_test_user e marca automaticamente usuários com email @uorak como test users

-- 1. Adicionar coluna is_test_user
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_test_user BOOLEAN DEFAULT FALSE;

-- 2. Marcar usuários existentes com email @uorak
UPDATE public.profiles p
SET is_test_user = TRUE
FROM auth.users u
WHERE p.id = u.id
  AND u.email LIKE '%@uorak%';

-- 3. Criar índice para melhor performance nas queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_test_user ON public.profiles(is_test_user);

-- 4. Atualizar trigger handle_new_user para marcar novos usuários @uorak automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, area_atuacao, status, strikes, plano, badge, phone, avatar_url, is_test_user)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'nome',
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      CASE
        WHEN NEW.raw_user_meta_data->>'firstName' IS NOT NULL
        THEN NEW.raw_user_meta_data->>'firstName' || ' ' || COALESCE(NEW.raw_user_meta_data->>'lastName', '')
        ELSE split_part(NEW.email, '@', 1)
      END
    ),
    NEW.raw_user_meta_data->>'role',
    'pending',
    0,
    'Free',
    'Free',
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    CASE WHEN NEW.email LIKE '%@uorak%' THEN TRUE ELSE FALSE END -- Marcar como test user se email for @uorak
  )
  ON CONFLICT (id) DO UPDATE SET
    area_atuacao = COALESCE(EXCLUDED.area_atuacao, NEW.raw_user_meta_data->>'role'),
    nome = COALESCE(EXCLUDED.nome, COALESCE(
      NEW.raw_user_meta_data->>'nome',
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      CASE
        WHEN NEW.raw_user_meta_data->>'firstName' IS NOT NULL
        THEN NEW.raw_user_meta_data->>'firstName' || ' ' || COALESCE(NEW.raw_user_meta_data->>'lastName', '')
        ELSE split_part(NEW.email, '@', 1)
      END
    )),
    phone = COALESCE(EXCLUDED.phone, NEW.raw_user_meta_data->>'phone'),
    avatar_url = COALESCE(EXCLUDED.avatar_url, COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')),
    is_test_user = CASE WHEN NEW.email LIKE '%@uorak%' THEN TRUE ELSE COALESCE(EXCLUDED.is_test_user, FALSE) END; -- Atualizar is_test_user baseado no email
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON COLUMN public.profiles.is_test_user IS 'Indica se o usuário é um usuário de teste (email @uorak). Usuários de teste não aparecem em produção.';
COMMENT ON FUNCTION public.handle_new_user() IS 'Cria ou atualiza profile automaticamente incluindo avatar_url, full_name do provedor OAuth e marca is_test_user para emails @uorak';
