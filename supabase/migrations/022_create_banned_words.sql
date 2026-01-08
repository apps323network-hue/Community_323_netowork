-- Migration 022: Create Banned Words System
-- Cria tabela e políticas RLS para sistema de palavras proibidas
-- Data: 2025-01-29

-- ============================================
-- CRIAR TABELA banned_words
-- ============================================
CREATE TABLE IF NOT EXISTS public.banned_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('spam', 'ofensivo', 'outro')),
  action TEXT NOT NULL CHECK (action IN ('block', 'warn', 'replace')),
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_banned_words_word ON public.banned_words(word);
CREATE INDEX IF NOT EXISTS idx_banned_words_category ON public.banned_words(category);
CREATE INDEX IF NOT EXISTS idx_banned_words_action ON public.banned_words(action);

-- Comentários
COMMENT ON TABLE public.banned_words IS 'Tabela de palavras e frases proibidas para moderação automática';
COMMENT ON COLUMN public.banned_words.word IS 'Palavra ou frase proibida (case-insensitive)';
COMMENT ON COLUMN public.banned_words.category IS 'Categoria: spam, ofensivo, outro';
COMMENT ON COLUMN public.banned_words.action IS 'Ação: block (bloquear), warn (avisar/pending), replace (substituir)';
COMMENT ON COLUMN public.banned_words.created_by IS 'Admin que criou a palavra proibida';

-- ============================================
-- FUNÇÃO PARA ATUALIZAR updated_at
-- ============================================
CREATE OR REPLACE FUNCTION public.update_banned_words_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_banned_words_updated_at
  BEFORE UPDATE ON public.banned_words
  FOR EACH ROW
  EXECUTE FUNCTION public.update_banned_words_updated_at();

-- ============================================
-- HABILITAR RLS
-- ============================================
ALTER TABLE public.banned_words ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS RLS
-- ============================================

-- SELECT: Público pode ler (necessário para verificação)
CREATE POLICY "Banned words are publicly readable for verification"
  ON public.banned_words FOR SELECT
  TO public
  USING (true);

-- INSERT: Apenas admins podem criar
CREATE POLICY "Only admins can create banned words"
  ON public.banned_words FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- UPDATE: Apenas admins podem atualizar
CREATE POLICY "Only admins can update banned words"
  ON public.banned_words FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- DELETE: Apenas admins podem deletar
CREATE POLICY "Only admins can delete banned words"
  ON public.banned_words FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Comentários nas políticas
COMMENT ON POLICY "Banned words are publicly readable for verification" ON public.banned_words IS 
'Permite que qualquer pessoa leia palavras proibidas para verificação de conteúdo';

COMMENT ON POLICY "Only admins can create banned words" ON public.banned_words IS 
'Permite que apenas admins criem palavras proibidas';

COMMENT ON POLICY "Only admins can update banned words" ON public.banned_words IS 
'Permite que apenas admins atualizem palavras proibidas';

COMMENT ON POLICY "Only admins can delete banned words" ON public.banned_words IS 
'Permite que apenas admins deletem palavras proibidas';







