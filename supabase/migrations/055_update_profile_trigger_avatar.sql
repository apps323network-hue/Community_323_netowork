-- Migration 055: Update Profile Trigger to include avatar_url
-- Atualiza o trigger para incluir o campo avatar_url do user_metadata (Google photo) e melhor detecção de nome

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, area_atuacao, status, strikes, plano, badge, phone, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'nome',
      NEW.raw_user_meta_data->>'full_name', -- Padrão Google/OAuth
      NEW.raw_user_meta_data->>'name',      -- Fallback comum
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
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture') -- Capture Google Photo / picture
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
    avatar_url = COALESCE(EXCLUDED.avatar_url, COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.handle_new_user() IS 'Cria ou atualiza profile automaticamente incluindo avatar_url e full_name do provedor OAuth';
